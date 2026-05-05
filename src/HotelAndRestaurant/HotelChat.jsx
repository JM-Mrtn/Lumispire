import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function normalizeHotelApiBase() {
  const raw =
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/hotel";

  const cleaned = String(raw).replace(/\/+$/, "");

  if (cleaned.endsWith("/api/hotel")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/hotel`;
  return `${cleaned}/api/hotel`;
}

const API_BASE = normalizeHotelApiBase();
const SOCKET_BASE = API_BASE.replace(/\/api\/hotel$/i, "").replace(/\/api$/i, "");

const CONCERNS = [
  {
    id: "reschedule",
    label: "Reschedule",
    icon: "📅",
    description: "Change the date or time of your booking.",
  },
  {
    id: "cancel",
    label: "Cancel",
    icon: "❌",
    description: "Request cancellation for your booking.",
  },
  {
    id: "others",
    label: "Others",
    icon: "💬",
    description: "Ask about packages, payment, rooms, or other concerns.",
  },
];

const DEFAULT_FORMS = {
  reschedule: {
    bookingType: "",
    bookingId: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
  },
  cancel: {
    bookingType: "",
    bookingId: "",
    bookingDate: "",
    reason: "",
  },
  others: {
    subject: "",
    details: "",
  },
};

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function formatTime(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString("en-PH", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) return "No date";

  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return value;
  }
}

function peso(value) {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });
}

function addMessageWithoutDuplicate(prevMessages, newMessage) {
  if (!newMessage) return prevMessages;

  const newId = String(newMessage._id || "");

  if (newId) {
    const alreadyExists = prevMessages.some(
      (msg) => String(msg._id || "") === newId
    );

    if (alreadyExists) return prevMessages;
  }

  return [...prevMessages, newMessage];
}

function addMessagesWithoutDuplicate(prevMessages, newMessages = []) {
  return newMessages.reduce((current, msg) => {
    return addMessageWithoutDuplicate(current, msg);
  }, prevMessages);
}

function getConcernLabel(type) {
  return CONCERNS.find((item) => item.id === type)?.label || "Concern";
}

function buildConcernMessage(type, details = {}) {
  const label = getConcernLabel(type);

  if (type === "reschedule") {
    return [
      `Concern/Need: ${label}`,
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Requested Date: ${details.requestedDate || "Not provided"}`,
      `Requested Time: ${details.requestedTime || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  if (type === "cancel") {
    return [
      `Concern/Need: ${label}`,
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Booking Date: ${details.bookingDate || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  return [
    `Concern/Need: ${label}`,
    `Subject: ${details.subject || "Not provided"}`,
    `Details: ${details.details || "Not provided"}`,
  ].join("\n");
}

function isBotMessage(msg) {
  return msg?.senderRole === "bot" || msg?.isAutoReply === true;
}

function isStaffMessage(msg) {
  return msg?.senderRole === "admin" || msg?.senderRole === "bot";
}

function shouldShowFaqButton(msg) {
  return msg?.autoReplyKind === "after_hours";
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder = "", type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240]"
    />
  );
}

function Select({ value, onChange, children, disabled = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </select>
  );
}

function normalizeBookingOption(type, booking) {
  const id = String(booking?._id || "");
  if (!id) return null;

  if (type === "resort") {
    return {
      id,
      bookingType: "Resort & Venue",
      bookingTitle: booking.venue || "Resort & Venue Booking",
      bookingDate: booking.date || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.price || 0,
      raw: booking,
      label: `${booking.venue || "Resort & Venue"} • ${formatDate(
        booking.date
      )} • ${booking.status || "NO STATUS"} • ${id}`,
    };
  }

  if (type === "event") {
    return {
      id,
      bookingType: "Event Package",
      bookingTitle: booking.eventPackage || "Event Package Booking",
      bookingDate: booking.eventDate || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.totalAmount || 0,
      raw: booking,
      label: `${booking.eventPackage || "Event Package"} • ${formatDate(
        booking.eventDate
      )} • ${booking.status || "NO STATUS"} • ${id}`,
    };
  }

  return {
    id,
    bookingType: "Hotel Room",
    bookingTitle: `${booking.roomType || "Hotel Room"}${
      booking.duration ? ` - ${booking.duration}` : ""
    }`,
    bookingDate: booking.date || "",
    bookingTime: booking.time || "",
    status: booking.status || "",
    amount: booking.price || 0,
    raw: booking,
    label: `${booking.roomType || "Hotel Room"} ${
      booking.duration || ""
    } • ${formatDate(booking.date)} • ${booking.status || "NO STATUS"} • ${id}`,
  };
}

export default function HotelChat() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedConcern, setSelectedConcern] = useState("");
  const [concernForm, setConcernForm] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const token = getHotelToken();

  const selectedBooking = useMemo(() => {
    return myBookings.find((item) => item.id === concernForm.bookingId) || null;
  }, [myBookings, concernForm.bookingId]);

  const hasSpecifiedConcern = messages.some((msg) =>
    ["reschedule", "cancel", "others"].includes(String(msg?.concernType || ""))
  );

  const canFreeChat = hasSpecifiedConcern && !selectedConcern;

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const goLogin = () => {
    navigate("/hotel-login", { replace: true });
  };

  const fetchMessages = async () => {
    if (!token) {
      goLogin();
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (res.status === 403) {
        setStatus({
          type: "error",
          message:
            data.message ||
            "You must be logged in and ID verified before using chat.",
        });
        setMessages([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load chat messages.");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      scrollToBottom();
    } catch (error) {
      console.error("fetchMessages error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to load chat.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;

    setLoadingBookings(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [resortRes, eventRes, hotelRes] = await Promise.all([
        fetch(`${API_BASE}/my-resort-bookings`, { headers }),
        fetch(`${API_BASE}/my-event-bookings`, { headers }),
        fetch(`${API_BASE}/my-hotel-room-bookings`, { headers }),
      ]);

      const [resortData, eventData, hotelData] = await Promise.all([
        resortRes.json().catch(() => []),
        eventRes.json().catch(() => []),
        hotelRes.json().catch(() => []),
      ]);

      const resortBookings = Array.isArray(resortData) ? resortData : [];
      const eventBookings = Array.isArray(eventData) ? eventData : [];
      const hotelBookings = Array.isArray(hotelData) ? hotelData : [];

      const normalized = [
        ...resortBookings
          .map((item) => normalizeBookingOption("resort", item))
          .filter(Boolean),
        ...eventBookings
          .map((item) => normalizeBookingOption("event", item))
          .filter(Boolean),
        ...hotelBookings
          .map((item) => normalizeBookingOption("hotel", item))
          .filter(Boolean),
      ].sort((a, b) => {
        const aDate = new Date(a.raw?.createdAt || a.bookingDate || 0).getTime();
        const bDate = new Date(b.raw?.createdAt || b.bookingDate || 0).getTime();
        return bDate - aDate;
      });

      setMyBookings(normalized);
    } catch (error) {
      console.error("fetchMyBookings error:", error);
      setStatus({
        type: "error",
        message:
          "Chat loaded, but your booking dropdown could not be loaded. Please refresh the page.",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const selectConcern = (type) => {
    setSelectedConcern(type);
    setConcernForm({ ...(DEFAULT_FORMS[type] || {}) });
    setStatus({ type: "", message: "" });

    if (type === "reschedule" || type === "cancel") {
      fetchMyBookings();
    }
  };

  const updateConcernForm = (field, value) => {
    setConcernForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookingSelect = (bookingId) => {
    const booking = myBookings.find((item) => item.id === bookingId);

    if (!booking) {
      setConcernForm((prev) => ({
        ...prev,
        bookingId: "",
        bookingType: "",
        bookingTitle: "",
        bookingDate: "",
      }));
      return;
    }

    setConcernForm((prev) => ({
      ...prev,
      bookingId: booking.id,
      bookingType: booking.bookingType,
      bookingTitle: booking.bookingTitle,
      bookingDate:
        selectedConcern === "cancel" ? booking.bookingDate || prev.bookingDate : prev.bookingDate,
    }));
  };

  const validateConcernForm = () => {
    if (!selectedConcern) return "Please choose your concern first.";

    if (selectedConcern === "reschedule") {
      if (!concernForm.bookingType) return "Please select a booking.";
      if (!String(concernForm.bookingId || "").trim()) {
        return "Please select your Booking ID.";
      }
      if (!concernForm.requestedDate) {
        return "Please enter your requested new date.";
      }
      if (!String(concernForm.requestedTime || "").trim()) {
        return "Please enter your requested time.";
      }
      if (!String(concernForm.reason || "").trim()) {
        return "Please enter your reason.";
      }
    }

    if (selectedConcern === "cancel") {
      if (!concernForm.bookingType) return "Please select a booking.";
      if (!String(concernForm.bookingId || "").trim()) {
        return "Please select your Booking ID.";
      }
      if (!String(concernForm.reason || "").trim()) {
        return "Please enter your cancellation reason.";
      }
    }

    if (selectedConcern === "others") {
      if (!String(concernForm.subject || "").trim()) {
        return "Please enter your subject.";
      }
      if (!String(concernForm.details || "").trim()) {
        return "Please enter your concern details.";
      }
    }

    return "";
  };

  const submitConcernInquiry = async (e) => {
    e?.preventDefault();

    if (sendingInquiry) return;

    const error = validateConcernForm();

    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    setSendingInquiry(true);
    setStatus({ type: "", message: "" });

    try {
      const detailsToSend = {
        ...concernForm,
        bookingTitle: selectedBooking?.bookingTitle || concernForm.bookingTitle || "",
        bookingDate: selectedBooking?.bookingDate || concernForm.bookingDate || "",
        bookingTime: selectedBooking?.bookingTime || "",
        bookingStatus: selectedBooking?.status || "",
        bookingAmount: selectedBooking?.amount || 0,
      };

      const message = buildConcernMessage(selectedConcern, detailsToSend);

      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          concernType: selectedConcern,
          concernDetails: {
            concernLabel: getConcernLabel(selectedConcern),
            ...detailsToSend,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (res.status === 403) {
        setStatus({
          type: "error",
          message:
            data.message ||
            "You must be ID verified before sending a message.",
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to send inquiry.");
      }

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage])
      );

      setSelectedConcern("");
      setConcernForm({});
      setStatus({
        type: "success",
        message:
          "Your concern was sent successfully. You may choose another concern anytime.",
      });
      scrollToBottom();
    } catch (error) {
      console.error("submitConcernInquiry error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to send inquiry.",
      });
    } finally {
      setSendingInquiry(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();

    const text = messageText.trim();
    if (!text || sending) return;

    if (!canFreeChat) {
      setStatus({
        type: "error",
        message: "Please specify your concern/need first before chatting.",
      });
      return;
    }

    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (res.status === 403) {
        setStatus({
          type: "error",
          message:
            data.message ||
            "You must be ID verified before sending a message.",
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage])
      );

      setMessageText("");
      scrollToBottom();
    } catch (error) {
      console.error("sendMessage error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to send message.",
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!token) {
      goLogin();
      return;
    }

    fetchMessages();
    fetchMyBookings();

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: {
        token,
        role: "user",
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("hotelChat:joinMyConversation");
    });

    socket.on("hotelChat:message", (incoming) => {
      setMessages((prev) => addMessageWithoutDuplicate(prev, incoming));
      scrollToBottom();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("hotelChat:message");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderBookingDropdown = () => {
    return (
      <>
        <div>
          <FieldLabel>Booking ID</FieldLabel>
          <Select
            value={concernForm.bookingId || ""}
            onChange={(e) => handleBookingSelect(e.target.value)}
            disabled={loadingBookings}
          >
            <option value="">
              {loadingBookings
                ? "Loading your bookings..."
                : myBookings.length === 0
                ? "No bookings found"
                : "Select your booking"}
            </option>

            {myBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <FieldLabel>Booking Type</FieldLabel>
          <Input
            value={concernForm.bookingType || ""}
            onChange={() => {}}
            placeholder="Auto-filled after selecting booking"
            type="text"
          />
        </div>

        {selectedBooking ? (
          <div className="md:col-span-2 rounded-2xl border border-[#355240]/15 bg-[#355240]/5 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
              Selected Booking
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#355240]">
              {selectedBooking.bookingTitle}
            </p>
            <div className="mt-2 grid gap-2 text-xs font-semibold text-black/55 sm:grid-cols-2">
              <p>Booking ID: {selectedBooking.id}</p>
              <p>Status: {selectedBooking.status || "No status"}</p>
              <p>Date: {formatDate(selectedBooking.bookingDate)}</p>
              <p>Time: {selectedBooking.bookingTime || "No time"}</p>
              <p>Amount: {peso(selectedBooking.amount)}</p>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderConcernPicker = () => {
    return (
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              Required before chatting
            </p>
            <h3 className="text-lg font-extrabold text-[#355240]">
              What are your concerns / needs?
            </h3>
            <p className="text-sm font-semibold text-black/45">
              Choose one option so admin can understand your request faster.
            </p>
          </div>

          <p className="mt-3 w-fit rounded-full bg-[#355240]/10 px-4 py-2 text-xs font-extrabold text-[#355240] sm:mt-0">
            Always available
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {CONCERNS.map((concern) => (
            <button
              key={concern.id}
              type="button"
              onClick={() => selectConcern(concern.id)}
              className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#355240]/40 hover:bg-[#355240]/5"
            >
              <div className="text-2xl">{concern.icon}</div>
              <p className="mt-2 text-sm font-extrabold text-[#355240]">
                {concern.label}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-black/45">
                {concern.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderConcernForm = () => {
    if (!selectedConcern || selectedConcern === "choose") return null;

    if (selectedConcern === "reschedule") {
      return (
        <form onSubmit={submitConcernInquiry}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
                Reschedule Form
              </p>
              <h3 className="text-lg font-extrabold text-[#355240]">
                Reschedule Request
              </h3>
              <p className="text-sm font-semibold text-black/45">
                Select your real Booking ID from your booking history.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedConcern("");
                setConcernForm({});
              }}
              className="mt-3 w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5 sm:mt-0"
            >
              BACK TO CONCERNS
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {renderBookingDropdown()}

            <div>
              <FieldLabel>Requested New Date</FieldLabel>
              <Input
                type="date"
                value={concernForm.requestedDate || ""}
                onChange={(e) => updateConcernForm("requestedDate", e.target.value)}
              />
            </div>

            <div>
              <FieldLabel>Requested Time</FieldLabel>
              <Input
                value={concernForm.requestedTime || ""}
                onChange={(e) => updateConcernForm("requestedTime", e.target.value)}
                placeholder="Example: 8:00 AM - 4:00 PM"
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel>Reason</FieldLabel>
              <Input
                value={concernForm.reason || ""}
                onChange={(e) => updateConcernForm("reason", e.target.value)}
                placeholder="Short reason"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingInquiry}
            className="mt-4 rounded-full bg-[#355240] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {sendingInquiry ? "SENDING..." : "SEND RESCHEDULE REQUEST"}
          </button>
        </form>
      );
    }

    if (selectedConcern === "cancel") {
      return (
        <form onSubmit={submitConcernInquiry}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
                Cancellation Form
              </p>
              <h3 className="text-lg font-extrabold text-[#355240]">
                Cancellation Request
              </h3>
              <p className="text-sm font-semibold text-black/45">
                Select your real Booking ID from your booking history.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedConcern("");
                setConcernForm({});
              }}
              className="mt-3 w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5 sm:mt-0"
            >
              BACK TO CONCERNS
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {renderBookingDropdown()}

            <div className="md:col-span-2">
              <FieldLabel>Cancellation Reason</FieldLabel>
              <Input
                value={concernForm.reason || ""}
                onChange={(e) => updateConcernForm("reason", e.target.value)}
                placeholder="Short reason"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingInquiry}
            className="mt-4 rounded-full bg-[#355240] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {sendingInquiry ? "SENDING..." : "SEND CANCELLATION REQUEST"}
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={submitConcernInquiry}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              Other Inquiry Form
            </p>
            <h3 className="text-lg font-extrabold text-[#355240]">
              Other Concern
            </h3>
            <p className="text-sm font-semibold text-black/45">
              Ask about packages, payment, rooms, availability, or other needs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedConcern("");
              setConcernForm({});
            }}
            className="mt-3 w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5 sm:mt-0"
          >
            BACK TO CONCERNS
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Subject</FieldLabel>
            <Input
              value={concernForm.subject || ""}
              onChange={(e) => updateConcernForm("subject", e.target.value)}
              placeholder="Example: Package inquiry"
            />
          </div>

          <div>
            <FieldLabel>Details</FieldLabel>
            <Input
              value={concernForm.details || ""}
              onChange={(e) => updateConcernForm("details", e.target.value)}
              placeholder="Type your concern or question"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={sendingInquiry}
          className="mt-4 rounded-full bg-[#355240] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
        >
          {sendingInquiry ? "SENDING..." : "SEND INQUIRY"}
        </button>
      </form>
    );
  };

  const renderTopConcernPanel = () => {
    if (selectedConcern && selectedConcern !== "choose") {
      return renderConcernForm();
    }

    return renderConcernPicker();
  };

  return (
    <div className="min-h-screen bg-[#f6f6f1] text-[#2f4d36]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#6f806d]">
              Hotel Support
            </p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-[#355240]">
              My Conversation
            </h1>
            <p className="mt-1 text-sm text-[#355240]/70">
              Specify your concern first before chatting with admin.
            </p>
          </div>

          <button
            onClick={() => navigate("/hotel-profile")}
            className="rounded-full border border-[#355240]/20 bg-white px-5 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
          >
            BACK TO PROFILE
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        {status.message ? (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 bg-[#355240] px-5 py-4 text-white">
            <h2 className="text-lg font-extrabold">Hotel Admin Support</h2>
            <p className="text-xs font-semibold text-white/70">
              Choose your need below before sending messages.
            </p>
          </div>

          <div className="border-b border-black/10 bg-white px-5 py-4">
            {renderTopConcernPanel()}
          </div>

          <div className="h-[500px] overflow-y-auto bg-[#fafaf7] p-5">
            {loading ? (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#355240]/10 text-3xl">
                    💬
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-[#355240]">
                    No messages yet
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-black/45">
                    Send your concern form above to start the conversation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const staff = isStaffMessage(msg);
                  const bot = isBotMessage(msg);

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${staff ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                          staff
                            ? bot
                              ? "rounded-bl-md border border-amber-200 bg-amber-50 text-[#2f4d36]"
                              : "rounded-bl-md border border-black/10 bg-white text-[#2f4d36]"
                            : "rounded-br-md bg-[#355240] text-white"
                        }`}
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p
                            className={`text-[11px] font-extrabold uppercase tracking-wide ${
                              staff ? "text-black/40" : "text-white/65"
                            }`}
                          >
                            {bot ? "Hotel Support Bot" : staff ? "Hotel Admin" : "You"}
                          </p>

                          {msg.concernType ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                staff
                                  ? "bg-white/80 text-[#355240]"
                                  : "bg-white/15 text-white"
                              }`}
                            >
                              {getConcernLabel(msg.concernType)}
                            </span>
                          ) : null}
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {msg.message}
                        </p>

                        {shouldShowFaqButton(msg) ? (
                          <button
                            type="button"
                            onClick={() => navigate("/hotel-faqs")}
                            className="mt-3 rounded-full bg-[#355240] px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                          >
                            GO TO FAQS
                          </button>
                        ) : null}

                        <p
                          className={`mt-2 text-[10px] font-semibold ${
                            staff ? "text-black/35" : "text-white/55"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-black/10 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder={
                  canFreeChat
                    ? "Type your follow-up message..."
                    : "Please specify your concern/need above first..."
                }
                rows={2}
                disabled={!canFreeChat}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-black/10 bg-[#f8f8f5] px-4 py-3 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={sending || !messageText.trim() || !canFreeChat}
                className="rounded-2xl bg-[#355240] px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "SENDING..." : "SEND"}
              </button>
            </div>

            <p className="mt-2 text-xs font-semibold text-black/40">
              {canFreeChat
                ? "Press Enter to send. Shift + Enter for new line."
                : "The message box unlocks after you send your concern form."}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
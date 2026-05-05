import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function getHotelApiBase() {
  const raw =
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const cleaned = String(raw).replace(/\/+$/, "");
  if (cleaned.endsWith("/api/hotel")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/hotel`;
  return `${cleaned}/api/hotel`;
}

const API_BASE = getHotelApiBase();
const SOCKET_BASE = API_BASE.replace(/\/api\/hotel$/i, "").replace(/\/api$/i, "");

const CONCERNS = [
  {
    id: "reschedule",
    label: "Reschedule",
    icon: "📅",
    description: "Request a new date or time for an existing booking.",
  },
  {
    id: "cancel",
    label: "Cancel",
    icon: "❌",
    description: "Ask the admin to cancel an existing booking.",
  },
  {
    id: "others",
    label: "Others",
    icon: "💬",
    description: "Ask about rooms, packages, payment, or other concerns.",
  },
];

const DEFAULT_FORMS = {
  reschedule: {
    bookingId: "",
    bookingType: "",
    bookingTitle: "",
    bookingDate: "",
    bookingTime: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
  },
  cancel: {
    bookingId: "",
    bookingType: "",
    bookingTitle: "",
    bookingDate: "",
    bookingTime: "",
    reason: "",
  },
  others: {
    subject: "",
    details: "",
  },
};

function getHotelToken() {
  return localStorage.getItem("hotelToken") || localStorage.getItem("token") || "";
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

function peso(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });
}

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function normalizeBookingOption(type, booking) {
  const id = String(booking?._id || booking?.id || "");
  if (!id) return null;

  if (type === "resort") {
    return {
      id,
      bookingType: "Resort & Venue",
      bookingTitle: booking.venue || booking.title || "Resort & Venue Booking",
      bookingDate: booking.date || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.price || booking.totalAmount || 0,
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
      bookingTitle:
        booking.eventPackage || booking.packageTitle || booking.title || "Event Package Booking",
      bookingDate: booking.eventDate || booking.date || "",
      bookingTime: booking.time || "",
      status: booking.status || "",
      amount: booking.totalAmount || booking.price || 0,
      raw: booking,
      label: `${booking.eventPackage || booking.packageTitle || "Event Package"} • ${formatDate(
        booking.eventDate || booking.date
      )} • ${booking.status || "NO STATUS"} • ${id}`,
    };
  }

  return {
    id,
    bookingType: "Hotel & Condo",
    bookingTitle: `${booking.roomType || booking.packageTitle || "Hotel Room"}${
      booking.duration ? ` - ${booking.duration}` : ""
    }`,
    bookingDate: booking.date || "",
    bookingTime: booking.time || "",
    status: booking.status || "",
    amount: booking.price || booking.totalAmount || 0,
    raw: booking,
    label: `${booking.roomType || booking.packageTitle || "Hotel Room"} ${
      booking.duration || ""
    } • ${formatDate(booking.date)} • ${booking.status || "NO STATUS"} • ${id}`,
  };
}

function addMessageWithoutDuplicate(prevMessages, newMessage) {
  if (!newMessage) return prevMessages;

  const id = String(newMessage._id || "");
  if (id && prevMessages.some((item) => String(item._id || "") === id)) {
    return prevMessages;
  }

  return [...prevMessages, newMessage];
}

function addMessagesWithoutDuplicate(prevMessages, newMessages = []) {
  return newMessages.reduce(
    (current, item) => addMessageWithoutDuplicate(current, item),
    prevMessages
  );
}

function getConcernLabel(type) {
  return CONCERNS.find((item) => item.id === type)?.label || "Concern";
}

function buildConcernMessage(type, details = {}) {
  if (type === "reschedule") {
    return [
      "Concern/Need: Reschedule",
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Current Date: ${details.bookingDate || "Not provided"}`,
      `Current Time: ${details.bookingTime || "Not provided"}`,
      `Requested Date: ${details.requestedDate || "Not provided"}`,
      `Requested Time: ${details.requestedTime || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  if (type === "cancel") {
    return [
      "Concern/Need: Cancel",
      `Booking Type: ${details.bookingType || "Not provided"}`,
      `Booking ID: ${details.bookingId || "Not provided"}`,
      `Booking Name: ${details.bookingTitle || "Not provided"}`,
      `Booking Date: ${details.bookingDate || "Not provided"}`,
      `Booking Time: ${details.bookingTime || "Not provided"}`,
      `Reason: ${details.reason || "Not provided"}`,
    ].join("\n");
  }

  return [
    "Concern/Need: Others",
    `Subject: ${details.subject || "Not provided"}`,
    `Details: ${details.details || "Not provided"}`,
  ].join("\n");
}

function shouldShowFaqButton(message) {
  return message?.autoReplyKind === "after_hours";
}

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder = "", type = "text", readOnly = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] read-only:bg-black/5"
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

export default function HotelChat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const token = useMemo(() => getHotelToken(), []);

  const [messages, setMessages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState("");
  const [concernForm, setConcernForm] = useState({});
  const [messageText, setMessageText] = useState("");

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [sendingConcern, setSendingConcern] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const selectedBooking = useMemo(() => {
    return myBookings.find((item) => item.id === concernForm.bookingId) || null;
  }, [myBookings, concernForm.bookingId]);

  const hasSpecifiedConcern = messages.some((msg) =>
    ["reschedule", "cancel", "others"].includes(String(msg?.concernType || ""))
  );

  const canFreeChat = hasSpecifiedConcern && !selectedConcern;

  const scrollToBottom = () => {
    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const goLogin = () => {
    navigate("/hotel-login", { replace: true });
  };

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const fetchMessages = async () => {
    if (!token) {
      goLogin();
      return;
    }

    setLoadingMessages(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (res.status === 403) {
        setMessages([]);
        setStatus({
          type: "error",
          message:
            data.message || "You must be logged in and ID verified before using chat.",
        });
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to load chat messages.");

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      scrollToBottom();
    } catch (error) {
      console.error("fetchMessages error:", error);
      setStatus({ type: "error", message: error.message || "Failed to load chat." });
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;

    setLoadingBookings(true);

    try {
      const headers = authHeaders();
      const [resortRes, eventRes, hotelRes] = await Promise.all([
        fetch(`${API_BASE}/my-resort-bookings`, { headers }),
        fetch(`${API_BASE}/my-event-bookings`, { headers }),
        fetch(`${API_BASE}/my-hotel-room-bookings`, { headers }),
      ]);

      const [resortData, eventData, hotelData] = await Promise.all([
        resortRes.json().catch(() => ({})),
        eventRes.json().catch(() => ({})),
        hotelRes.json().catch(() => ({})),
      ]);

      const normalized = [
        ...extractArray(resortData, ["bookings", "resortBookings", "history"])
          .map((item) => normalizeBookingOption("resort", item))
          .filter(Boolean),
        ...extractArray(eventData, ["bookings", "eventBookings", "history"])
          .map((item) => normalizeBookingOption("event", item))
          .filter(Boolean),
        ...extractArray(hotelData, ["bookings", "hotelRoomBookings", "history"])
          .map((item) => normalizeBookingOption("hotel", item))
          .filter(Boolean),
      ].sort((a, b) => {
        const aTime = new Date(a.raw?.createdAt || a.bookingDate || 0).getTime();
        const bTime = new Date(b.raw?.createdAt || b.bookingDate || 0).getTime();
        return bTime - aTime;
      });

      setMyBookings(normalized);
    } catch (error) {
      console.error("fetchMyBookings error:", error);
      setStatus({
        type: "error",
        message: "Chat loaded, but your booking dropdown could not be loaded.",
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
    setConcernForm((prev) => ({ ...prev, [field]: value }));
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
        bookingTime: "",
      }));
      return;
    }

    setConcernForm((prev) => ({
      ...prev,
      bookingId: booking.id,
      bookingType: booking.bookingType,
      bookingTitle: booking.bookingTitle,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
    }));
  };

  const validateConcernForm = () => {
    if (!selectedConcern) return "Please choose your concern first.";

    if (selectedConcern === "reschedule") {
      if (!concernForm.bookingId) return "Please select your booking.";
      if (!concernForm.requestedDate) return "Please enter your requested new date.";
      if (!String(concernForm.requestedTime || "").trim()) {
        return "Please enter your requested time.";
      }
      if (!String(concernForm.reason || "").trim()) return "Please enter your reason.";
    }

    if (selectedConcern === "cancel") {
      if (!concernForm.bookingId) return "Please select your booking.";
      if (!String(concernForm.reason || "").trim()) {
        return "Please enter your cancellation reason.";
      }
    }

    if (selectedConcern === "others") {
      if (!String(concernForm.subject || "").trim()) return "Please enter your subject.";
      if (!String(concernForm.details || "").trim()) {
        return "Please enter your concern details.";
      }
    }

    return "";
  };

  const submitConcern = async (event) => {
    event?.preventDefault();
    if (sendingConcern) return;

    const error = validateConcernForm();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    setSendingConcern(true);
    setStatus({ type: "", message: "" });

    try {
      const details = {
        ...concernForm,
        bookingTitle: selectedBooking?.bookingTitle || concernForm.bookingTitle || "",
        bookingDate: selectedBooking?.bookingDate || concernForm.bookingDate || "",
        bookingTime: selectedBooking?.bookingTime || concernForm.bookingTime || "",
        bookingStatus: selectedBooking?.status || "",
        bookingAmount: selectedBooking?.amount || 0,
      };

      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          message: buildConcernMessage(selectedConcern, details),
          concernType: selectedConcern,
          concernDetails: {
            concernLabel: getConcernLabel(selectedConcern),
            ...details,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to send your concern.");

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage].filter(Boolean))
      );
      setSelectedConcern("");
      setConcernForm({});
      setStatus({
        type: "success",
        message: "Your concern was sent. You can now chat with hotel support.",
      });
      scrollToBottom();
    } catch (error) {
      console.error("submitConcern error:", error);
      setStatus({ type: "error", message: error.message || "Failed to send concern." });
    } finally {
      setSendingConcern(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = messageText.trim();
    if (!text || sendingMessage) return;

    if (!canFreeChat) {
      setStatus({ type: "error", message: "Please specify your concern first." });
      return;
    }

    setSendingMessage(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/my/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to send message.");

      setMessages((prev) =>
        addMessagesWithoutDuplicate(prev, [data.message, data.botMessage].filter(Boolean))
      );
      setMessageText("");
      scrollToBottom();
    } catch (error) {
      console.error("sendMessage error:", error);
      setStatus({ type: "error", message: error.message || "Failed to send message." });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (!token) {
      goLogin();
      return undefined;
    }

    fetchMessages();
    fetchMyBookings();

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: { token, role: "user" },
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

  const renderBookingDropdown = () => (
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
              : myBookings.length
              ? "Select your booking"
              : "No bookings found"}
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
        <TextInput value={concernForm.bookingType || ""} readOnly />
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

  const renderConcernPicker = () => (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
            Required before chatting
          </p>
          <h3 className="text-lg font-extrabold text-[#355240]">
            What are your concerns / needs?
          </h3>
          <p className="text-sm font-semibold text-black/45">
            Choose one option so the admin can help you faster.
          </p>
        </div>
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

  const renderConcernForm = () => {
    if (!selectedConcern) return renderConcernPicker();

    return (
      <form onSubmit={submitConcern}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              {getConcernLabel(selectedConcern)} Form
            </p>
            <h3 className="text-lg font-extrabold text-[#355240]">
              {getConcernLabel(selectedConcern)} Request
            </h3>
            <p className="text-sm font-semibold text-black/45">
              Complete the form, then your chat box will unlock.
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
            BACK
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {selectedConcern !== "others" ? renderBookingDropdown() : null}

          {selectedConcern === "reschedule" ? (
            <>
              <div>
                <FieldLabel>Requested New Date</FieldLabel>
                <TextInput
                  type="date"
                  value={concernForm.requestedDate || ""}
                  onChange={(e) => updateConcernForm("requestedDate", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Requested Time</FieldLabel>
                <TextInput
                  value={concernForm.requestedTime || ""}
                  onChange={(e) => updateConcernForm("requestedTime", e.target.value)}
                  placeholder="Example: 8:00 AM - 4:00 PM"
                />
              </div>
            </>
          ) : null}

          {selectedConcern === "others" ? (
            <>
              <div>
                <FieldLabel>Subject</FieldLabel>
                <TextInput
                  value={concernForm.subject || ""}
                  onChange={(e) => updateConcernForm("subject", e.target.value)}
                  placeholder="Example: Package inquiry"
                />
              </div>
              <div>
                <FieldLabel>Details</FieldLabel>
                <TextInput
                  value={concernForm.details || ""}
                  onChange={(e) => updateConcernForm("details", e.target.value)}
                  placeholder="Type your concern or question"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <FieldLabel>Reason</FieldLabel>
              <TextInput
                value={concernForm.reason || ""}
                onChange={(e) => updateConcernForm("reason", e.target.value)}
                placeholder="Short reason"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={sendingConcern}
          className="mt-4 rounded-full bg-[#355240] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendingConcern ? "SENDING..." : `SEND ${getConcernLabel(selectedConcern).toUpperCase()} REQUEST`}
        </button>
      </form>
    );
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
              Send a concern form, then chat with the hotel admin.
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
              Verified guests can message hotel support in real time.
            </p>
          </div>

          <div className="border-b border-black/10 bg-white px-5 py-4">
            {renderConcernForm()}
          </div>

          <div className="h-[500px] overflow-y-auto bg-[#fafaf7] p-5">
            {loadingMessages ? (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#355240]/10 text-3xl">
                    💬
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-[#355240]">
                    No messages yet
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-black/45">
                    Choose your concern above to start chatting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const staff = msg.senderRole === "admin" || msg.senderRole === "bot";
                  const bot = msg.senderRole === "bot" || msg.isAutoReply;

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${staff ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-sm ${
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
                                staff ? "bg-white text-[#355240]" : "bg-white/15 text-white"
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
                    : "Please send a concern form first..."
                }
                rows={2}
                disabled={!canFreeChat}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-black/10 bg-[#f8f8f5] px-4 py-3 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={sendingMessage || !messageText.trim() || !canFreeChat}
                className="rounded-2xl bg-[#355240] px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingMessage ? "SENDING..." : "SEND"}
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold text-black/40">
              {canFreeChat
                ? "Press Enter to send. Shift + Enter for a new line."
                : "The chat box unlocks after you send your concern form."}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

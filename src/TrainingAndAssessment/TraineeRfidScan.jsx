import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function normalizeApiOrigin(raw) {
  const fallback = "http://localhost:5000";
  const r = String(raw || fallback).replace(/\/+$/, "");

  if (r.endsWith("/api")) return r.replace(/\/api$/i, "");
  if (r.includes("/api/")) return r.replace(/\/api\/.*$/i, "");

  return r;
}

const API_ORIGIN = normalizeApiOrigin(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

function normalizeUid(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getProfessorToken() {
  return localStorage.getItem("professorToken") || "";
}

function formatDateTime(value) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TraineeRfidScan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseFromUrl = searchParams.get("course") || "";
  const [buffer, setBuffer] = useState("");
  const [lastUid, setLastUid] = useState("");
  const [message, setMessage] = useState("Ready to scan trainee RFID card...");
  const [messageType, setMessageType] = useState("info");
  const [trainee, setTrainee] = useState(null);
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);

  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const submittingRef = useRef(false);

  const activeCourse = useMemo(() => {
    return session?.course || courseFromUrl || "";
  }, [session, courseFromUrl]);

  async function fetchRfidStatus() {
    const token = getProfessorToken();
    if (!token) return;

    const qs = new URLSearchParams();
    if (courseFromUrl) qs.set("course", courseFromUrl);

    try {
      const res = await fetch(
        `${API_ORIGIN}/api/training/rfid/professor/status${
          qs.toString() ? `?${qs.toString()}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSession(null);
        return;
      }

      setSession(data?.session || null);
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch {
      // Scanner still works without status display.
    }
  }

  async function submitScan(incomingUid) {
    const cleanUid = normalizeUid(incomingUid);

    if (!cleanUid || submittingRef.current) return;

    submittingRef.current = true;
    setScanning(true);
    setLastUid(cleanUid);
    setMessage("Processing RFID scan...");
    setMessageType("info");

    try {
      const res = await fetch(`${API_ORIGIN}/api/training/rfid/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: cleanUid,
          station: session?.station || `${activeCourse || "Training"} RFID Station`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTrainee(data?.trainee || null);
        setMessage(data?.message || "RFID scan failed.");
        setMessageType("error");

        if (data?.log) {
          setLogs((prev) => [data.log, ...prev].slice(0, 20));
        }

        return;
      }

      setTrainee(data?.trainee || null);
      setMessage(data?.message || "RFID scan successful.");
      setMessageType("success");

      if (data?.session) setSession(data.session);
      if (data?.log) {
        setLogs((prev) => [data.log, ...prev].slice(0, 20));
      }

      await fetchRfidStatus();
    } catch (error) {
      setMessage(error?.message || "RFID scan failed.");
      setMessageType("error");
      setTrainee(null);
    } finally {
      setBuffer("");
      bufferRef.current = "";
      setScanning(false);
      submittingRef.current = false;
    }
  }

  async function startWebNfc() {
    try {
      if (!("NDEFReader" in window)) {
        setMessage("Web NFC is not supported in this browser. Use your USB RFID keyboard reader.");
        setMessageType("error");
        return;
      }

      const reader = new window.NDEFReader();
      await reader.scan();

      setMessage("Web NFC started. Tap an NFC card.");
      setMessageType("info");

      reader.onreading = (event) => {
        const serial = normalizeUid(event.serialNumber || "");
        if (serial) {
          submitScan(serial);
        } else {
          setMessage("NFC card detected, but no UID/serial number was readable.");
          setMessageType("error");
        }
      };
    } catch (error) {
      setMessage(error?.message || "Failed to start Web NFC.");
      setMessageType("error");
    }
  }

  function clearDisplay() {
    setBuffer("");
    bufferRef.current = "";
    setLastUid("");
    setTrainee(null);
    setMessage("Ready to scan trainee RFID card...");
    setMessageType("info");
  }

  useEffect(() => {
    setNfcSupported("NDEFReader" in window);
    fetchRfidStatus();

    const interval = setInterval(fetchRfidStatus, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFromUrl]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = document.activeElement?.tagName;
      const isTypingField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (isTypingField) return;

      if (event.key === "Enter") {
        event.preventDefault();

        const cleanUid = normalizeUid(bufferRef.current || buffer);
        if (cleanUid) submitScan(cleanUid);

        return;
      }

      if (event.key.length === 1) {
        const nextValue = normalizeUid(`${bufferRef.current}${event.key}`);
        bufferRef.current = nextValue;
        setBuffer(nextValue);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
          setBuffer("");
        }, 1200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buffer]);

  const isOpen = session?.isOpen === true;

  const messageClass =
    messageType === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className="min-h-screen bg-[#12391f] px-5 py-10 text-[#24402d]">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="lg:col-span-2 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
              TAMSI Training &amp; Assessment
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase text-white md:text-5xl">
              Trainee RFID Scanner
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/professor-attendance")}
            className="rounded-lg border border-white/30 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-[#24402d]"
          >
            Back to Attendance
          </button>
        </div>

        <section className="rounded-3xl bg-white p-7 shadow-xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                RFID attendance is {isOpen ? "OPEN" : "CLOSED"}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#24402d]/70">
                {session
                  ? `Session date: ${session.attendanceDate} • ${session.course} • ${session.station}`
                  : courseFromUrl
                  ? `No open ${courseFromUrl} RFID session found.`
                  : "No open RFID session found."}
              </p>
            </div>

            <span
              className={`rounded-full px-5 py-2 text-xs font-black uppercase ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div className="rounded-3xl border bg-[#f7f8f3] p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#24402d]/60">
              Last scanned UID
            </p>

            <p className="mt-3 break-all font-mono text-3xl font-black text-[#12391f]">
              {lastUid || buffer || "-"}
            </p>

            <p className="mt-4 text-xs font-semibold text-[#24402d]/70">
              Keyboard reader buffer: {buffer ? "capturing..." : "waiting"}
            </p>
          </div>

          <div className={`mt-5 rounded-2xl border px-5 py-4 font-black ${messageClass}`}>
            {message}
          </div>

          {trainee ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-xl font-black text-green-900">
                {trainee.fullName}
              </p>
              <p className="mt-1 text-sm font-semibold text-green-800">
                {trainee.email}
              </p>
              <p className="mt-1 text-sm font-semibold text-green-800">
                Course: {trainee.course || "-"}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={startWebNfc}
              disabled={!nfcSupported || scanning}
              className="rounded-xl bg-[#9aa39b] px-5 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#7f8b82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start Web NFC
            </button>

            <button
              type="button"
              onClick={clearDisplay}
              disabled={scanning}
              className="rounded-xl border border-[#cfd8c8] bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-[#24402d] transition hover:bg-[#f7f8f3] disabled:opacity-60"
            >
              Clear Display
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-800">
            USB RFID keyboard readers work automatically: tap card, UID is typed,
            then Enter submits the scan.
          </div>
        </section>

        <section className="rounded-3xl bg-[#2d5038] p-7 text-white shadow-xl">
          <h2 className="text-2xl font-black uppercase">Recent Scans</h2>
          <p className="mt-3 text-sm font-bold text-white/80">
            This list updates after successful scans and while the professor
            session is available.
          </p>

          <div className="mt-6 space-y-3">
            {logs.length ? (
              logs.slice(0, 12).map((log) => (
                <div
                  key={log.id || `${log.uid}-${log.createdAt}`}
                  className="rounded-2xl bg-white/10 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">
                        {log.traineeName || log.uid || "RFID Scan"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/75">
                        {log.message || "RFID scan processed."}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/60">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        log.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.action || log.status || "scan"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white/10 px-5 py-7 text-center text-sm font-bold text-white/80">
                No RFID scans yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function TraineeRfidScan() {
  const [buffer, setBuffer] = useState("");
  const [lastUid, setLastUid] = useState("");
  const [message, setMessage] = useState("Ready to scan trainee RFID card...");
  const [trainee, setTrainee] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = async (event) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (event.key === "Enter") {
        const uid = buffer.trim();
        if (!uid) return;

        setLastUid(uid);

        try {
          const { data } = await axios.post(`${API_BASE}/api/training/rfid/scan`, {
            uid,
            station: "Training Room Entrance",
          });

          setMessage(data?.message || "RFID scan successful.");
          setTrainee(data?.trainee || null);
        } catch (error) {
          setMessage(error?.response?.data?.message || "RFID scan failed.");
          setTrainee(null);
        } finally {
          setBuffer("");
        }

        return;
      }

      if (event.key.length === 1) {
        setBuffer((prev) => prev + event.key);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setBuffer("");
        }, 250);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buffer]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Trainee RFID Attendance</h1>
        <p className="text-slate-500 mb-6">Tap the trainee card on the RFID reader.</p>

        <div className="rounded-2xl border bg-slate-50 p-4 mb-4">
          <p className="text-sm text-slate-500 mb-1">Last scanned UID</p>
          <p className="font-mono text-lg text-slate-800 break-all">{lastUid || "-"}</p>
        </div>

        <div className="rounded-2xl bg-blue-50 text-blue-800 p-4 mb-4 font-medium">
          {message}
        </div>

        {trainee && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-lg font-semibold text-emerald-800">{trainee.fullName}</p>
            <p className="text-sm text-emerald-700">{trainee.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
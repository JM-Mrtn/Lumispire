// HotelAdminDashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const GREEN_DARK = "#2A4F33";

export default function HotelAdminDashboard() {
  const navigate = useNavigate();

  const getAdminToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("hotelAdminToken") || "";

  const kickToAdminLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  useEffect(() => {
    if (!getAdminToken()) kickToAdminLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ title, value, note }) => (
    <div className="rounded-3xl border border-black/5 bg-[#E9F1D9] p-6 shadow-sm">
      <p className="text-sm font-extrabold text-[#2F5E3A]/75">{title}</p>
      <p className="mt-3 text-4xl font-extrabold leading-none text-[#2F5E3A]">
        {value}
      </p>
      <p className="mt-3 text-xs font-semibold text-[#2F5E3A]/55">{note}</p>
    </div>
  );

  return (
    <HotelAdminShell
      title="Dashboard"
      subtitle="Monitor hotel activity, booking updates, guest conversations, and admin tasks from one place."
      activePage="dashboard"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Sign In" value="10" note="Daily and monthly account activity" />
        <StatCard title="Total Sign Up" value="10" note="New registered hotel users" />
        <StatCard title="Total Booking" value="10" note="Combined reservations and packages" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/hotel-admin-bookings")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Booking Queue
          </p>
          <h2 className="mt-3 text-2xl font-extrabold" style={{ color: GREEN_DARK }}>
            Manage Bookings
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Review pending resort, event, hotel, and condo reservations.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/hotel-admin-id-verify")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Verification
          </p>
          <h2 className="mt-3 text-2xl font-extrabold" style={{ color: GREEN_DARK }}>
            ID Requests
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Approve or reject guest identity verification submissions.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/hotel-admin-chat")}
          className="rounded-3xl border border-black/5 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/40">
            Support
          </p>
          <h2 className="mt-3 text-2xl font-extrabold" style={{ color: GREEN_DARK }}>
            Guest Chat
          </h2>
          <p className="mt-2 text-sm font-semibold text-black/45">
            Respond to guest concerns, reschedules, cancellations, and questions.
          </p>
        </button>
      </div>

      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold" style={{ color: GREEN_DARK }}>
              Notifications
            </h2>
            <p className="mt-1 text-sm font-semibold text-black/45">
              Use this area for upcoming booking alerts, admin notes, and reminders.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#E9F1D9] px-4 py-2 text-xs font-extrabold text-[#2F5E3A]">
            Admin Overview
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[190px] rounded-3xl border border-dashed border-[#2A4F33]/20 bg-[#F6F6F1] p-6">
            <p className="text-sm font-extrabold text-[#2A4F33]">Recent Activity</p>
            <p className="mt-2 text-sm font-semibold text-black/45">
              Connect live backend metrics here when your dashboard endpoints are ready.
            </p>
          </div>

          <div className="flex min-h-[190px] items-center justify-center rounded-3xl border border-dashed border-[#2A4F33]/20 bg-[#F6F6F1] p-6 text-center">
            <div>
              <p className="text-sm font-extrabold text-[#2A4F33]">Calendar</p>
              <p className="mt-2 text-sm font-semibold text-black/45">
                Add approved bookings or check-in schedules here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </HotelAdminShell>
  );
}

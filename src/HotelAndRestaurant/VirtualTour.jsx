// VirtualTour.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const VirtualTour = () => {
  const navigate = useNavigate();

  const GREEN = "#2F5E3A";
  const CARD_BG = "#F3F1E8";

  const goToProfile = () => {
    const token = localStorage.getItem("token");
    if (token) navigate("/hotel-profile");
    else navigate("/hotel-login");
  };

  const kuulaEmbedUrl =
    "https://kuula.co/share/collection/7MMj4?logo=1&info=1&fs=1&vr=0&zoom=1&sd=1&thumbs=1";

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-2 flex items-start justify-between">
          <h1
            className="text-6xl md:text-7xl font-extrabold leading-none"
            style={{ color: GREEN }}
          >
            Virtual Tour
          </h1>

          <nav className="flex gap-8 pt-3">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              HOME
            </button>
            <button
              onClick={() => navigate("/hotel-contact-us")}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              CONTACT
            </button>
            <button
              onClick={goToProfile}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              PROFILE
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mt-10 rounded-2xl border border-black/5 shadow-[0_12px_28px_rgba(0,0,0,0.12)] overflow-hidden bg-white">
          <div
            className="w-full h-[420px] md:h-[640px]"
            style={{ backgroundColor: CARD_BG }}
          >
            <iframe
              title="Virtual Tour"
              src={kuulaEmbedUrl}
              className="w-full h-full border-0"
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VirtualTour;
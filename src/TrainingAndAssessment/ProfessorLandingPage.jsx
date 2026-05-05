// src/TrainingAndAssessment/ProfessorLandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    title: "Attendance Management",
    text: "Record daily attendance, mark trainee status, and export attendance reports.",
  },
  {
    title: "Assessments Management",
    text: "Create, update, and manage training assessments by course and schedule.",
  },
  {
    title: "Score Management",
    text: "Encode trainee scores, monitor performance, and update assessment results.",
  },
  {
    title: "Feedback Management",
    text: "Send clear feedback for attendance, performance, and assessments.",
  },
];

export default function ProfessorLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#cfd3c5] text-[#395345]">
      <header className="bg-[#f7f8f3] shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/training")}
            className="flex items-center gap-3"
          >
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-11 w-11 rounded-full border border-[#c8ccbf] object-cover"
            />
            <span className="font-['Montserrat',sans-serif] text-[34px] font-extrabold leading-none text-[#395345]">
              TAMSI
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/training")}
              className="rounded-full border border-[#c6ccb9] bg-white px-5 py-2 text-sm font-semibold text-[#395345] transition hover:bg-[#f0f3ea]"
            >
              Training Home
            </button>
            <button
              onClick={() => navigate("/professor-login")}
              className="rounded-full bg-[#395345] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2f463a]"
            >
              Professor Sign In
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[34px] bg-[#f7f8f3] shadow-sm ring-1 ring-black/5">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex rounded-full bg-[#e7ecdf] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6d7a70]">
                Training & Assessment
              </div>

              <h1 className="mt-5 font-['Montserrat',sans-serif] text-4xl font-extrabold leading-tight text-[#395345] sm:text-5xl">
                Professor Side
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f6e63] sm:text-lg">
                Manage attendance, assessments, scores, and trainee feedback in one
                place using a dedicated professor portal that matches your existing
                TAMSI training system.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/professor-login")}
                  className="rounded-full bg-[#395345] px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2f463a]"
                >
                  Sign In
                </button>

                <button
                  onClick={() => navigate("/training")}
                  className="rounded-full border border-[#c8ccbf] bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#f1f4ec]"
                >
                  Back to Training
                </button>
              </div>
            </div>

            <div className="bg-[#dbe2d1] p-6 sm:p-8 lg:p-10">
              <div className="grid gap-4">
                {cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-black/5"
                  >
                    <h3 className="text-lg font-extrabold text-[#395345]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#627165]">
                      {card.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
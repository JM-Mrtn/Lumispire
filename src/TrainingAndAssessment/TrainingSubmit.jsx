// src/TrainingAndAssessment/TrainingSubmit.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { TrainingPublicShell } from "./TrainingPublicLayout";

export default function TrainingSubmit() {
  const location = useLocation();

  const state = location.state || {};
  const firstName = state.firstName || "Applicant";
  const email = state.email || "";
  const course = state.course || "";
  const emailNoticeSent = Boolean(state.emailNoticeSent);

  return (
    <TrainingPublicShell
      active="home"
      title="Application Submitted"
      subtitle="Your enrollment request has been sent to TAMSI for review."
    >
      {({ goTo }) => (
        <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] bg-white p-6 text-[#395345] shadow-xl sm:p-8">
              <div className="inline-flex rounded-full bg-[#eef1e7] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                Success
              </div>

              <h2 className="mt-5 font-['Montserrat',sans-serif] text-3xl font-extrabold text-[#395345] sm:text-4xl">
                Thank you, {firstName}!
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6e63] sm:text-base">
                Your TAMSI enrollment application was submitted successfully.
                Please wait while the training admin reviews your information and
                uploaded requirements.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Submitted Name" value={firstName} />
                <InfoCard label="Course" value={course || "Not specified"} />
                <InfoCard label="Email" value={email || "Not specified"} />
                <InfoCard
                  label="Email Notice"
                  value={emailNoticeSent ? "Sent" : "Recorded"}
                />
              </div>

              <div className="mt-8 rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e4e9de]">
                <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#395345]">
                  What happens next?
                </h3>

                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5f6e63]">
                  <li>• Your submitted documents will be reviewed by the training admin.</li>
                  <li>• Wait for an update regarding your application approval.</li>
                  <li>• Once approved, your trainee account details will be sent to your email.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goTo("/training")}
                  className="rounded-full bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2f463a]"
                >
                  Back to Training
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-login")}
                  className="rounded-full border border-[#c8ccbf] bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#f1f4ec]"
                >
                  Go to Sign In
                </button>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#dbe2d1] p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
              <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                Reminder
              </div>

              <h3 className="mt-5 font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#395345]">
                Keep your email active
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#5f6e63]">
                Make sure the email you used in your enrollment form stays active,
                because TAMSI will use it for updates and approval notices.
              </p>

              <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-black/5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
                  Note
                </div>
                <p className="mt-3 text-sm leading-7 text-[#627165]">
                  {emailNoticeSent
                    ? "A confirmation email has been sent to your submitted email address."
                    : "Your application was saved successfully. If no confirmation email arrives, your submission is still recorded in the system."}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-black/5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
                  Support
                </div>
                <p className="mt-3 text-sm leading-7 text-[#627165]">
                  If you need help with your application, contact the TAMSI training
                  office through the contact details on the training pages.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </TrainingPublicShell>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e4e9de]">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-[#395345]">
        {value}
      </div>
    </div>
  );
}

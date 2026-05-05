// src/TrainingAndAssessment/TrainingRequirements.jsx
import React, { useMemo } from "react";
import { TrainingPublicShell } from "./TrainingPublicLayout";

export default function TrainingRequirements() {
  const requirements = useMemo(
    () => [
      "Birth Certificate",
      "Form 137/138",
      "Diploma/TOR",
      "2X2 Picture with Name",
      "Application Form",
      "Marriage Contract (Optional)",
    ],
    []
  );

  return (
    <TrainingPublicShell
      active="requirements"
      title="List of Requirements"
      subtitle="Prepare these documents before submitting your enrollment application."
    >
      <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-7 rounded-2xl bg-[#2e5038] p-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-12">
            {requirements.map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-xl bg-white/5 px-5 py-5 ring-1 ring-white/10"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white" />
                <p className="font-['Montserrat',sans-serif] text-lg font-extrabold leading-snug text-white sm:text-xl">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TrainingPublicShell>
  );
}

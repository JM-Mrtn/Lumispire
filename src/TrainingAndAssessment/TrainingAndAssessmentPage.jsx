// src/TrainingAndAssessment/TrainingAndAssessmentPage.jsx
import React, { useState } from "react";
import TrainingChatbot from "./TrainingChatbot";
import { PaperIcon, TrainingPublicShell } from "./TrainingPublicLayout";

const highlights = [
  { image: "/tamsi-classroom.jpg", alt: "TAMSI classroom" },
  { image: "/tamsi-lounge.jpg", alt: "TAMSI lounge" },
  { image: "/tamsi-room.jpg", alt: "TAMSI room" },
];

const quickCards = [
  {
    title: "Enroll Now",
    subtitle: "Start your journey here at TAMSI",
    route: "/training-enroll",
  },
  {
    title: "Course Offer",
    subtitle: "See the list of courses we offer",
    route: "/training-course",
  },
  {
    title: "Requirements",
    subtitle: "See all requirements you need to submit",
    route: "/training-requirements",
  },
];

export default function TrainingAndAssessmentPage() {
  const [activeHighlight, setActiveHighlight] = useState(0);

  const visibleHighlights = [
    highlights[activeHighlight % highlights.length],
    highlights[(activeHighlight + 1) % highlights.length],
    highlights[(activeHighlight + 2) % highlights.length],
  ];

  const nextHighlight = () => {
    setActiveHighlight((prev) => (prev + 1) % highlights.length);
  };

  const prevHighlight = () => {
    setActiveHighlight((prev) =>
      prev === 0 ? highlights.length - 1 : prev - 1
    );
  };

  return (
    <TrainingPublicShell
      active="home"
      title="Begin your journey with TAMSI today"
      subtitle="Enroll, explore courses, and prepare your training requirements in one place."
    >
      {({ goTo }) => (
        <>
          {/* QUICK ACTIONS */}
          <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 md:grid-cols-3">
              {quickCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => goTo(card.route)}
                  className="group flex items-center gap-5 rounded-xl bg-white px-6 py-6 text-left text-[#45674b] shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <PaperIcon className="h-14 w-14" />
                  <div>
                    <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold">
                      {card.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[#45674b]/75">
                      {card.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* HIGHLIGHTS */}
          <section className="bg-[#123a20] px-5 py-10 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1280px]">
              <div className="text-center">
                <h2 className="font-['Montserrat',sans-serif] text-3xl font-extrabold sm:text-4xl">
                  Our Highlights
                </h2>
                <div className="mx-auto mt-3 h-[3px] max-w-[330px] rounded-full bg-white/45" />
              </div>

              <div className="mt-10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={prevHighlight}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-4xl leading-none text-white transition hover:bg-white/10"
                  aria-label="Previous highlight"
                >
                  ‹
                </button>

                <div className="grid min-w-0 flex-1 grid-cols-1 gap-8 md:grid-cols-3">
                  {visibleHighlights.map((item, index) => (
                    <div
                      key={`${item.image}-${index}`}
                      className="overflow-hidden rounded-xl bg-white/10 shadow-xl ring-1 ring-white/10"
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="h-[190px] w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/520x320/d7ddd4/45674b?text=TAMSI+Highlight";
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextHighlight}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-4xl leading-none text-white transition hover:bg-white/10"
                  aria-label="Next highlight"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          <TrainingChatbot />
        </>
      )}
    </TrainingPublicShell>
  );
}

// src/TrainingAndAssessment/TrainingFaqs.jsx
import React, { useMemo, useState } from "react";
import { TrainingPublicShell } from "./TrainingPublicLayout";

const FAQS = [
  {
    category: "Enrollment",
    question: "How can I enroll in TAMSI?",
    answer:
      "Go to the enrollment form, choose an available course and open batch, fill in your personal information, upload the required documents, then submit your application. After submission, wait for the admin or professor approval and account credentials.",
  },
  {
    category: "Enrollment",
    question: "What requirements do I need to submit?",
    answer:
      "You need to submit your Birth Certificate, 2x2 Picture with Name, Diploma/TOR, Application Form, and other applicable documents such as Form 137/138 or Marriage Contract if required.",
  },
  {
    category: "Course",
    question: "What courses are available?",
    answer:
      "The available courses depend on the batches opened by the professor or admin. Common courses include Housekeeping and Event Management. You can check the Course page to see the current course list.",
  },
  {
    category: "Account",
    question: "How will I know if my enrollment is approved?",
    answer:
      "After your application is reviewed and approved, your trainee account will be created. You may receive your login credentials through the registered email address or through the system notification process set by the admin.",
  },
  {
    category: "Account",
    question: "What should I do if I forgot my password?",
    answer:
      "Go to the trainee login page and click Forgot Password. Follow the OTP verification process to reset your password securely.",
  },
  {
    category: "Training",
    question: "Why do I need to take the pre-test?",
    answer:
      "The pre-test helps evaluate your current knowledge before you access assignments and learning activities. Assignments uploaded by the professor will stay locked until you complete the pre-test.",
  },
  {
    category: "Training",
    question: "How do I access my modules?",
    answer:
      "Log in to your trainee account and go to Modules. Modules are connected to your assigned course and may follow your personalized learning path based on your pre-test result.",
  },
  {
    category: "Training",
    question: "How does attendance work?",
    answer:
      "For online classes, the professor may post an attendance activity where you can upload proof during the allowed upload window. For face-to-face classes, attendance may be recorded through RFID tap-in and tap-out sessions.",
  },
  {
    category: "Roadmap",
    question: "How does the competency roadmap work?",
    answer:
      "The roadmap shows the competencies for your course. You can study each competency module, take the exam, and wait for your professor to check the competency. The next roadmap step unlocks only after both the exam and professor check are completed.",
  },
  {
    category: "Certificate",
    question: "When can I get my certificate?",
    answer:
      "Your certificate becomes available after completing the required training progress, competencies, attendance, pre-test, and professor or admin completion checks.",
  },
];

const CATEGORIES = [
  "All",
  "Enrollment",
  "Course",
  "Account",
  "Training",
  "Roadmap",
  "Certificate",
];

export default function TrainingFaqs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return FAQS.filter((item) => {
      const categoryMatched =
        activeCategory === "All" || item.category === activeCategory;

      const searchMatched =
        !q ||
        `${item.category} ${item.question} ${item.answer}`
          .toLowerCase()
          .includes(q);

      return categoryMatched && searchMatched;
    });
  }, [activeCategory, search]);

  return (
    <TrainingPublicShell
      active="faqs"
      title="Frequently Asked Questions"
      subtitle="Find quick answers about enrollment, requirements, courses, trainee access, roadmap, modules, assignments, attendance, and certificate."
    >
      {({ goTo }) => (
        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-2xl bg-white p-5 text-[#45674b] shadow-xl">
                <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold">
                  How can we help?
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-[#45674b]/75">
                  Search a question or choose a topic below.
                </p>

                <div className="mt-5">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setOpenIndex(0);
                    }}
                    placeholder="Search FAQs"
                    className="h-11 w-full rounded-full border border-[#cfd8c9] bg-[#f7faf2] px-4 text-sm font-semibold text-[#45674b] outline-none focus:border-[#45674b]"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 text-[#45674b] shadow-xl">
                <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold">
                  Categories
                </h2>

                <div className="mt-5 flex flex-wrap gap-3">
                  {CATEGORIES.map((category) => {
                    const active = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setActiveCategory(category);
                          setOpenIndex(0);
                        }}
                        className={[
                          "rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wide transition",
                          active
                            ? "bg-[#45674b] text-white"
                            : "bg-[#eef1e7] text-[#45674b] hover:bg-[#dfe8d9]",
                        ].join(" ")}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.35fr]">
              <aside className="space-y-5">
                <div className="rounded-2xl bg-white p-6 text-[#45674b] shadow-xl">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef1e7]">
                    <QuestionIcon />
                  </div>

                  <h2 className="mt-5 font-['Montserrat',sans-serif] text-2xl font-extrabold">
                    Need more help?
                  </h2>

                  <p className="mt-3 text-sm font-semibold leading-7 text-[#45674b]/75">
                    Contact TAMSI directly if your question is not listed here.
                    You may also visit the contact page for address, phone
                    number, email, and map location.
                  </p>

                  <button
                    type="button"
                    onClick={() => goTo("/training-contact-us")}
                    className="mt-6 h-11 rounded-full bg-[#45674b] px-7 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a]"
                  >
                    Contact Us
                  </button>
                </div>

                <div className="rounded-2xl bg-[#123a20] p-6 shadow-xl ring-1 ring-white/15">
                  <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-white">
                    Quick Links
                  </h3>

                  <div className="mt-5 grid gap-3">
                    <QuickLink label="Enroll Now" onClick={() => goTo("/training-enroll")} />
                    <QuickLink label="View Courses" onClick={() => goTo("/training-course")} />
                    <QuickLink label="View Requirements" onClick={() => goTo("/training-requirements")} />
                    <QuickLink label="Sign In" onClick={() => goTo("/trainee-login")} />
                  </div>
                </div>
              </aside>

              <div className="rounded-2xl bg-white p-5 text-[#45674b] shadow-xl">
                <div className="flex flex-col gap-2 border-b border-[#d6ded2] pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold">
                      Questions & Answers
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[#45674b]/70">
                      Showing {filteredFaqs.length} result
                      {filteredFaqs.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef1e7] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#45674b]">
                    {activeCategory}
                  </span>
                </div>

                {filteredFaqs.length ? (
                  <div className="mt-5 space-y-3">
                    {filteredFaqs.map((item, index) => {
                      const isOpen = openIndex === index;

                      return (
                        <div
                          key={`${item.category}-${item.question}`}
                          className="overflow-hidden rounded-2xl border border-[#d6ded2] bg-[#f7faf2]"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenIndex((current) =>
                                current === index ? -1 : index
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          >
                            <div>
                              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#45674b] ring-1 ring-[#d6ded2]">
                                {item.category}
                              </span>

                              <h3 className="mt-3 font-['Montserrat',sans-serif] text-base font-extrabold text-[#45674b] sm:text-lg">
                                {item.question}
                              </h3>
                            </div>

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl font-extrabold text-[#45674b] ring-1 ring-[#d6ded2]">
                              {isOpen ? "−" : "+"}
                            </span>
                          </button>

                          {isOpen ? (
                            <div className="border-t border-[#d6ded2] bg-white px-5 py-4">
                              <p className="text-sm font-semibold leading-7 text-[#45674b]/80">
                                {item.answer}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-[#f7faf2] px-5 py-6 text-sm font-semibold text-[#45674b] ring-1 ring-[#d6ded2]">
                    No FAQs matched your search. Try another keyword or choose another category.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </TrainingPublicShell>
  );
}

function QuickLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-extrabold text-white ring-1 ring-white/15 transition hover:bg-white/15"
    >
      <span>{label}</span>
      <span>→</span>
    </button>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#45674b]" fill="none">
      <path
        d="M9.2 9.3C9.35 7.65 10.55 6.5 12.35 6.5C14.2 6.5 15.5 7.7 15.5 9.35C15.5 10.65 14.75 11.4 13.65 12.1C12.7 12.7 12.25 13.2 12.25 14.25V14.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12.25 17.5H12.26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

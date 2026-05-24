// src/TrainingAndAssessment/TrainingContactUs.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRAINING_CONTACT_INFO,
  TrainingPublicShell,
} from "./TrainingPublicLayout";

export default function TrainingContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted.");
    resetForm();
  };

  return (
    <TrainingPublicShell
      active="contact"
      title="Contact Us"
      subtitle="Reach our training and assessment team for inquiries and assistance."
    >
      <>
        <style>{contactPageStyleFixes}</style>
        <FloatingHomeIconButton onClick={() => navigate("/")} />

        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#2e5038] p-6 lg:border-r lg:border-white/15 lg:pr-10">
              <SectionHeading title="Get in touch" />

              <div className="mt-8 space-y-6">
                <ContactItem icon={<LocationIcon />}>
                  <span>{TRAINING_CONTACT_INFO.addressFull}</span>
                </ContactItem>

                <ContactItem icon={<PhoneIcon />}>
                  <span>{TRAINING_CONTACT_INFO.phone}</span>
                </ContactItem>

                <ContactItem icon={<MailIcon />}>
                  <span>{TRAINING_CONTACT_INFO.email1}</span>
                  <span>{TRAINING_CONTACT_INFO.email2}</span>
                </ContactItem>

                <ContactItem icon={<ClockIcon />}>
                  <span>{TRAINING_CONTACT_INFO.hours}</span>
                </ContactItem>
              </div>
            </div>

            <div className="rounded-2xl bg-[#2e5038] p-6 lg:pl-10">
              <SectionHeading title="Send us Message" />

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <ContactField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <ContactField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <ContactField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-white">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full resize-none rounded-xl border-2 border-white/80 bg-transparent px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/50 focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    className="h-10 flex-1 rounded-full bg-white px-6 text-xs font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#eef1e7]"
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-10 flex-1 rounded-full border-2 border-white bg-transparent px-6 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#45674b]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-[#123a20] px-5 py-8 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            <div className="text-center">
              <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold sm:text-3xl">
                Our Location Guide Map
              </h2>
              <div className="mx-auto mt-3 h-[3px] max-w-[380px] rounded-full bg-white/45" />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.6479398832357!2d120.99862151086919!3d14.562114277958653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c991472da61b%3A0x3a4930acd0ee798d!2s5441%20Curie%20St%2C%20Makati%20City%2C%201235%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1774615488486!5m2!1sen!2sph"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TAMSI Location Guide Map"
                className="block w-full"
              />
            </div>
          </div>
        </section>
      </>
    </TrainingPublicShell>
  );
}

const contactPageStyleFixes = `
  .ltc-eyebrow,
  .training-hero-badge,
  .training-program-badge {
    font-size: 0 !important;
    line-height: 0 !important;
    color: transparent !important;
  }

  .ltc-eyebrow::before,
  .ltc-eyebrow::after {
    color: var(--gold-soft, #f6d77a) !important;
  }
`;

function FloatingHomeIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Home"
      aria-label="Back to Home"
      className="group fixed bottom-28 right-6 z-[80] flex h-[74px] w-[74px] items-center justify-center rounded-full border-2 border-white/80 bg-[#2e5038] text-white shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#21442d] focus:outline-none focus:ring-4 focus:ring-white/30"
    >
      <span className="pointer-events-none absolute right-[86px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#123a20] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl group-hover:block">
        Back to Home
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-9 w-9"
      >
        <path d="m3 10.5 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </button>
  );
}

function SectionHeading({ title }) {
  return (
    <div>
      <h2 className="text-center font-['Montserrat',sans-serif] text-2xl font-extrabold text-white sm:text-3xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-[2px] max-w-[300px] rounded-full bg-white/45" />
    </div>
  );
}

function ContactField({ label, type = "text", name, value, onChange, required = false }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-extrabold text-white">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-9 w-full rounded-full border-2 border-white/80 bg-transparent px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/50 focus:border-white"
      />
    </div>
  );
}

function ContactItem({ icon, children }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-white">
        {icon}
      </div>
      <div className="space-y-1 text-sm font-extrabold leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M12 21C12 21 18 15.6 18 10.5C18 7.186 15.314 4.5 12 4.5C8.686 4.5 6 7.186 6 10.5C6 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M6.6 10.8C8.2 13.9 10.7 16.4 13.8 18L16.2 15.6C16.5 15.3 17 15.2 17.4 15.3C18.7 15.7 20.1 16 21.5 16C22.1 16 22.5 16.4 22.5 17V21C22.5 21.6 22.1 22 21.5 22C10.7 22 2 13.3 2 2.5C2 1.9 2.4 1.5 3 1.5H7C7.6 1.5 8 1.9 8 2.5C8 3.9 8.3 5.3 8.7 6.6C8.8 7 8.7 7.5 8.4 7.8L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}



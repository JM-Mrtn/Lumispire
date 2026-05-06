// VirtualTour.jsx
import React from "react";
import HotelFaqBot from "./HotelFaqBot";
import HotelHeader from "./HotelHeader";

const VirtualTour = () => {
  const kuulaEmbedUrl =
    "https://kuula.co/share/collection/7MMj4?logo=1&info=1&fs=1&vr=0&zoom=1&sd=1&thumbs=1";

  return (
    <div className="min-h-screen bg-[#f8f6ee] text-[#24382b]">
      <HotelHeader />

      <main className="overflow-hidden">
        <section className="relative isolate px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,85,65,0.18),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8f6ee_78%)]" />
          <div className="absolute right-[-120px] top-16 -z-10 h-[280px] w-[280px] rounded-full bg-[#385541]/10 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-120px] -z-10 h-[260px] w-[260px] rounded-full bg-[#bca46b]/20 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-[#385541]/15 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#385541] shadow-sm">
                360° Virtual Experience
              </p>

              <h1 className="font-['Montserrat',sans-serif] text-4xl font-black leading-tight text-[#385541] sm:text-5xl lg:text-6xl">
                Explore our hotel and resort before you arrive.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#59685e] sm:text-lg">
                Take a guided look around Lumispire’s rooms, venues, amenities,
                and relaxing spaces through an interactive virtual tour.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "Rooms & Suites",
                  "Event Venues",
                  "Resort Facilities",
                  "Immersive 360° View",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#385541]/15 bg-white px-4 py-2 text-sm font-semibold text-[#385541] shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_70px_rgba(36,56,43,0.18)] backdrop-blur">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#e9e3d2]">
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Virtual Tour
                </div>

                <iframe
                  title="Lumispire Hotel and Resort Virtual Tour"
                  src={kuulaEmbedUrl}
                  className="h-[420px] w-full border-0 sm:h-[520px] lg:h-[620px]"
                  allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              {
                title: "Move freely",
                description:
                  "Drag around the tour, zoom in, and explore each space at your own pace.",
              },
              {
                title: "Preview every detail",
                description:
                  "Check room layout, venue atmosphere, and resort areas before booking.",
              },
              {
                title: "Plan with confidence",
                description:
                  "Use the tour to choose the right stay, event package, or venue setup.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-[#385541]/10 bg-white p-6 shadow-[0_14px_35px_rgba(36,56,43,0.08)]"
              >
                <h2 className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#385541]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#65736a]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <HotelFaqBot />
    </div>
  );
};

export default VirtualTour;
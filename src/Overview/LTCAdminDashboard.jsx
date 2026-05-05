import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearLtcAdminToken,
  getLtcAdminContent,
  linesToArray,
  normalizeTextAreaLines,
  saveLtcAdminContent,
  uploadLtcHighlightImage,
  pickPublicLtcImage,
} from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const emptyContent = {
  company: {
    name: "LTC Group of Companies",
    shortName: "LTC",
    tagline: "",
    heroTitle: "",
    heroSubtitle: "",
    logoUrl: "/LTCLogo.jpg",
    bannerUrl: "/LTCBanner.png",
    aboutTitle: "",
    aboutBody: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    values: [],
  },
  timeline: [],
  achievements: [],
  highlights: [],
  teamMembers: [],
};

const tabs = [
  { id: "timeline", label: "Timeline" },
  { id: "achievements", label: "Achievements" },
  { id: "highlights", label: "Highlights" },
  { id: "team", label: "Team" },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanContentForSave(content) {
  return {
    company: {
      ...content.company,
      values: (content.company?.values || []).map((item, index) => ({
        ...item,
        order: Number(item.order || index + 1),
      })),
    },
    timeline: (content.timeline || []).map((item, index) => ({
      ...item,
      side: item.side === "left" ? "left" : "right",
      order: Number(item.order || index + 1),
      isActive: item.isActive !== false,
    })),
    achievements: (content.achievements || []).map((item, index) => ({
      ...item,
      order: Number(item.order || index + 1),
      isActive: item.isActive !== false,
    })),
    highlights: (content.highlights || []).map((item, index) => ({
      ...item,
      order: Number(item.order || index + 1),
      isActive: item.isActive !== false,
    })),
    teamMembers: (content.teamMembers || []).map((item, index) => ({
      ...item,
      order: Number(item.order || index + 1),
      isActive: item.isActive !== false,
      affiliations: Array.isArray(item.affiliations)
        ? item.affiliations
        : linesToArray(item.affiliationsText),
      sections: Array.isArray(item.sections)
        ? item.sections.map((section) => ({
            heading: section.heading || "",
            body: Array.isArray(section.body) ? section.body : linesToArray(section.bodyText),
          }))
        : [],
    })),
  };
}

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-[0.16em] text-gray-600" style={fontPoppins}>
      {label}
    </span>
    <div className="mt-2">{children}</div>
    {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
  </label>
);

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#355E3B] focus:ring-4 focus:ring-[#355E3B]/10";

const textareaClass = `${inputClass} min-h-[110px] resize-y leading-relaxed`;

const SectionCard = ({ title, description, children, action }) => (
  <section className="rounded-3xl bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:p-7">
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-2xl font-black text-gray-950" style={fontMontserrat}>
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const StatusToggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      checked ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    {checked ? "Active" : "Hidden"}
  </button>
);

const LTCAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("timeline");
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingHighlightIndex, setUploadingHighlightIndex] = useState(null);

  const stats = useMemo(
    () => [
      { label: "Timeline", value: content.timeline?.length || 0 },
      { label: "Achievements", value: content.achievements?.length || 0 },
      { label: "Highlights", value: content.highlights?.length || 0 },
      { label: "Team Members", value: content.teamMembers?.length || 0 },
    ],
    [content]
  );

  const loadContent = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLtcAdminContent();
      setContent({ ...emptyContent, ...(data.content || {}) });
    } catch (err) {
      const msg = err.message || "Unable to load content.";
      setError(msg);

      if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("unauthorized")) {
        clearLtcAdminToken();
        navigate("/ltc-admin-login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCompany = (field, value) => {
    setContent((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }));
  };

  const updateCompanyValue = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        values: (prev.company?.values || []).map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addCompanyValue = () => {
    setContent((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        values: [
          ...(prev.company?.values || []),
          { _id: createId("value"), letter: "", title: "New Value", body: "" },
        ],
      },
    }));
  };

  const removeCompanyValue = (index) => {
    setContent((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        values: (prev.company?.values || []).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: (prev[section] || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addTimelineItem = () => {
    setContent((prev) => ({
      ...prev,
      timeline: [
        ...(prev.timeline || []),
        {
          _id: createId("timeline"),
          side: (prev.timeline || []).length % 2 === 0 ? "right" : "left",
          date: "New Date",
          title: "New Timeline Item",
          body: "",
          isActive: true,
          order: (prev.timeline || []).length + 1,
        },
      ],
    }));
  };

  const addAchievement = () => {
    setContent((prev) => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        {
          _id: createId("achievement"),
          title: "New Achievement",
          body: "",
          footer: "",
          isActive: true,
          order: (prev.achievements || []).length + 1,
        },
      ],
    }));
  };

  const addHighlight = () => {
    setContent((prev) => ({
      ...prev,
      highlights: [
        ...(prev.highlights || []),
        {
          _id: createId("highlight"),
          title: "New Highlight",
          subtitle: "",
          category: "General",
          image: "/placeholder-image.png",
          isActive: true,
          order: (prev.highlights || []).length + 1,
        },
      ],
    }));
  };

  const addTeamMember = () => {
    setContent((prev) => ({
      ...prev,
      teamMembers: [
        ...(prev.teamMembers || []),
        {
          _id: createId("team"),
          name: "New Team Member",
          role: "",
          email: "",
          title: "",
          avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
          education: "",
          practiceAreas: "",
          affiliations: [],
          sections: [],
          isFounder: false,
          isActive: true,
          order: (prev.teamMembers || []).length + 1,
        },
      ],
    }));
  };

  const removeArrayItem = (section, index) => {
    setContent((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateFounderSections = (teamIndex, bodyText) => {
    setContent((prev) => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).map((item, index) => {
        if (index !== teamIndex) return item;

        const firstSection = item.sections?.[0] || { heading: "PROFESSIONAL AFFILIATIONS:", body: [] };
        return {
          ...item,
          sections: [
            {
              ...firstSection,
              body: linesToArray(bodyText),
            },
          ],
        };
      }),
    }));
  };

  const updateFounderHeading = (teamIndex, heading) => {
    setContent((prev) => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).map((item, index) => {
        if (index !== teamIndex) return item;
        const firstSection = item.sections?.[0] || { heading: "", body: [] };
        return { ...item, sections: [{ ...firstSection, heading }] };
      }),
    }));
  };

  const handleHighlightImageUpload = async (index, file) => {
    if (!file) return;

    setUploadingHighlightIndex(index);
    setMessage("");
    setError("");

    try {
      const data = await uploadLtcHighlightImage(file);
      updateArrayItem("highlights", index, "image", data.imageUrl || "");
      setMessage("Image uploaded. Click Save Changes to keep it on the website.");
      window.setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploadingHighlightIndex(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const data = await saveLtcAdminContent(cleanContentForSave(content));
      setContent({ ...emptyContent, ...(data.content || {}) });
      setMessage(data.message || "Saved successfully.");
      window.setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Unable to save content.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearLtcAdminToken();
    navigate("/ltc-admin-login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F3] text-[#355E3B]" style={fontMontserrat}>
        Loading LTC admin content...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-gray-900" style={fontPontano}>
      <header className="sticky top-0 z-40 border-b border-white/40 bg-[#355E3B] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="LTC Logo" className="h-12 w-12 rounded-full bg-white object-cover" />
            <div>
              <h1 className="text-2xl font-black uppercase leading-none" style={fontMontserrat}>
                LTC Admin
              </h1>
              <p className="text-xs tracking-[0.22em] text-white/75" style={fontPoppins}>
                CONTENT MANAGEMENT
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              View Website
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#355E3B] shadow transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl bg-[#355E3B] p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.12)] md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/70" style={fontPoppins}>
              Website Database Content
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl" style={fontMontserrat}>
              Manage LTC Public Pages
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              Add, edit, hide, and remove content shown on the timeline, achievements, highlights, and team sections.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white p-4 text-center shadow-[0_16px_35px_rgba(0,0,0,0.08)]">
                <p className="text-3xl font-black text-[#355E3B]" style={fontMontserrat}>
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500" style={fontPoppins}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {message ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3 rounded-3xl bg-white p-2 shadow-[0_14px_34px_rgba(0,0,0,0.07)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
                activeTab === tab.id
                  ? "bg-[#355E3B] text-white shadow-lg shadow-[#355E3B]/20"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={fontPoppins}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "timeline" ? (
          <SectionCard
            title="Company Timeline"
            description="This controls the Our Company timeline section on the About Us page."
            action={<button type="button" onClick={addTimelineItem} className="rounded-full bg-[#355E3B] px-4 py-2 text-sm font-bold text-white">Add Timeline Item</button>}
          >
            <div className="space-y-5">
              {(content.timeline || []).map((item, index) => (
                <div key={item._id || index} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-[#355E3B]" style={fontMontserrat}>Timeline #{index + 1}</p>
                      <p className="text-sm text-gray-500">{item.date || "No date"} - {item.title || "No title"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusToggle checked={item.isActive !== false} onChange={(value) => updateArrayItem("timeline", index, "isActive", value)} />
                      <button type="button" onClick={() => removeArrayItem("timeline", index)} className="text-sm font-bold text-red-600">Remove</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_1fr_1.2fr]">
                    <Field label="Side">
                      <select className={inputClass} value={item.side || "right"} onChange={(e) => updateArrayItem("timeline", index, "side", e.target.value)}>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                      </select>
                    </Field>
                    <Field label="Date / Year">
                      <input className={inputClass} value={item.date || ""} onChange={(e) => updateArrayItem("timeline", index, "date", e.target.value)} />
                    </Field>
                    <Field label="Title">
                      <input className={inputClass} value={item.title || ""} onChange={(e) => updateArrayItem("timeline", index, "title", e.target.value)} />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Description" hint="For numbered lines, type one line per row, like 1. Manpower Services.">
                      <textarea className={textareaClass} value={item.body || ""} onChange={(e) => updateArrayItem("timeline", index, "body", e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "achievements" ? (
          <SectionCard
            title="Achievements"
            description="Add awards, recognitions, and milestones shown in About Us."
            action={<button type="button" onClick={addAchievement} className="rounded-full bg-[#355E3B] px-4 py-2 text-sm font-bold text-white">Add Achievement</button>}
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {(content.achievements || []).map((item, index) => (
                <div key={item._id || index} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-black text-[#355E3B]" style={fontMontserrat}>Achievement #{index + 1}</p>
                    <div className="flex items-center gap-2">
                      <StatusToggle checked={item.isActive !== false} onChange={(value) => updateArrayItem("achievements", index, "isActive", value)} />
                      <button type="button" onClick={() => removeArrayItem("achievements", index)} className="text-sm font-bold text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Field label="Title">
                      <input className={inputClass} value={item.title || ""} onChange={(e) => updateArrayItem("achievements", index, "title", e.target.value)} />
                    </Field>
                    <Field label="Description">
                      <textarea className={textareaClass} value={item.body || ""} onChange={(e) => updateArrayItem("achievements", index, "body", e.target.value)} />
                    </Field>
                    <Field label="Footer / Award Details">
                      <textarea className={textareaClass} value={item.footer || ""} onChange={(e) => updateArrayItem("achievements", index, "footer", e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "highlights" ? (
          <SectionCard
            title="Highlights"
            description="Add highlight cards with images and categories."
            action={<button type="button" onClick={addHighlight} className="rounded-full bg-[#355E3B] px-4 py-2 text-sm font-bold text-white">Add Highlight</button>}
          >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {(content.highlights || []).map((item, index) => (
                <div key={item._id || index} className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 md:grid-cols-[180px_1fr]">
                  <div className="min-h-[180px] bg-gray-200">
                    <img src={pickPublicLtcImage(item.image)} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-black text-[#355E3B]" style={fontMontserrat}>Highlight #{index + 1}</p>
                      <div className="flex items-center gap-2">
                        <StatusToggle checked={item.isActive !== false} onChange={(value) => updateArrayItem("highlights", index, "isActive", value)} />
                        <button type="button" onClick={() => removeArrayItem("highlights", index)} className="text-sm font-bold text-red-600">Remove</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Title">
                        <input className={inputClass} value={item.title || ""} onChange={(e) => updateArrayItem("highlights", index, "title", e.target.value)} />
                      </Field>
                      <Field label="Category">
                        <input className={inputClass} value={item.category || ""} onChange={(e) => updateArrayItem("highlights", index, "category", e.target.value)} />
                      </Field>
                    </div>
                    <div className="mt-4 space-y-4">
                      <Field label="Subtitle">
                        <input className={inputClass} value={item.subtitle || ""} onChange={(e) => updateArrayItem("highlights", index, "subtitle", e.target.value)} />
                      </Field>
                      <div>
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-gray-600" style={fontPoppins}>
                          Image
                        </span>
                        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-dashed border-[#355E3B]/30 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {item.image ? "Image selected" : "No image uploaded yet"}
                            </p>
                            <p className="mt-1 break-all text-xs text-gray-400">
                              {item.image || "Upload a JPG, PNG, WEBP, or GIF image."}
                            </p>
                          </div>

                          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#355E3B] px-4 py-2 text-sm font-black text-white shadow transition hover:-translate-y-0.5 hover:bg-[#28482d]">
                            {uploadingHighlightIndex === index ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingHighlightIndex === index}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleHighlightImageUpload(index, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === "team" ? (
          <SectionCard
            title="Team Members"
            description="Add founder and executive profile cards shown on Team page."
            action={<button type="button" onClick={addTeamMember} className="rounded-full bg-[#355E3B] px-4 py-2 text-sm font-bold text-white">Add Team Member</button>}
          >
            <div className="space-y-5">
              {(content.teamMembers || []).map((item, index) => {
                const founderText = normalizeTextAreaLines(item.sections?.[0]?.body || []);
                const affiliationsText = normalizeTextAreaLines(item.affiliations || []);

                return (
                  <div key={item._id || index} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <img src={item.avatar || "https://placehold.co/80x80/F3F3F3/355E3B?text=Avatar"} alt={item.name} className="h-14 w-14 rounded-full bg-white object-cover" />
                        <div>
                          <p className="font-black text-[#355E3B]" style={fontMontserrat}>{item.name || `Team Member #${index + 1}`}</p>
                          <p className="text-sm text-gray-500">{item.role || "No role yet"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateArrayItem("teamMembers", index, "isFounder", !item.isFounder)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${item.isFounder ? "bg-[#355E3B] text-white" : "bg-white text-gray-500"}`}
                        >
                          {item.isFounder ? "Founder" : "Executive"}
                        </button>
                        <StatusToggle checked={item.isActive !== false} onChange={(value) => updateArrayItem("teamMembers", index, "isActive", value)} />
                        <button type="button" onClick={() => removeArrayItem("teamMembers", index)} className="text-sm font-bold text-red-600">Remove</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Field label="Name">
                        <input className={inputClass} value={item.name || ""} onChange={(e) => updateArrayItem("teamMembers", index, "name", e.target.value)} />
                      </Field>
                      <Field label="Role">
                        <input className={inputClass} value={item.role || ""} onChange={(e) => updateArrayItem("teamMembers", index, "role", e.target.value)} />
                      </Field>
                      <Field label="Email">
                        <input className={inputClass} value={item.email || ""} onChange={(e) => updateArrayItem("teamMembers", index, "email", e.target.value)} />
                      </Field>
                      <Field label="Avatar URL">
                        <input className={inputClass} value={item.avatar || ""} onChange={(e) => updateArrayItem("teamMembers", index, "avatar", e.target.value)} />
                      </Field>
                      <Field label="Profile Title">
                        <input className={inputClass} value={item.title || ""} onChange={(e) => updateArrayItem("teamMembers", index, "title", e.target.value)} />
                      </Field>
                      <Field label="Practice Areas">
                        <textarea className={textareaClass} value={item.practiceAreas || ""} onChange={(e) => updateArrayItem("teamMembers", index, "practiceAreas", e.target.value)} />
                      </Field>
                    </div>

                    {item.isFounder ? (
                      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                        <Field label="Founder Section Heading">
                          <input className={inputClass} value={item.sections?.[0]?.heading || "PROFESSIONAL AFFILIATIONS:"} onChange={(e) => updateFounderHeading(index, e.target.value)} />
                        </Field>
                        <Field label="Founder Paragraphs" hint="One paragraph per line.">
                          <textarea className={textareaClass} value={founderText} onChange={(e) => updateFounderSections(index, e.target.value)} />
                        </Field>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Field label="Education">
                          <textarea className={textareaClass} value={item.education || ""} onChange={(e) => updateArrayItem("teamMembers", index, "education", e.target.value)} />
                        </Field>
                        <Field label="Professional Affiliations" hint="One paragraph per line.">
                          <textarea className={textareaClass} value={affiliationsText} onChange={(e) => updateArrayItem("teamMembers", index, "affiliations", linesToArray(e.target.value))} />
                        </Field>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ) : null}
      </main>
    </div>
  );
};

export default LTCAdminDashboard;

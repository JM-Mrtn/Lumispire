import jwt from "jsonwebtoken";
import LtcContent from "../models/LtcContent.js";
import { getLtcAdminJwtSecret } from "../middleware/requireLtcAdmin.js";

const trimText = (value, fallback = "") => String(value ?? fallback).trim();

const toLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => trimText(item)).filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n/)
    .map((item) => trimText(item))
    .filter(Boolean);
};

export function getDefaultLtcContent() {
  return {
    key: "main",
    company: {
      name: "LTC Group of Companies",
      shortName: "LTC",
      tagline:
        "Training, assessment, manpower, hotel and restaurant services for professional business needs.",
      heroTitle:
        "We Specialize in Training, Assessment, Manpower & Hotel & Restaurant Services",
      heroSubtitle: "Delivering excellence and professional solutions for your business needs",
      logoUrl: "/LTCLogo.jpg",
      bannerUrl: "/LTCBanner.png",
      aboutTitle: "About LTC Group of Companies",
      aboutBody:
        "LTC Group of Companies provides reliable support across training, assessment, manpower, hotel, resort, and restaurant services.",
      contactEmail: "",
      contactPhone: "",
      address: "",
      values: [
        {
          letter: "I",
          title: "INTEGRITY",
          body:
            "We honor our word and keep our commitments. We keep ourselves objective, honest and balanced in making decisions and actions for the common good of our stakeholders.",
        },
        {
          letter: "G",
          title: "GOD-FEARING",
          body:
            "We put GOD first in everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship.",
        },
        {
          letter: "H",
          title: "HARDWORK",
          body:
            "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs.",
        },
        {
          letter: "T",
          title: "TRUSTWORTHINESS",
          body:
            "We take accountability for our actions and required results. It is an essential moral value that ensures dependability, credibility, and truthfulness.",
        },
      ],
    },
    timeline: [
      {
        side: "right",
        date: "May 1989",
        title: "LTC Staffing Center, Inc.",
        body:
          "Started as LTC Staffing Center, Inc., duly authorized under DOLE Department Order Number 174 with License Number NCR-MFPO-7B10-041223-499-R.",
        isActive: true,
        order: 1,
      },
      {
        side: "left",
        date: "January 2013",
        title: "LTC-Multi Services and Training Center, Inc.",
        body:
          "By majority vote of the Board of Directors and Stock Holders, the corporate name was changed to provide different business sectors a total solution for HR support services and quality training.",
        isActive: true,
        order: 2,
      },
      {
        side: "right",
        date: "September 24, 2019",
        title: "LTC Training Assessment and Multi Services, Inc.",
        body:
          "The company again considered amending its name to assist the country's nation building and economic recovery, now with different business models spearheaded by competent managers.\n1. Manpower Services\n2. Training & Assessment\n3. System Services\n4. Hotel & Resort",
        isActive: true,
        order: 3,
      },
      {
        side: "left",
        date: "Present Day",
        title: "Strategic Location",
        body:
          "Our business office is strategically located at 5411 Light Tower Center & Realty Development, Inc., Building II, Curie Street, Palanan, Makati City.",
        isActive: true,
        order: 4,
      },
    ],
    achievements: [
      {
        title: "NUMBER ONE PLACEMENT AGENCY (2012)",
        body:
          "For having most number of local placements during the 2012 Labor Day Job & Livelihood Fair",
        footer:
          "Awarded by: Department of Labor & Employment (DOLE)\nGiven: May 1, 2012 | World Trade Center, Pasay City",
        isActive: true,
        order: 1,
      },
      {
        title: "GINTONG LANDAS PROJECT SUPPORT",
        body: "For generous support to Gintong Landas Project 2018 & 2022",
        footer:
          "Awarded by: Create a Job for Disabled Association, Inc.\nGiven: 2018 & 2022 | City of Manila",
        isActive: true,
        order: 2,
      },
      {
        title: "APPRECIATION TO MS. LORNA T. CASTIGADOR",
        body:
          "For her unselfish devotion, continuous support and efforts to help members attain professional, spiritual, economic & social goals",
        footer:
          "Awarded by: Philippine Cocoa Corporation\nGiven: July 17, 1996 | LTC Staffing Center, Inc.",
        isActive: true,
        order: 3,
      },
    ],
    highlights: [
      {
        title: "Training Facility",
        subtitle: "Skills development and classroom sessions",
        category: "Training & Assessment",
        image: "/training-facility.png",
        isActive: true,
        order: 1,
      },
      {
        title: "Hotel Operations",
        subtitle: "Hospitality and guest service area",
        category: "Hotel & Resort",
        image: "/hotel-resort.png",
        isActive: true,
        order: 2,
      },
      {
        title: "Manpower Deployment",
        subtitle: "Reliable staffing support solutions",
        category: "Manpower",
        image: "/manpower-services.png",
        isActive: true,
        order: 3,
      },
      {
        title: "Assessment Center",
        subtitle: "Evaluation and certification support",
        category: "Training & Assessment",
        image: "/assessment-center.png",
        isActive: true,
        order: 4,
      },
      {
        title: "Workforce Support",
        subtitle: "Professional business assistance",
        category: "Manpower",
        image: "/workforce-support.png",
        isActive: true,
        order: 5,
      },
      {
        title: "Guest Experience",
        subtitle: "Hospitality-focused operations",
        category: "Hotel & Resort",
        image: "/guest-experience.png",
        isActive: true,
        order: 6,
      },
    ],
    teamMembers: [
      {
        name: "Lorna T. Castigador",
        role: "Founder & President",
        email: "lornacastigador@ltcmultiservices.com",
        title: "Founder, LTC Group of Companies",
        avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
        practiceAreas:
          "PRACTICE AREAS: Training, Marketing, Accounting, Realty, Manpower and Hotel & Restaurant Services",
        sections: [
          {
            heading: "PROFESSIONAL AFFILIATIONS:",
            body: [
              "As the founder of LTC Staffing Center, Inc., she aims to provide the different business sectors a total solution for quality training and HR support services.",
              "She has actively participated in labor, training, and business development organizations for many years.",
              "Her story reflects client trust, confidence, perseverance, and service-driven leadership.",
            ],
          },
        ],
        isFounder: true,
        isActive: true,
        order: 1,
      },
      {
        name: "Loren Gladius T. Castigador",
        role: "General Manager for Manpower Services (TAMSI)",
        email: "lorengladius1224@yahoo.com",
        avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
        education:
          "Graduated from Adamson University with a Bachelor of Science degree in Business Administration major in Operation Management.",
        affiliations: [
          "He previously worked with LTC Multi-Services and Training Center as the Head of Accounting Department.",
          "He oversees Human Resources and supports manpower, compensation, and benefits administration.",
        ],
        practiceAreas: "Human Resource, Accounting, & Manpower Services",
        isFounder: false,
        isActive: true,
        order: 2,
      },
      {
        name: "Loren Narcissus T. Castigador",
        role: "General Manager for System Services",
        email: "lorengladius1224@yahoo.com",
        avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
        education:
          "He finished his Bachelor of Science in Information System from the De La Salle College of Saint Benilde.",
        affiliations: [
          "He is responsible for network integrity, server deployment, security, and IT infrastructure support.",
          "He has worked in technical support, network operations, and system administration roles.",
        ],
        practiceAreas: "Technical Support, and IT Infrastructure",
        isFounder: false,
        isActive: true,
        order: 3,
      },
      {
        name: "Loren Larkspur T. Castigador",
        role: "General Manager for Training & Assessment (TAMSI)",
        email: "lorengladius1224@yahoo.com",
        avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
        education:
          "Earned his Bachelor of Science in Business Administration Major in Computer Application from the De La Salle College of Saint Benilde.",
        affiliations: [
          "He is in charge of TESDA-related training and assessment services.",
          "He supports technical, infrastructure, HR, and accounting needs for LTC operations.",
        ],
        practiceAreas: "IT Infrastructure, Technical Support, Training & Assessment Services.",
        isFounder: false,
        isActive: true,
        order: 4,
      },
      {
        name: "Loren Christian T. Castigador",
        role: "General Manager for Hotel & Restaurant",
        email: "christcastigador1220@gmail.com",
        avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
        education:
          "Earned his Bachelor of Science in Business Administration Major in Computer Application from the De La Salle College of Saint Benilde.",
        affiliations: [
          "He is involved in hotel, restaurant, events place, food hub, resto bar, and condotel operations.",
          "He has received recognitions for innovative food-related projects and operational leadership.",
        ],
        practiceAreas: "Hotel & Restaurant, Events Places, Food Hub, Resto Bar and Condotel.",
        isFounder: false,
        isActive: true,
        order: 5,
      },
    ],
  };
}

function normalizeContent(input = {}) {
  const defaults = getDefaultLtcContent();
  const company = input.company || {};

  return {
    key: "main",
    company: {
      ...defaults.company,
      name: trimText(company.name, defaults.company.name),
      shortName: trimText(company.shortName, defaults.company.shortName),
      tagline: trimText(company.tagline, defaults.company.tagline),
      heroTitle: trimText(company.heroTitle, defaults.company.heroTitle),
      heroSubtitle: trimText(company.heroSubtitle, defaults.company.heroSubtitle),
      logoUrl: trimText(company.logoUrl, defaults.company.logoUrl),
      bannerUrl: trimText(company.bannerUrl, defaults.company.bannerUrl),
      aboutTitle: trimText(company.aboutTitle, defaults.company.aboutTitle),
      aboutBody: trimText(company.aboutBody, defaults.company.aboutBody),
      contactEmail: trimText(company.contactEmail),
      contactPhone: trimText(company.contactPhone),
      address: trimText(company.address),
      values: Array.isArray(company.values)
        ? company.values
            .map((item, index) => ({
              letter: trimText(item.letter),
              title: trimText(item.title),
              body: trimText(item.body),
              order: Number(item.order || index + 1),
            }))
            .filter((item) => item.title)
        : defaults.company.values,
    },
    timeline: Array.isArray(input.timeline)
      ? input.timeline
          .map((item, index) => ({
            side: trimText(item.side, index % 2 === 0 ? "right" : "left") === "left" ? "left" : "right",
            date: trimText(item.date),
            title: trimText(item.title),
            body: trimText(item.body),
            isActive: item.isActive !== false,
            order: Number(item.order || index + 1),
          }))
          .filter((item) => item.title)
      : defaults.timeline,
    achievements: Array.isArray(input.achievements)
      ? input.achievements
          .map((item, index) => ({
            title: trimText(item.title),
            body: trimText(item.body),
            footer: trimText(item.footer),
            isActive: item.isActive !== false,
            order: Number(item.order || index + 1),
          }))
          .filter((item) => item.title)
      : defaults.achievements,
    highlights: Array.isArray(input.highlights)
      ? input.highlights
          .map((item, index) => ({
            title: trimText(item.title),
            subtitle: trimText(item.subtitle),
            category: trimText(item.category, "General"),
            image: trimText(item.image, "/placeholder-image.png"),
            isActive: item.isActive !== false,
            order: Number(item.order || index + 1),
          }))
          .filter((item) => item.title)
      : defaults.highlights,
    teamMembers: Array.isArray(input.teamMembers)
      ? input.teamMembers
          .map((item, index) => ({
            name: trimText(item.name),
            role: trimText(item.role),
            email: trimText(item.email),
            title: trimText(item.title),
            avatar: trimText(
              item.avatar,
              "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar"
            ),
            education: trimText(item.education),
            practiceAreas: trimText(item.practiceAreas),
            affiliations: toLines(item.affiliations),
            sections: Array.isArray(item.sections)
              ? item.sections.map((section) => ({
                  heading: trimText(section.heading),
                  body: toLines(section.body),
                }))
              : [],
            isFounder: item.isFounder === true,
            isActive: item.isActive !== false,
            order: Number(item.order || index + 1),
          }))
          .filter((item) => item.name)
      : defaults.teamMembers,
  };
}

export async function ensureLtcContent() {
  let content = await LtcContent.findOne({ key: "main" });

  if (!content) {
    content = await LtcContent.create(getDefaultLtcContent());
  }

  return content;
}

function toPublicContent(content) {
  const obj = content.toObject ? content.toObject() : content;
  const fallback = getDefaultLtcContent();
  const sortByOrder = (a, b) => Number(a.order || 0) - Number(b.order || 0);

  return {
    company: obj.company || fallback.company,
    timeline: ((obj.timeline || []).length ? obj.timeline : fallback.timeline)
      .filter((item) => item.isActive !== false)
      .sort(sortByOrder),
    achievements: (obj.achievements || []).filter((item) => item.isActive !== false).sort(sortByOrder),
    highlights: (obj.highlights || []).filter((item) => item.isActive !== false).sort(sortByOrder),
    teamMembers: (obj.teamMembers || []).filter((item) => item.isActive !== false).sort(sortByOrder),
    updatedAt: obj.updatedAt,
  };
}

export async function getPublicLtcContent(req, res) {
  try {
    const content = await ensureLtcContent();

    return res.status(200).json({
      success: true,
      content: toPublicContent(content),
    });
  } catch (error) {
    console.error("Get public LTC content error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load LTC content.",
    });
  }
}

export async function uploadLtcHighlightImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file.",
      });
    }

    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    return res.status(200).json({
      success: true,
      message: "Image converted for database storage.",
      imageUrl: dataUrl,
      fileName: req.file.originalname || "highlight-image",
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload LTC highlight image error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to upload image.",
    });
  }
}

export async function ltcAdminLogin(req, res) {
  try {
    const { username, password } = req.body || {};
    const expectedUser = process.env.LTC_ADMIN_USER || "ltcadmin";
    const expectedPass = process.env.LTC_ADMIN_PASS || "ltcadmin123";

    if (trimText(username) !== expectedUser || String(password || "") !== expectedPass) {
      return res.status(401).json({
        success: false,
        message: "Invalid LTC admin username or password.",
      });
    }

    const token = jwt.sign(
      {
        role: "ltc-admin",
        username: expectedUser,
      },
      getLtcAdminJwtSecret(),
      {
        expiresIn: process.env.LTC_ADMIN_JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        username: expectedUser,
        role: "ltc-admin",
      },
    });
  } catch (error) {
    console.error("LTC admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login LTC admin.",
    });
  }
}

export async function getLtcAdminContent(req, res) {
  try {
    const content = await ensureLtcContent();
    const adminContent = content.toObject ? content.toObject() : content;
    const fallback = getDefaultLtcContent();

    return res.status(200).json({
      success: true,
      content: {
        ...adminContent,
        company: adminContent.company || fallback.company,
        timeline: (adminContent.timeline || []).length ? adminContent.timeline : fallback.timeline,
      },
    });
  } catch (error) {
    console.error("Get LTC admin content error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load LTC admin content.",
    });
  }
}

export async function updateLtcAdminContent(req, res) {
  try {
    const normalized = normalizeContent(req.body?.content || req.body || {});
    const { key: _ignoredKey, ...contentToSave } = normalized;

    const content = await LtcContent.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          ...contentToSave,
          updatedBy: req.ltcAdmin?.username || "ltc-admin",
        },
        $setOnInsert: { key: "main" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "LTC website content saved successfully.",
      content,
    });
  } catch (error) {
    console.error("Update LTC admin content error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to save LTC website content.",
    });
  }
}

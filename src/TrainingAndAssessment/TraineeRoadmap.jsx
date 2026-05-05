// src/TrainingAndAssessment/TraineeRoadmap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTrainingSession,
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const PASSING_SCORE = 7;
const EXAM_QUESTION_COUNT = 10;

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function getObjectIdString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);
    if (
      typeof value.toString === "function" &&
      value.toString() !== "[object Object]"
    ) {
      return String(value.toString());
    }
  }
  return "";
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";
  return String(value || "").trim();
}

function courseKey(value = "") {
  return normalizeCourseName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRoadmapStorageKey(user, course = "") {
  const userId =
    getObjectIdString(user?._id) ||
    getObjectIdString(user?.id) ||
    String(user?.email || "trainee").trim().toLowerCase();

  return `competencyRoadmapProgress:${userId}:${courseKey(
    course || user?.course || "general"
  )}`;
}

function readRoadmapProgress(storageKey) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "null");

    return {
      examPassed: parsed?.examPassed || {},
      attempts: parsed?.attempts || {},
      scores: parsed?.scores || {},
      completedAt: parsed?.completedAt || {},
      answers: parsed?.answers || {},
    };
  } catch {
    return {
      examPassed: {},
      attempts: {},
      scores: {},
      completedAt: {},
      answers: {},
    };
  }
}

function writeRoadmapProgress(storageKey, value) {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(value || {}));
}

function flattenCompetencyGroups(groups = []) {
  const safeGroups = Array.isArray(groups) ? groups : [];

  return safeGroups.flatMap((group, groupIndex) => {
    const groupTitle = String(
      group?.title || `Competency Group ${groupIndex + 1}`
    ).trim();

    const items = Array.isArray(group?.items) ? group.items : [];

    return items.map((item, itemIndex) => {
      const label = String(
        item?.label || item?.code || `Competency ${itemIndex + 1}`
      ).trim();

      return {
        id: String(item?.code || `${groupIndex}-${itemIndex}`).trim(),
        code: String(item?.code || "").trim(),
        title: label,
        label,
        description: String(item?.description || "").trim(),
        studyPoints: Array.isArray(item?.studyPoints)
          ? item.studyPoints.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        studyModuleOverview: String(item?.studyModuleOverview || "").trim(),
        learningObjectives: Array.isArray(item?.learningObjectives)
          ? item.learningObjectives.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        lessonDiscussion: Array.isArray(item?.lessonDiscussion)
          ? item.lessonDiscussion.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        stepByStepProcedure: Array.isArray(item?.stepByStepProcedure)
          ? item.stepByStepProcedure.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        workplaceScenario: String(item?.workplaceScenario || "").trim(),
        practiceActivity: String(item?.practiceActivity || "").trim(),
        keyTerms: Array.isArray(item?.keyTerms)
          ? item.keyTerms.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        readinessChecklist: Array.isArray(item?.readinessChecklist)
          ? item.readinessChecklist.map((point) => String(point || "").trim()).filter(Boolean)
          : [],
        examQuestions: Array.isArray(item?.examQuestions) ? item.examQuestions : [],
        sequence: Number(item?.sequence || itemIndex + 1),
        groupTitle,
        groupIndex,
        itemIndex,
        professorCompleted: item?.completed === true,
      };
    });
  });
}

function buildLessonPoints(step) {
  const customPoints = Array.isArray(step?.studyPoints)
    ? step.studyPoints.map((point) => String(point || "").trim()).filter(Boolean)
    : [];

  if (customPoints.length) {
    return customPoints;
  }

  const title = String(step?.title || "").toLowerCase();
  const course = normalizeCourseName(step?.course || "");

  if (course === "Housekeeping") {
    if (title.includes("communication") || title.includes("customer")) {
      return [
        "Use polite, calm, and professional communication with guests and coworkers.",
        "Listen carefully to instructions, guest requests, and workplace updates.",
        "Report concerns properly using the correct workplace channel.",
      ];
    }

    if (
      title.includes("hygiene") ||
      title.includes("safety") ||
      title.includes("health")
    ) {
      return [
        "Follow proper hygiene and safety procedures before, during, and after work.",
        "Use personal protective equipment when handling cleaning materials or risky tasks.",
        "Prevent accidents by following safety signs, labels, and workplace rules.",
      ];
    }

    if (title.includes("room") || title.includes("housekeeping")) {
      return [
        "Prepare the room by removing trash and used linens before detailed cleaning.",
        "Clean from cleaner areas to dirtier areas to reduce contamination.",
        "Use a checklist to confirm the room is complete, clean, and guest-ready.",
      ];
    }

    if (title.includes("laundry") || title.includes("linen")) {
      return [
        "Separate clean and soiled linens to maintain hygiene.",
        "Handle guest clothes and linens carefully to prevent loss or damage.",
        "Follow proper laundry and storage procedures.",
      ];
    }

    if (
      title.includes("guest") ||
      title.includes("valet") ||
      title.includes("butler")
    ) {
      return [
        "Respect guest privacy and personal belongings at all times.",
        "Respond to guest requests with professionalism and proper service etiquette.",
        "Follow lost-and-found procedures for any guest item found.",
      ];
    }

    return [
      "Understand the purpose of this housekeeping competency.",
      "Practice the correct workplace procedure connected to this skill.",
      "Apply safety, quality, and professionalism while performing the task.",
    ];
  }

  if (course === "Event Management") {
    if (
      title.includes("proposal") ||
      title.includes("concept") ||
      title.includes("plan")
    ) {
      return [
        "Start with clear event objectives, client requirements, and target audience.",
        "Prepare a practical proposal or concept based on the event goal.",
        "Align budget, timeline, venue, and resources with the approved plan.",
      ];
    }

    if (
      title.includes("venue") ||
      title.includes("site") ||
      title.includes("logistics")
    ) {
      return [
        "Check venue access, layout, safety, power, and guest flow.",
        "Plan logistics, registration, signage, and supplier movement.",
        "Prepare backup plans for possible venue or operations issues.",
      ];
    }

    if (title.includes("program") || title.includes("event management")) {
      return [
        "Create a clear program flow and timeline.",
        "Coordinate staff, suppliers, and responsibilities before the event starts.",
        "Monitor the live event and adjust calmly when problems happen.",
      ];
    }

    if (
      title.includes("protocol") ||
      title.includes("guest") ||
      title.includes("relationship")
    ) {
      return [
        "Use professional communication when dealing with clients, guests, and partners.",
        "Follow protocol and guest-handling standards, especially for VIPs.",
        "Document approvals, changes, and important event decisions.",
      ];
    }

    if (
      title.includes("team") ||
      title.includes("communication") ||
      title.includes("lead")
    ) {
      return [
        "Lead with clear instructions and respectful communication.",
        "Assign tasks based on roles and event requirements.",
        "Keep communication channels open during preparation and live operations.",
      ];
    }

    return [
      "Understand the purpose of this event management competency.",
      "Practice the planning, coordination, or execution skill connected to this item.",
      "Apply professionalism, communication, and problem-solving during event work.",
    ];
  }

  return [
    `Review the competency under ${step?.groupTitle || "your course"}.`,
    "Understand the expected skill or behavior.",
    "Apply the competency in the actual training activity.",
  ];
}

function buildStudyModuleSections(step) {
  const course = normalizeCourseName(step?.course || "");
  const title = String(step?.title || "");
  const groupTitle = String(step?.groupTitle || "");
  const lowerTitle = title.toLowerCase();

  const cleanList = (values = []) =>
    (Array.isArray(values) ? values : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean);

  const base = {
    title,
    groupTitle,
    course,
    overview: "",
    objectives: [],
    discussion: [],
    procedures: [],
    scenario: "",
    activity: "",
    keyTerms: [],
    checklist: [],
  };

  const adminStudyModule = {
    overview: String(step?.studyModuleOverview || "").trim(),
    objectives: cleanList(step?.learningObjectives),
    discussion: cleanList(step?.lessonDiscussion),
    procedures: cleanList(step?.stepByStepProcedure),
    scenario: String(step?.workplaceScenario || "").trim(),
    activity: String(step?.practiceActivity || "").trim(),
    keyTerms: cleanList(step?.keyTerms),
    checklist: cleanList(step?.readinessChecklist),
  };

  const hasAdminStudyModule =
    adminStudyModule.overview ||
    adminStudyModule.objectives.length ||
    adminStudyModule.discussion.length ||
    adminStudyModule.procedures.length ||
    adminStudyModule.scenario ||
    adminStudyModule.activity ||
    adminStudyModule.keyTerms.length ||
    adminStudyModule.checklist.length;

  if (hasAdminStudyModule) {
    const fallbackLessonPoints = buildLessonPoints(step);
    return {
      ...base,
      overview:
        adminStudyModule.overview ||
        step?.description ||
        `This module teaches the competency "${title}" under ${groupTitle || "your course"}.`,
      objectives: adminStudyModule.objectives.length
        ? adminStudyModule.objectives
        : ["Understand the competency.", "Apply the skill.", "Prepare for the exam."],
      discussion: adminStudyModule.discussion.length
        ? adminStudyModule.discussion
        : ["Study the meaning, purpose, and proper application of this competency before answering the exam."],
      procedures: adminStudyModule.procedures.length
        ? adminStudyModule.procedures
        : ["Read the module.", "Review the lesson points.", "Answer the exam."],
      scenario:
        adminStudyModule.scenario ||
        "Apply this competency in a realistic training situation.",
      activity:
        adminStudyModule.activity ||
        "Write three key things you learned from this competency.",
      keyTerms: adminStudyModule.keyTerms.length
        ? adminStudyModule.keyTerms
        : ["Competency", "Skill", "Training", "Assessment"],
      checklist: adminStudyModule.checklist.length
        ? adminStudyModule.checklist
        : ["I reviewed the module.", "I understand the skill.", "I am ready for the exam."],
      lessonPoints: fallbackLessonPoints,
    };
  }

  if (course === "Housekeeping") {
    if (
      lowerTitle.includes("communication") ||
      lowerTitle.includes("customer") ||
      lowerTitle.includes("guest")
    ) {
      return {
        ...base,
        overview:
          "This module teaches the trainee how to communicate properly in a housekeeping workplace. It focuses on respectful communication with guests, coworkers, and supervisors while following service standards.",
        objectives: [
          "Explain why workplace communication is important in housekeeping.",
          "Use polite and professional words when talking to guests.",
          "Report room issues, guest requests, and workplace concerns properly.",
          "Practice calm communication during service situations.",
        ],
        discussion: [
          "Housekeeping work requires clear communication because room status, guest requests, maintenance concerns, and safety issues must be reported accurately. A small communication mistake can delay room release or affect guest satisfaction.",
          "A housekeeper must speak politely, listen carefully, and confirm instructions when needed. Professional communication includes greeting guests, asking permission before entering, explaining service politely, and reporting problems without blaming others.",
          "Communication also happens between departments. Housekeeping may coordinate with front office, maintenance, laundry, and supervisors. The trainee must learn how to give correct information such as room number, issue found, action taken, and assistance needed.",
        ],
        procedures: [
          "Listen carefully to the instruction or guest request.",
          "Confirm important details such as room number, item requested, or problem found.",
          "Use polite language and avoid arguing.",
          "Report the concern to the correct person or department.",
          "Record important information if the workplace requires documentation.",
        ],
        scenario:
          "A guest says that the room lacks towels and asks for extra supplies. The correct response is to acknowledge the request politely, confirm the needed item, provide the item if allowed, and report or record the request according to procedure.",
        activity:
          "Write or practice a short conversation where a guest requests extra towels. Your answer should be polite, clear, and professional.",
        keyTerms: [
          "Workplace communication",
          "Guest request",
          "Professional language",
          "Room status update",
          "Service recovery",
        ],
        checklist: [
          "I can communicate politely with guests.",
          "I can report issues to the correct person.",
          "I can confirm instructions before acting.",
          "I can avoid rude or unclear communication.",
        ],
      };
    }

    if (
      lowerTitle.includes("hygiene") ||
      lowerTitle.includes("safety") ||
      lowerTitle.includes("health")
    ) {
      return {
        ...base,
        overview:
          "This module teaches safety, hygiene, and health practices in housekeeping. It focuses on preventing accidents, avoiding contamination, and protecting both the worker and the guest.",
        objectives: [
          "Identify basic housekeeping safety rules.",
          "Explain the importance of hygiene and sanitation.",
          "Use PPE properly during cleaning tasks.",
          "Recognize hazards such as wet floors, chemicals, and broken glass.",
        ],
        discussion: [
          "Housekeeping staff are exposed to chemicals, sharp objects, wet floors, dust, and contaminated surfaces. Safety procedures help prevent injuries and protect the guest environment.",
          "Hygiene is also important because housekeeping directly affects guest comfort and health. High-touch surfaces, bathrooms, linens, and room equipment must be cleaned carefully to reduce germs and cross-contamination.",
          "The trainee must understand that safety is not optional. Reading labels, wearing gloves when needed, placing warning signs, and reporting hazards are part of professional housekeeping work.",
        ],
        procedures: [
          "Check the work area for hazards before starting.",
          "Wear proper PPE such as gloves or mask when needed.",
          "Read chemical labels before use.",
          "Place warning signs for wet floors.",
          "Report damaged equipment or unsafe conditions immediately.",
        ],
        scenario:
          "While cleaning, you see broken glass near the bathroom. The correct response is to avoid picking it up with bare hands, use safe tools, dispose of it properly, and report the incident if required.",
        activity:
          "List three possible hazards in a guest room and write the correct action for each hazard.",
        keyTerms: [
          "PPE",
          "Sanitation",
          "Cross-contamination",
          "Hazard",
          "Chemical safety",
        ],
        checklist: [
          "I can identify common housekeeping hazards.",
          "I can use PPE correctly.",
          "I can follow chemical safety rules.",
          "I can report unsafe conditions properly.",
        ],
      };
    }

    if (
      lowerTitle.includes("room") ||
      lowerTitle.includes("housekeeping") ||
      lowerTitle.includes("clean")
    ) {
      return {
        ...base,
        overview:
          "This module teaches the correct room preparation and cleaning process. It focuses on making the guest room clean, complete, safe, and ready for occupancy.",
        objectives: [
          "Explain the correct sequence of room cleaning.",
          "Prepare the room by removing trash and used linens.",
          "Apply proper cleaning and inspection standards.",
          "Use a checklist to confirm room readiness.",
        ],
        discussion: [
          "Room preparation is one of the most important housekeeping responsibilities. A guest room must be clean, organized, complete with supplies, and free from visible defects.",
          "The cleaning sequence helps the housekeeper work efficiently. Used linens and trash are removed first, then surfaces, bathroom, amenities, bed setup, and final inspection are completed.",
          "A final inspection ensures that the room is guest-ready. This includes checking cleanliness, odor, supplies, linen arrangement, bathroom condition, and room equipment.",
        ],
        procedures: [
          "Knock and announce before entering if the room may be occupied.",
          "Remove trash and used linens.",
          "Clean surfaces from cleaner areas to dirtier areas.",
          "Clean and sanitize the bathroom.",
          "Make the bed using clean and properly tucked linens.",
          "Refill amenities and check room inventory.",
          "Do a final inspection before releasing the room.",
        ],
        scenario:
          "You are assigned to prepare a checkout room. You should remove used items first, follow the cleaning sequence, refill supplies, and inspect the room before marking it ready.",
        activity:
          "Create a simple room cleaning checklist with at least seven tasks in correct order.",
        keyTerms: [
          "Room preparation",
          "Cleaning sequence",
          "Final inspection",
          "Room inventory",
          "Guest-ready room",
        ],
        checklist: [
          "I can follow the correct room cleaning sequence.",
          "I can check room supplies and amenities.",
          "I can identify if a room is guest-ready.",
          "I can use a checklist during final inspection.",
        ],
      };
    }

    if (lowerTitle.includes("laundry") || lowerTitle.includes("linen")) {
      return {
        ...base,
        overview:
          "This module teaches proper linen and laundry handling. It focuses on hygiene, sorting, care of guest items, and preventing loss or contamination.",
        objectives: [
          "Separate clean and soiled linens properly.",
          "Handle guest clothes and linens with care.",
          "Explain why linen control is important.",
          "Apply hygienic laundry handling practices.",
        ],
        discussion: [
          "Linen handling affects cleanliness and guest satisfaction. Clean linens must never be mixed with soiled linens because this may cause contamination.",
          "Guest clothes and linens must be handled carefully to prevent loss, damage, or mix-ups. Proper recording and sorting are important in laundry operations.",
          "The trainee must understand that linen control supports accountability, hygiene, and quality service.",
        ],
        procedures: [
          "Collect soiled linens carefully.",
          "Separate clean and soiled items.",
          "Avoid placing clean linens on the floor.",
          "Report damaged or missing linen.",
          "Store clean linens in the correct area.",
        ],
        scenario:
          "You find a stained towel and a clean towel in the same cart. The correct action is to separate them immediately and follow the linen handling procedure.",
        activity: "List five rules for proper linen handling in housekeeping.",
        keyTerms: [
          "Clean linen",
          "Soiled linen",
          "Laundry handling",
          "Linen control",
          "Guest clothes",
        ],
        checklist: [
          "I can separate clean and soiled linens.",
          "I can handle guest clothes carefully.",
          "I can avoid contamination during linen handling.",
          "I can report linen problems properly.",
        ],
      };
    }

    return {
      ...base,
      overview: `This module teaches the housekeeping competency "${title}" under ${groupTitle}. It helps the trainee understand the required skill, correct procedure, and workplace standard.`,
      objectives: [
        `Understand the competency: ${title}.`,
        "Apply the skill during actual housekeeping work.",
        "Follow workplace safety, quality, and service standards.",
      ],
      discussion: [
        "This competency is part of professional housekeeping training. The trainee must understand not only the definition of the skill, but also how it is performed in real workplace situations.",
        "Good housekeeping requires consistency, attention to detail, safety awareness, and professional behavior. Every task should support cleanliness, guest comfort, and workplace efficiency.",
      ],
      procedures: [
        "Read and understand the competency requirement.",
        "Observe the correct demonstration or workplace standard.",
        "Practice the skill carefully.",
        "Ask for feedback from the professor or trainer.",
        "Apply corrections until the competency is performed properly.",
      ],
      scenario:
        "During training, the professor asks you to demonstrate this competency. You should follow the correct procedure, maintain safety, and ask for clarification if instructions are unclear.",
      activity:
        "Write three things you must remember when performing this competency.",
      keyTerms: [
        "Competency",
        "Procedure",
        "Workplace standard",
        "Safety",
        "Quality",
      ],
      checklist: [
        "I understand the purpose of this competency.",
        "I can explain the correct procedure.",
        "I can apply the skill safely.",
        "I am ready to answer the exam.",
      ],
    };
  }

  if (course === "Event Management") {
    if (
      lowerTitle.includes("proposal") ||
      lowerTitle.includes("concept") ||
      lowerTitle.includes("plan")
    ) {
      return {
        ...base,
        overview:
          "This module teaches event planning and proposal development. It focuses on objectives, client requirements, audience needs, budget, and event concept.",
        objectives: [
          "Identify the purpose and objectives of an event.",
          "Explain the importance of an event brief.",
          "Prepare basic planning details for an event proposal.",
          "Connect the event concept with budget, audience, and venue.",
        ],
        discussion: [
          "Event planning begins with a clear understanding of the client’s goal, target audience, budget, and expected outcome. Without clear objectives, the event may become disorganized or fail to meet expectations.",
          "An event proposal communicates the plan. It may include the theme, program, target audience, venue, budget, suppliers, logistics, and timeline.",
          "The trainee must learn that planning is not only about creativity. It also requires organization, budgeting, communication, and practical decision-making.",
        ],
        procedures: [
          "Identify the event objective.",
          "Understand the client or audience requirement.",
          "Prepare a concept suitable for the event.",
          "Estimate the budget and needed resources.",
          "Create a timeline and list of responsibilities.",
        ],
        scenario:
          "A client wants a small corporate seminar. The correct approach is to clarify the objective, number of guests, budget, venue needs, program flow, and technical requirements before preparing a proposal.",
        activity:
          "Create a simple event concept for a seminar, birthday, or corporate event. Include objective, audience, venue, and budget idea.",
        keyTerms: [
          "Event objective",
          "Event brief",
          "Proposal",
          "Budget",
          "Target audience",
        ],
        checklist: [
          "I can identify event objectives.",
          "I can explain the purpose of an event proposal.",
          "I can connect budget with event planning.",
          "I can prepare basic event planning details.",
        ],
      };
    }

    if (
      lowerTitle.includes("venue") ||
      lowerTitle.includes("site") ||
      lowerTitle.includes("logistics")
    ) {
      return {
        ...base,
        overview:
          "This module teaches venue selection and logistics planning. It focuses on checking the event site, guest flow, safety, equipment, suppliers, and operational needs.",
        objectives: [
          "Explain why venue ocular inspection is important.",
          "Identify logistics concerns before event day.",
          "Plan guest movement, registration, and signage.",
          "Recognize safety and operational requirements in a venue.",
        ],
        discussion: [
          "The venue affects the success of an event. A good venue should match the event objective, guest count, budget, safety needs, and program requirements.",
          "During an ocular visit, the event team checks layout, entrances, exits, parking, electricity, stage area, comfort rooms, registration area, supplier access, and emergency routes.",
          "Logistics planning makes sure that people, equipment, supplies, and services are in the right place at the right time.",
        ],
        procedures: [
          "Check the venue size and layout.",
          "Identify entrance, exit, registration, and guest flow.",
          "Confirm power supply, equipment, and technical needs.",
          "Check supplier access and setup area.",
          "Prepare signage and logistics checklist.",
        ],
        scenario:
          "You inspect a venue and notice that the registration table blocks the entrance. The correct action is to adjust the layout to improve guest flow and avoid crowding.",
        activity:
          "Draw or describe a simple event layout with registration, stage, guest seating, entrance, and exit.",
        keyTerms: [
          "Venue ocular",
          "Logistics",
          "Guest flow",
          "Layout",
          "Signage",
        ],
        checklist: [
          "I can identify important venue areas.",
          "I can explain guest flow.",
          "I can recognize logistics problems.",
          "I can suggest layout improvements.",
        ],
      };
    }

    if (
      lowerTitle.includes("program") ||
      lowerTitle.includes("coordination") ||
      lowerTitle.includes("event management")
    ) {
      return {
        ...base,
        overview:
          "This module teaches program flow and event coordination. It focuses on timeline management, team roles, supplier coordination, rehearsal, and live event monitoring.",
        objectives: [
          "Explain the importance of program flow.",
          "Identify team roles and responsibilities.",
          "Coordinate suppliers and event staff.",
          "Monitor the event timeline during execution.",
        ],
        discussion: [
          "A program flow is the guide for what happens before, during, and after the event. It helps the team know the order of activities and who is responsible for each task.",
          "Coordination is important because events involve many people. Staff, suppliers, performers, clients, and guests must be managed properly.",
          "During live operations, the team must monitor time, solve problems, and communicate changes quickly.",
        ],
        procedures: [
          "Prepare the event timeline.",
          "Assign staff and supplier responsibilities.",
          "Conduct briefing or rehearsal before the event.",
          "Monitor the program flow during the event.",
          "Record issues for post-event evaluation.",
        ],
        scenario:
          "The speaker arrives late during a seminar. The correct response is to adjust the program flow, inform the host or coordinator, and use the contingency plan.",
        activity:
          "Create a short program flow for a 1-hour event with opening, main activity, and closing.",
        keyTerms: [
          "Program flow",
          "Timeline",
          "Coordination",
          "Rehearsal",
          "Event execution",
        ],
        checklist: [
          "I can read and follow a program flow.",
          "I can identify event team roles.",
          "I can communicate changes during an event.",
          "I can help keep the event on schedule.",
        ],
      };
    }

    if (
      lowerTitle.includes("protocol") ||
      lowerTitle.includes("guest") ||
      lowerTitle.includes("relationship") ||
      lowerTitle.includes("client")
    ) {
      return {
        ...base,
        overview:
          "This module teaches client, guest, and protocol management. It focuses on professional communication, VIP handling, guest service, and proper event etiquette.",
        objectives: [
          "Use professional communication with clients and guests.",
          "Explain the importance of guest handling and protocol.",
          "Respond properly to complaints or guest concerns.",
          "Recognize the need for documentation and approvals.",
        ],
        discussion: [
          "Event management is a service-based field. Clients and guests expect organized, respectful, and professional handling.",
          "Protocol is especially important when there are VIPs, formal guests, or official programs. Seating, introductions, timing, and assistance must be coordinated carefully.",
          "Complaints should be handled calmly. The event staff must listen, acknowledge the concern, and coordinate a solution quickly.",
        ],
        procedures: [
          "Greet clients and guests professionally.",
          "Confirm client instructions and approvals.",
          "Follow VIP or protocol requirements.",
          "Respond calmly to concerns or complaints.",
          "Document important changes or decisions.",
        ],
        scenario:
          "A guest complains that their seat is missing. The correct response is to acknowledge the concern, check the seating plan, coordinate with the team, and provide a solution calmly.",
        activity:
          "Write a polite response to a guest complaint during an event.",
        keyTerms: [
          "Client handling",
          "Guest service",
          "Protocol",
          "VIP",
          "Service recovery",
        ],
        checklist: [
          "I can communicate professionally with guests.",
          "I can follow protocol requirements.",
          "I can respond calmly to complaints.",
          "I can document important client approvals.",
        ],
      };
    }

    return {
      ...base,
      overview: `This module teaches the event management competency "${title}" under ${groupTitle}. It helps the trainee understand the required skill and how to apply it during event planning or execution.`,
      objectives: [
        `Understand the competency: ${title}.`,
        "Apply the skill in an event management situation.",
        "Use communication, planning, and problem-solving during the task.",
      ],
      discussion: [
        "This competency is part of professional event management training. The trainee must understand the skill and how it supports successful event planning or execution.",
        "Event work requires organization, teamwork, communication, and quick decision-making. Every competency supports smoother preparation and better guest experience.",
      ],
      procedures: [
        "Read and understand the competency requirement.",
        "Study how the skill is used in event planning or execution.",
        "Practice through a sample event scenario.",
        "Ask feedback from the professor or trainer.",
        "Apply corrections until the competency is performed properly.",
      ],
      scenario:
        "During event preparation, the professor asks you to apply this competency in a sample situation. You should follow the process, communicate clearly, and solve problems professionally.",
      activity:
        "Write three ways this competency can help during an actual event.",
      keyTerms: [
        "Competency",
        "Event planning",
        "Coordination",
        "Communication",
        "Execution",
      ],
      checklist: [
        "I understand the purpose of this competency.",
        "I can explain how it applies to events.",
        "I can use the skill in a practical scenario.",
        "I am ready to answer the exam.",
      ],
    };
  }

  return {
    ...base,
    overview: `This module teaches the competency "${title}" under ${groupTitle}.`,
    objectives: [
      "Understand the competency.",
      "Apply the skill.",
      "Prepare for the exam.",
    ],
    discussion: [
      "Study the meaning, purpose, and proper application of this competency before answering the exam.",
    ],
    procedures: ["Read the module.", "Review the lesson points.", "Answer the exam."],
    scenario: "Apply this competency in a realistic training situation.",
    activity: "Write three key things you learned from this competency.",
    keyTerms: ["Competency", "Skill", "Training", "Assessment"],
    checklist: [
      "I reviewed the module.",
      "I understand the skill.",
      "I am ready for the exam.",
    ],
  };
}

const QUESTION_BANK = {
  Housekeeping: [
    {
      id: "hk-q1",
      keywords: ["room", "clean", "prepare", "guest"],
      prompt:
        "What should usually be done first when preparing a guest room for cleaning?",
      options: [
        "Arrange decorations first",
        "Remove trash and used linens",
        "Polish mirrors first",
        "Refill the minibar only",
      ],
      answer: "Remove trash and used linens",
      explanation:
        "Removing used items first prepares the room for complete cleaning.",
    },
    {
      id: "hk-q2",
      keywords: ["hygiene", "sanitation", "cross", "contamination"],
      prompt:
        "What helps prevent cross-contamination during housekeeping work?",
      options: [
        "Using the same cloth everywhere",
        "Using color-coded cleaning tools",
        "Skipping bathroom sanitation",
        "Mixing all chemicals together",
      ],
      answer: "Using color-coded cleaning tools",
      explanation:
        "Color-coded tools separate cleaning materials for different areas.",
    },
    {
      id: "hk-q3",
      keywords: ["safety", "chemical", "ppe", "health"],
      prompt: "What should be done before using a cleaning chemical?",
      options: [
        "Use the strongest amount possible",
        "Read the label and instructions",
        "Mix it with bleach immediately",
        "Smell it to test strength",
      ],
      answer: "Read the label and instructions",
      explanation:
        "Labels give safety, dosage, and proper handling instructions.",
    },
    {
      id: "hk-q4",
      keywords: ["guest", "privacy", "communication"],
      prompt: "What should a housekeeper do before entering an occupied room?",
      options: [
        "Open the door immediately",
        "Knock and announce housekeeping",
        "Enter silently",
        "Ask another guest",
      ],
      answer: "Knock and announce housekeeping",
      explanation:
        "This respects guest privacy and follows proper service protocol.",
    },
    {
      id: "hk-q5",
      keywords: ["linen", "laundry"],
      prompt: "Which practice shows proper linen handling?",
      options: [
        "Place clean linens on the floor",
        "Separate clean and soiled linens",
        "Store damp linens for a long time",
        "Mix clean and dirty linens together",
      ],
      answer: "Separate clean and soiled linens",
      explanation:
        "Separating linens helps maintain hygiene and prevent contamination.",
    },
    {
      id: "hk-q6",
      keywords: ["inspection", "checklist", "room"],
      prompt: "Why is a final room inspection important?",
      options: [
        "To delay guest check-in",
        "To confirm the room is clean, complete, and guest-ready",
        "To skip bathroom cleaning",
        "To replace all other cleaning tasks",
      ],
      answer: "To confirm the room is clean, complete, and guest-ready",
      explanation: "Final inspection ensures the room meets service standards.",
    },
    {
      id: "hk-q7",
      keywords: ["wet", "floor", "safety"],
      prompt: "What should be done when the floor is wet during cleaning?",
      options: [
        "Leave it without warning",
        "Put a warning sign and dry it properly",
        "Cover it with linen",
        "Ignore it if no guest is nearby",
      ],
      answer: "Put a warning sign and dry it properly",
      explanation:
        "Wet floor signs and drying help prevent slips and accidents.",
    },
    {
      id: "hk-q8",
      keywords: ["lost", "found", "guest"],
      prompt: "What should be done when a guest valuable is found?",
      options: [
        "Keep it temporarily",
        "Follow lost-and-found procedure immediately",
        "Hide it in the room",
        "Give it to another worker without a record",
      ],
      answer: "Follow lost-and-found procedure immediately",
      explanation: "Guest property must be recorded and handled properly.",
    },
    {
      id: "hk-q9",
      keywords: ["customer", "service", "communication"],
      prompt: "Which behavior shows professional guest interaction?",
      options: [
        "Arguing with the guest",
        "Polite and respectful communication",
        "Ignoring guest concerns",
        "Using rude language",
      ],
      answer: "Polite and respectful communication",
      explanation:
        "Professional communication improves guest trust and service quality.",
    },
    {
      id: "hk-q10",
      keywords: ["equipment", "damaged", "report"],
      prompt: "What should be done if room equipment is damaged?",
      options: [
        "Ignore it",
        "Report it using the proper process",
        "Hide the issue",
        "Let the guest discover it",
      ],
      answer: "Report it using the proper process",
      explanation:
        "Reporting damage helps protect guests and supports maintenance action.",
    },
    {
      id: "hk-q11",
      keywords: ["cart", "supplies", "workflow"],
      prompt: "How should a housekeeping cart be positioned?",
      options: [
        "Blocking the hallway",
        "Near the work area without blocking exits",
        "Inside the elevator",
        "Far from the room",
      ],
      answer: "Near the work area without blocking exits",
      explanation:
        "Cart placement should support work efficiency and safety.",
    },
    {
      id: "hk-q12",
      keywords: ["professionalism", "team", "workplace"],
      prompt: "Which action supports professionalism in housekeeping?",
      options: [
        "Ignoring team instructions",
        "Following standards and communicating respectfully",
        "Skipping safety checks",
        "Leaving tasks unfinished",
      ],
      answer: "Following standards and communicating respectfully",
      explanation:
        "Professionalism includes discipline, respect, and standard procedures.",
    },
  ],

  "Event Management": [
    {
      id: "em-q1",
      keywords: ["plan", "proposal", "objective", "budget"],
      prompt: "What should be clearly defined early in event planning?",
      options: [
        "Event objectives and budget",
        "Only the souvenir design",
        "Only the backdrop color",
        "Only the social media caption",
      ],
      answer: "Event objectives and budget",
      explanation: "Objectives and budget guide the entire event plan.",
    },
    {
      id: "em-q2",
      keywords: ["program", "timeline", "coordination"],
      prompt: "Why is a program flow important?",
      options: [
        "It removes the need for staff",
        "It manages timing and responsibilities",
        "It is only for decoration",
        "It replaces the client brief",
      ],
      answer: "It manages timing and responsibilities",
      explanation: "Program flow keeps the event organized and coordinated.",
    },
    {
      id: "em-q3",
      keywords: ["venue", "site", "logistics"],
      prompt: "What should be checked during a venue ocular visit?",
      options: [
        "Only paint color",
        "Layout, access, safety, power, and logistics",
        "Only the food menu",
        "Only decorations",
      ],
      answer: "Layout, access, safety, power, and logistics",
      explanation: "Venue checks must cover operations and safety needs.",
    },
    {
      id: "em-q4",
      keywords: ["risk", "contingency", "problem"],
      prompt:
        "What should the team do when a supplier is delayed on event day?",
      options: [
        "Ignore the issue",
        "Activate the contingency plan and update stakeholders",
        "Cancel immediately",
        "Blame the client",
      ],
      answer: "Activate the contingency plan and update stakeholders",
      explanation:
        "Contingency planning helps the team respond professionally.",
    },
    {
      id: "em-q5",
      keywords: ["client", "guest", "communication"],
      prompt:
        "Which skill is very important when handling clients and guests?",
      options: [
        "Clear and professional communication",
        "Avoiding communication",
        "Changing plans without approval",
        "Ignoring complaints",
      ],
      answer: "Clear and professional communication",
      explanation:
        "Good communication protects client trust and guest experience.",
    },
    {
      id: "em-q6",
      keywords: ["supplier", "contractor", "coordination"],
      prompt: "Why is supplier coordination important before event day?",
      options: [
        "To confirm timing, deliverables, and responsibilities",
        "To avoid written plans",
        "To reduce teamwork",
        "To replace the event program",
      ],
      answer: "To confirm timing, deliverables, and responsibilities",
      explanation: "Supplier coordination reduces delays and misunderstandings.",
    },
    {
      id: "em-q7",
      keywords: ["registration", "rsvp", "guest"],
      prompt: "What does RSVP management help control?",
      options: [
        "Guest count and attendance planning",
        "Only stage lighting",
        "Only color theme",
        "Only staff uniforms",
      ],
      answer: "Guest count and attendance planning",
      explanation:
        "RSVP helps with seating, food, registration, and logistics.",
    },
    {
      id: "em-q8",
      keywords: ["rehearsal", "technical", "flow"],
      prompt: "Why is a technical rehearsal useful?",
      options: [
        "It tests timing, audio, visuals, and coordination",
        "It delays the event only",
        "It replaces the final plan",
        "It is only for performers",
      ],
      answer: "It tests timing, audio, visuals, and coordination",
      explanation: "Rehearsal identifies problems before the live event.",
    },
    {
      id: "em-q9",
      keywords: ["protocol", "vip", "guest"],
      prompt: "What is best practice when handling VIP guests?",
      options: [
        "Ignore protocol",
        "Follow protocol and coordinate details carefully",
        "Change seating without approval",
        "Let anyone decide",
      ],
      answer: "Follow protocol and coordinate details carefully",
      explanation:
        "VIP handling requires planning, protocol awareness, and attention to detail.",
    },
    {
      id: "em-q10",
      keywords: ["crowd", "safety", "flow"],
      prompt: "What does crowd management mainly protect?",
      options: [
        "Guest safety, flow, and order",
        "Only decorations",
        "Only ticket design",
        "Only stage timing",
      ],
      answer: "Guest safety, flow, and order",
      explanation:
        "Crowd management supports safe and smooth event movement.",
    },
    {
      id: "em-q11",
      keywords: ["complaint", "service", "recovery"],
      prompt: "How should an on-site complaint be handled?",
      options: [
        "Argue with the guest",
        "Respond calmly, acknowledge, and solve promptly",
        "Ignore it",
        "Blame another team member",
      ],
      answer: "Respond calmly, acknowledge, and solve promptly",
      explanation:
        "Service recovery protects the event experience and reputation.",
    },
    {
      id: "em-q12",
      keywords: ["team", "communication", "lead"],
      prompt: "Which action supports good event team coordination?",
      options: [
        "Maintain clear communication channels",
        "Avoid updates until the event ends",
        "Let everyone improvise alone",
        "Remove task assignments",
      ],
      answer: "Maintain clear communication channels",
      explanation:
        "Clear communication helps the team respond quickly and correctly.",
    },
  ],
};

function buildGenericCompetencyQuestions(step = {}, count = EXAM_QUESTION_COUNT) {
  const title = String(step?.title || step?.label || "this competency").trim() || "this competency";
  const groupTitle = String(step?.groupTitle || "your competency group").trim() || "your competency group";
  const courseName = String(step?.course || "your course").trim() || "your course";
  const safeIdBase = String(step?.code || title || "generic")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generic";

  const templates = [
    {
      id: `${safeIdBase}-gen-q1`,
      keywords: ["purpose", "competency", "skill"],
      prompt: `What is the main purpose of studying "${title}" in ${courseName}?`,
      options: [
        "To understand and apply the required workplace skill correctly",
        "To skip the professor's competency check",
        "To memorize the title only without practice",
        "To avoid doing the training activity",
      ],
      answer: "To understand and apply the required workplace skill correctly",
      explanation: "A competency is useful only when the trainee understands it and can apply it in practice.",
    },
    {
      id: `${safeIdBase}-gen-q2`,
      keywords: ["procedure", "steps", "process"],
      prompt: `Before performing the competency "${title}", what should the trainee do first?`,
      options: [
        "Read and understand the instructions or standard procedure",
        "Guess the procedure without reviewing anything",
        "Ask another trainee to answer for them",
        "Skip directly to completion",
      ],
      answer: "Read and understand the instructions or standard procedure",
      explanation: "Understanding the required standard helps the trainee perform the competency correctly and safely.",
    },
    {
      id: `${safeIdBase}-gen-q3`,
      keywords: ["safety", "quality", "standard"],
      prompt: `Which behavior best shows proper performance of "${title}"?`,
      options: [
        "Following standards, safety rules, and professor instructions",
        "Rushing the task without checking quality",
        "Ignoring feedback after the activity",
        "Doing only the easiest part of the task",
      ],
      answer: "Following standards, safety rules, and professor instructions",
      explanation: "Competency performance should follow the correct standard, safety expectations, and trainer guidance.",
    },
    {
      id: `${safeIdBase}-gen-q4`,
      keywords: ["communication", "feedback", "professor"],
      prompt: `What should the trainee do if they are unsure how to apply "${title}"?`,
      options: [
        "Ask the professor or trainer for clarification",
        "Hide the confusion and continue incorrectly",
        "Stop attending the activity",
        "Copy another trainee without understanding",
      ],
      answer: "Ask the professor or trainer for clarification",
      explanation: "Asking for clarification prevents mistakes and supports proper learning.",
    },
    {
      id: `${safeIdBase}-gen-q5`,
      keywords: ["group", "category", "competency"],
      prompt: `The competency "${title}" belongs to which roadmap group?`,
      options: [
        groupTitle,
        "Unrelated personal activity",
        "Website design section",
        "Payment processing section",
      ],
      answer: groupTitle,
      explanation: `This roadmap item is listed under ${groupTitle}.`,
    },
    {
      id: `${safeIdBase}-gen-q6`,
      keywords: ["practice", "application", "scenario"],
      prompt: `Why should the trainee practice "${title}" in a realistic activity?`,
      options: [
        "To connect the lesson with actual workplace performance",
        "To avoid learning the correct process",
        "To make the roadmap longer only",
        "To remove the professor's role",
      ],
      answer: "To connect the lesson with actual workplace performance",
      explanation: "Practice helps the trainee transfer knowledge into real workplace behavior.",
    },
    {
      id: `${safeIdBase}-gen-q7`,
      keywords: ["mistake", "correction", "improvement"],
      prompt: `If the trainee makes a mistake while applying "${title}", what is the best action?`,
      options: [
        "Accept feedback, correct the mistake, and practice again",
        "Ignore the mistake completely",
        "Argue with the professor immediately",
        "Mark the competency completed without checking",
      ],
      answer: "Accept feedback, correct the mistake, and practice again",
      explanation: "Competency learning improves through feedback, correction, and repeated practice.",
    },
    {
      id: `${safeIdBase}-gen-q8`,
      keywords: ["completion", "check", "professor"],
      prompt: `In the roadmap, what must happen before "${title}" can fully unlock the next step?`,
      options: [
        "The trainee passes the exam and the professor checks the competency",
        "The trainee only opens the modal once",
        "The trainee changes their profile photo",
        "The trainee skips all questions",
      ],
      answer: "The trainee passes the exam and the professor checks the competency",
      explanation: "The roadmap requires both the exam result and the professor competency check before moving forward.",
    },
    {
      id: `${safeIdBase}-gen-q9`,
      keywords: ["professionalism", "attitude", "behavior"],
      prompt: `Which attitude is most appropriate while learning "${title}"?`,
      options: [
        "Professional, respectful, and willing to improve",
        "Careless and unwilling to listen",
        "Absent during practice",
        "Focused only on finishing quickly",
      ],
      answer: "Professional, respectful, and willing to improve",
      explanation: "Good attitude supports successful skills training and assessment.",
    },
    {
      id: `${safeIdBase}-gen-q10`,
      keywords: ["review", "exam", "module"],
      prompt: `What should the trainee do before taking the exam for "${title}"?`,
      options: [
        "Review the study module, lesson points, and checklist",
        "Answer randomly without reading",
        "Close the roadmap and ignore the module",
        "Wait for another trainee to answer first",
      ],
      answer: "Review the study module, lesson points, and checklist",
      explanation: "Reviewing the module helps the trainee answer accurately and understand the skill.",
    },
    {
      id: `${safeIdBase}-gen-q11`,
      keywords: ["course", "training", "skill"],
      prompt: `How does "${title}" support the trainee's ${courseName} training?`,
      options: [
        "It builds a required skill for course completion and workplace readiness",
        "It replaces all other requirements automatically",
        "It removes the need for attendance",
        "It is unrelated to the course",
      ],
      answer: "It builds a required skill for course completion and workplace readiness",
      explanation: "Each roadmap competency supports progress toward course completion and practical readiness.",
    },
    {
      id: `${safeIdBase}-gen-q12`,
      keywords: ["checklist", "readiness", "assessment"],
      prompt: `Which sign shows that the trainee is ready to be checked for "${title}"?`,
      options: [
        "They can explain and demonstrate the competency correctly",
        "They only know the course name",
        "They skipped the study module",
        "They have not practiced the task",
      ],
      answer: "They can explain and demonstrate the competency correctly",
      explanation: "Readiness means the trainee understands the competency and can apply it correctly.",
    },
  ];

  return templates.slice(0, Math.max(count, EXAM_QUESTION_COUNT));
}

function normalizeRoadmapQuestion(question, index = 0, step = null) {
  const prompt = String(question?.prompt || question?.question || "").trim();
  const answer = String(
    question?.answer || question?.correctAnswer || question?.correctOption || ""
  ).trim();
  const options = Array.isArray(question?.options)
    ? question.options.map((option) => String(option || "").trim()).filter(Boolean)
    : [];

  if (!prompt || !answer) return null;

  const mergedOptions = [...new Set([answer, ...options])].filter(Boolean);
  while (mergedOptions.length < 4) {
    mergedOptions.push(`Option ${mergedOptions.length + 1}`);
  }

  return {
    id: String(question?.id || `${step?.id || "roadmap"}-custom-${index + 1}`),
    prompt,
    options: mergedOptions.slice(0, 4),
    answer,
    explanation: String(question?.explanation || "Review the lesson points for this competency.").trim(),
    keywords: Array.isArray(question?.keywords) ? question.keywords : [],
  };
}

function getQuestionBankForCourse(course = "", step = null) {
  const customQuestions = Array.isArray(step?.examQuestions)
    ? step.examQuestions
        .map((question, index) => normalizeRoadmapQuestion(question, index, step))
        .filter(Boolean)
    : [];

  if (customQuestions.length) {
    return customQuestions;
  }

  const normalizedCourse = normalizeCourseName(course);
  const fixedBank = QUESTION_BANK[normalizedCourse];

  if (Array.isArray(fixedBank) && fixedBank.length) {
    return fixedBank;
  }

  return buildGenericCompetencyQuestions(
    {
      ...(step || {}),
      course: normalizedCourse || step?.course || "your course",
    },
    EXAM_QUESTION_COUNT
  );
}

function questionScore(question, step) {
  const text = normalizeText(
    [
      step?.title,
      step?.label,
      step?.code,
      step?.groupTitle,
      step?.course,
      ...(buildLessonPoints(step) || []),
    ].join(" ")
  );

  return (question.keywords || []).reduce((sum, keyword) => {
    const cleanKeyword = normalizeText(keyword);
    return cleanKeyword && text.includes(cleanKeyword) ? sum + 2 : sum;
  }, 0);
}

function selectQuestions(course, step, count = EXAM_QUESTION_COUNT) {
  const bank = getQuestionBankForCourse(course, step);

  if (!Array.isArray(bank) || !bank.length) {
    return buildGenericCompetencyQuestions(step, count).slice(0, count);
  }

  const scored = bank
    .map((question, index) => ({
      ...question,
      __index: index,
      __score: questionScore(question, step),
    }))
    .sort((a, b) => {
      if (b.__score !== a.__score) return b.__score - a.__score;
      return a.__index - b.__index;
    });

  const selected = [];
  const used = new Set();

  for (const item of scored) {
    if (selected.length >= count) break;
    if (item.__score > 0) {
      selected.push(item);
      used.add(item.id);
    }
  }

  for (const item of bank) {
    if (selected.length >= count) break;
    if (!used.has(item.id)) {
      selected.push(item);
      used.add(item.id);
    }
  }

  if (selected.length < count) {
    for (const item of buildGenericCompetencyQuestions(step, count)) {
      if (selected.length >= count) break;
      if (!used.has(item.id)) {
        selected.push(item);
        used.add(item.id);
      }
    }
  }

  return selected.slice(0, count).map(({ __index, __score, ...item }) => item);
}

function buildRoadmapPath(points = []) {
  if (!points.length) return "";
  const first = points[0];

  let d = `M 20 ${first.y} L ${Math.max(20, first.x - 90)} ${first.y}`;
  d += ` L ${first.x} ${first.y}`;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x + 90} ${last.y} L ${last.x + 190} ${last.y}`;

  return d;
}

function getRoadmapPoints(steps = []) {
  return steps.map((step, index) => ({
    ...step,
    x: 120 + index * 250,
    y: index % 2 === 0 ? 400 : 170,
  }));
}

function RoadmapModal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-extrabold text-[#395345]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#395345]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ step }) {
  if (step.completed) {
    return (
      <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-green-700 ring-1 ring-green-200">
        Completed
      </span>
    );
  }

  if (!step.professorCompleted) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700 ring-1 ring-red-200">
        Waiting Professor Check
      </span>
    );
  }

  if (step.examPassed) {
    return (
      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 ring-1 ring-blue-200">
        Exam Passed
      </span>
    );
  }

  if (step.locked) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-700 ring-1 ring-gray-200">
        Locked
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-700 ring-1 ring-yellow-200">
      Ready
    </span>
  );
}

function RoadmapStepCard({ step, onOpenStep, align = "left" }) {
  const locked = step.locked;

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onOpenStep(step)}
      className={[
        "group w-full rounded-[24px] border bg-white p-5 text-left shadow-xl ring-1 transition duration-300",
        locked
          ? "cursor-not-allowed border-[#e1e6dc] ring-[#d9dfd2] opacity-70"
          : "border-[#d9dfd2] ring-[#d9dfd2] hover:-translate-y-1 hover:shadow-2xl",
        align === "right" ? "lg:text-left" : "lg:text-right",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-wrap items-center gap-2",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <span className="rounded-full bg-[#eef1e7] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#45674b] ring-1 ring-[#d9dfd2]">
          Step {step.index + 1}
        </span>

        {step.code ? (
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#647165] ring-1 ring-[#d7ddd0]">
            {step.code}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 font-['Montserrat',sans-serif] text-lg font-extrabold leading-tight text-[#45674b]">
        {step.title}
      </h3>

      <p className="mt-2 text-sm font-semibold leading-6 text-[#647165]">
        {step.groupTitle}
      </p>

      <div
        className={[
          "mt-3 flex flex-wrap gap-2",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <StatusPill step={step} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-[#f7f8f3] px-3 py-2 ring-1 ring-[#e2e8da]">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#748175]">
            Score
          </div>
          <div className="mt-1 text-sm font-extrabold text-[#45674b]">
            {step.latestScore ? `${step.latestScore}%` : "-"}
          </div>
        </div>

        <div className="rounded-2xl bg-[#f7f8f3] px-3 py-2 ring-1 ring-[#e2e8da]">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#748175]">
            Attempts
          </div>
          <div className="mt-1 text-sm font-extrabold text-[#45674b]">
            {step.attemptCount}
          </div>
        </div>
      </div>

      <div
        className={[
          "mt-5 flex",
          align === "right" ? "lg:justify-start" : "lg:justify-end",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex items-center rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition",
            locked
              ? "bg-[#d7ddd0] text-[#657367]"
              : step.completed
              ? "bg-green-600 text-white group-hover:bg-green-700"
              : "bg-[#45674b] text-white group-hover:bg-[#2f463a]",
          ].join(" ")}
        >
          {step.completed ? "Open Again" : locked ? "Locked" : "Open Step"}
        </span>
      </div>
    </button>
  );
}

function DesktopRoadmap({ steps, onOpenStep }) {
  return (
    <div className="hidden lg:block">
      <div className="rounded-[30px] bg-white p-6 shadow-xl ring-1 ring-[#d9dfd2]">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#45674b]">
              Roadmap Flow
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#647165]">
              Follow the path from top to bottom. No side scrolling needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-700 ring-1 ring-yellow-200">
              Ready
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 ring-1 ring-blue-200">
              Exam Passed
            </span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-green-700 ring-1 ring-green-200">
              Completed
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700 ring-1 ring-red-200">
              Waiting Check
            </span>
          </div>
        </div>

        <div className="relative mx-auto max-w-[1120px] py-2">
          <div className="absolute left-1/2 top-0 h-full w-[10px] -translate-x-1/2 rounded-full bg-[#dfe8d9]" />
          <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 rounded-full bg-[#8a936e]" />

          <div className="space-y-8">
            {steps.map((step) => {
              const isLeft = step.index % 2 === 0;
              const circleClass = step.completed
                ? "bg-green-600 text-white ring-green-100"
                : step.professorCompleted
                ? "bg-[#f1b337] text-white ring-yellow-100"
                : step.locked
                ? "bg-[#9aa59b] text-white ring-gray-100"
                : "bg-red-400 text-white ring-red-100";

              return (
                <div
                  key={step.id}
                  className="relative grid grid-cols-[1fr_96px_1fr] items-center gap-5"
                >
                  <div className="min-w-0">
                    {isLeft ? (
                      <RoadmapStepCard
                        step={step}
                        onOpenStep={onOpenStep}
                        align="left"
                      />
                    ) : null}
                  </div>

                  <div className="relative flex h-full min-h-[190px] items-center justify-center">
                    <div
                      className={[
                        "relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold shadow-xl ring-8 transition",
                        circleClass,
                      ].join(" ")}
                    >
                      {step.completed ? "✓" : step.index + 1}
                    </div>

                    <div
                      className={[
                        "absolute top-1/2 h-[4px] w-[46px] -translate-y-1/2 rounded-full bg-[#8a936e]",
                        isLeft ? "left-0" : "right-0",
                      ].join(" ")}
                    />
                  </div>

                  <div className="min-w-0">
                    {!isLeft ? (
                      <RoadmapStepCard
                        step={step}
                        onOpenStep={onOpenStep}
                        align="right"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileRoadmap({ steps, onOpenStep }) {
  return (
    <div className="space-y-5 lg:hidden">
      {steps.map((step) => (
        <div
          key={step.id}
          className={[
            "relative rounded-[22px] border p-4 shadow-sm",
            step.completed
              ? "border-green-200 bg-green-50"
              : step.locked
              ? "border-[#e1e6dc] bg-[#f7f8f3] opacity-90"
              : "border-[#d9ddd2] bg-white",
          ].join(" ")}
        >
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold",
                  step.completed
                    ? "bg-green-600 text-white"
                    : step.professorCompleted
                    ? "bg-[#f1b337] text-white"
                    : "bg-red-400 text-white",
                ].join(" ")}
              >
                {step.completed ? "✓" : step.index + 1}
              </div>

              {step.index !== steps.length - 1 ? (
                <div className="mt-2 h-16 w-[4px] rounded-full bg-[#8a936e]" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <StatusPill step={step} />
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#395345] ring-1 ring-[#d7ddd0]">
                  {step.code}
                </span>
              </div>

              <div className="mt-3 text-lg font-extrabold text-[#45674b]">
                {step.title}
              </div>

              <p className="mt-2 text-sm leading-6 text-[#647166]">
                {step.groupTitle}
              </p>

              <div className="mt-3 text-xs font-bold text-[#627165]">
                Score: {step.latestScore ? `${step.latestScore}%` : "-"} |
                Attempts: {step.attemptCount}
              </div>

              <button
                type="button"
                disabled={step.locked}
                onClick={() => onOpenStep(step)}
                className={[
                  "mt-4 rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-[0.14em]",
                  step.locked
                    ? "cursor-not-allowed bg-[#d7ddd0] text-[#657367]"
                    : step.completed
                    ? "bg-green-600 text-white"
                    : "bg-[#45674b] text-white",
                ].join(" ")}
              >
                {step.completed
                  ? "Open Again"
                  : step.locked
                  ? "Locked"
                  : "Open Step"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


function buildStudyModulePages(selectedStep, selectedStudyModule) {
  if (!selectedStep || !selectedStudyModule) return [];

  const objectives = Array.isArray(selectedStudyModule.objectives)
    ? selectedStudyModule.objectives
    : [];
  const discussion = Array.isArray(selectedStudyModule.discussion)
    ? selectedStudyModule.discussion
    : [];
  const procedures = Array.isArray(selectedStudyModule.procedures)
    ? selectedStudyModule.procedures
    : [];
  const keyTerms = Array.isArray(selectedStudyModule.keyTerms)
    ? selectedStudyModule.keyTerms
    : [];
  const checklist = Array.isArray(selectedStudyModule.checklist)
    ? selectedStudyModule.checklist
    : [];
  const lessonPoints = Array.isArray(selectedStep.lessonPoints)
    ? selectedStep.lessonPoints
    : [];

  return [
    {
      key: "overview",
      label: "Overview",
      eyebrow: "Stage 1",
      title: "Module Overview",
      description: "Start with the purpose of this competency before reviewing the details.",
      content: (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
              Competency
            </div>
            <h4 className="mt-2 text-2xl font-extrabold text-[#395345]">
              {selectedStep.title}
            </h4>
            <p className="mt-2 text-sm leading-7 text-[#647166]">
              Code: <span className="font-bold text-[#395345]">{selectedStep.code}</span>
            </p>
            <p className="text-sm leading-7 text-[#647166]">
              Group: <span className="font-bold text-[#395345]">{selectedStep.groupTitle}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
            <div className="text-sm font-extrabold text-[#395345]">
              What this module is about
            </div>
            <p className="mt-3 text-sm leading-7 text-[#647166]">
              {selectedStudyModule.overview ||
                `This module teaches the competency "${selectedStep.title}" under ${selectedStep.groupTitle}.`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "objectives",
      label: "Objectives",
      eyebrow: "Stage 2",
      title: "Learning Objectives",
      description: "These are the expected learning outcomes before you answer the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ul className="space-y-3 text-sm leading-7 text-[#647166]">
            {(objectives.length ? objectives : [
              "Understand the competency.",
              "Apply the skill.",
              "Prepare for the exam.",
            ]).map((item, index) => (
              <li key={`objective-page-${index}`} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#395345] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: "discussion",
      label: "Discussion",
      eyebrow: "Stage 3",
      title: "Lesson Discussion",
      description: "Read the lesson explanation carefully before moving forward.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <div className="space-y-4">
            {(discussion.length ? discussion : [
              "Study the meaning, purpose, and proper application of this competency before answering the exam.",
            ]).map((paragraph, index) => (
              <p
                key={`discussion-page-${index}`}
                className="text-sm leading-7 text-[#647166]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "procedure",
      label: "Procedure",
      eyebrow: "Stage 4",
      title: "Step-by-Step Procedure",
      description: "Follow this sequence while studying and practicing the competency.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ol className="space-y-3 text-sm leading-7 text-[#647166]">
            {(procedures.length ? procedures : [
              "Read the module.",
              "Review the lesson points.",
              "Answer the exam.",
            ]).map((item, index) => (
              <li key={`procedure-page-${index}`} className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#395345] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      key: "scenario",
      label: "Scenario",
      eyebrow: "Stage 5",
      title: "Real Workplace Scenario",
      description: "Connect the lesson to a realistic training or workplace situation.",
      content: (
        <div className="rounded-2xl bg-[#eef1e7] p-5 ring-1 ring-[#d7ddd0]">
          <p className="text-sm leading-7 text-[#647166]">
            {selectedStudyModule.scenario ||
              "Apply this competency in a realistic training situation."}
          </p>
        </div>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      eyebrow: "Stage 6",
      title: "Practice Activity",
      description: "Use this activity to check your understanding before the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <p className="text-sm leading-7 text-[#647166]">
            {selectedStudyModule.activity ||
              "Write three key things you learned from this competency."}
          </p>
        </div>
      ),
    },
    {
      key: "terms",
      label: "Key Terms",
      eyebrow: "Stage 7",
      title: "Key Terms",
      description: "Review important words or concepts used in this competency.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <div className="flex flex-wrap gap-2">
            {(keyTerms.length ? keyTerms : ["Competency", "Skill", "Training", "Assessment"]).map(
              (term, index) => (
                <span
                  key={`term-page-${index}`}
                  className="rounded-full bg-[#f7f8f3] px-4 py-2 text-xs font-bold text-[#395345] ring-1 ring-[#d7ddd0]"
                >
                  {term}
                </span>
              )
            )}
          </div>
        </div>
      ),
    },
    {
      key: "checklist",
      label: "Checklist",
      eyebrow: "Stage 8",
      title: "Readiness Checklist",
      description: "Make sure you can confirm these before taking the exam.",
      content: (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
          <ul className="space-y-3 text-sm leading-7 text-[#647166]">
            {(checklist.length ? checklist : [
              "I reviewed the module.",
              "I understand the skill.",
              "I am ready for the exam.",
            ]).map((item, index) => (
              <li key={`checklist-page-${index}`} className="flex gap-3">
                <span className="font-bold text-green-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: "summary",
      label: "Summary",
      eyebrow: "Final Stage",
      title: "Module Summary",
      description: "Review the important points, then continue to the exam.",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {(lessonPoints.length ? lessonPoints : [
              "Review this competency before taking the exam.",
            ]).map((point, index) => (
              <div
                key={`${selectedStep.id}-summary-page-${index}`}
                className="rounded-xl border border-[#dde3d6] bg-[#f7f8f3] px-4 py-3"
              >
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                  Lesson Point {index + 1}
                </div>
                <p className="mt-1 text-sm leading-6 text-[#395345]">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Professor Competency Check
              </div>
              <div
                className={[
                  "mt-2 text-sm font-bold",
                  selectedStep.professorCompleted ? "text-green-700" : "text-red-700",
                ].join(" ")}
              >
                {selectedStep.professorCompleted ? "Checked by professor" : "Not checked yet"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Exam Status
              </div>
              <div
                className={[
                  "mt-2 text-sm font-bold",
                  selectedStep.examPassed ? "text-green-700" : "text-yellow-700",
                ].join(" ")}
              >
                {selectedStep.examPassed ? "Passed" : "Not passed yet"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Latest Score
              </div>
              <div className="mt-2 text-sm text-[#395345]">
                {selectedStep.latestScore ? `${selectedStep.latestScore}%` : "-"}
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                Attempts
              </div>
              <div className="mt-2 text-sm text-[#395345]">
                {selectedStep.attemptCount}
              </div>
            </div>
          </div>

          {!selectedStep.professorCompleted ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800 ring-1 ring-red-200">
              You can study the module and take the exam now. The next roadmap step will only unlock after your professor checks this competency.
            </div>
          ) : null}
        </div>
      ),
    },
  ];
}


function RoadmapStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 text-white ring-1 ring-white/20">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
        {label}
      </div>

      <div className="mt-1 text-sm font-extrabold">{value}</div>
    </div>
  );
}

export default function TraineeRoadmap() {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState("");
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalPage, setModalPage] = useState("lesson");
  const [studyPageIndex, setStudyPageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);

  const storageKey = useMemo(
    () => getRoadmapStorageKey(user, course),
    [user, course]
  );

  const [roadmapProgress, setRoadmapProgress] = useState({
    examPassed: {},
    attempts: {},
    scores: {},
    completedAt: {},
    answers: {},
  });

  useEffect(() => {
    setRoadmapProgress(readRoadmapProgress(storageKey));
  }, [storageKey]);

  async function loadRoadmap({ silent = false } = {}) {
    if (!token) {
      setLoading(false);
      redirectToTraineeLogin(navigate);
      return;
    }

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setMsg({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/training/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        if (isTrainingAuthResponse(res, data)) {
          redirectToTraineeLogin(navigate, {
            message: data?.message || "Please login again.",
          });
          return;
        }

        throw new Error(data?.message || "Failed to load competency roadmap.");
      }

      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("trainingUser", JSON.stringify(data.user));
      }

      setProgress(data?.progress || null);
      setCourse(data?.progress?.course || data?.user?.course || "");

      if (silent) {
        setMsg({
          type: "success",
          text: "Roadmap refreshed from professor competency checklist.",
        });
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Failed to load competency roadmap.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, [token, navigate]);

  const competencyStepsRaw = useMemo(() => {
    const steps = flattenCompetencyGroups(progress?.competencyGroups || []);

    return steps.map((step) => ({
      ...step,
      course: progress?.course || course,
      lessonPoints: buildLessonPoints({
        ...step,
        course: progress?.course || course,
      }),
    }));
  }, [progress, course]);

  const steps = useMemo(() => {
    return competencyStepsRaw.map((step, index) => {
      const prev = competencyStepsRaw[index - 1];
      const prevId = prev?.id || "";

      const examPassed = Boolean(roadmapProgress?.examPassed?.[step.id]);
      const professorCompleted = step.professorCompleted === true;
      const completed = professorCompleted && examPassed;

      const previousCompleted =
        index === 0 ||
        (Boolean(roadmapProgress?.examPassed?.[prevId]) &&
          prev?.professorCompleted === true);

      const locked = !previousCompleted;

      return {
        ...step,
        index,
        examPassed,
        professorCompleted,
        completed,
        locked,
        latestScore: Number(roadmapProgress?.scores?.[step.id] || 0),
        attemptCount: Number(roadmapProgress?.attempts?.[step.id] || 0),
        completedAt: roadmapProgress?.completedAt?.[step.id] || null,
      };
    });
  }, [competencyStepsRaw, roadmapProgress]);

  const completedCount = steps.filter((step) => step.completed).length;

  const progressPercent = steps.length
    ? Math.round((completedCount / steps.length) * 100)
    : 0;

  const nextOpenStep =
    steps.find((step) => !step.completed && !step.locked) || null;

  const examQuestions = useMemo(() => {
    if (!selectedStep) return [];
    return selectQuestions(course, selectedStep, EXAM_QUESTION_COUNT);
  }, [course, selectedStep]);

  const profilePhotoUrl = user?.profilePhoto?.fileId
    ? buildTrainingFileUrl(user.profilePhoto.fileId)
    : "";

  const fullName = user
    ? `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim()
    : "";

  const traineeDisplayName = fullName || "TAMSI Trainee";
  const traineeEmail = user?.email || user?.traineeEmail || "traineeemail@tamsi.com";

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function goToProfile() {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  }

  function logout() {
    clearTrainingSession();
    navigate("/trainee-login", { replace: true });
  }

  function openStep(step) {
    if (!step || step.locked) return;

    setSelectedStep(step);
    setModalPage("lesson");
    setStudyPageIndex(0);
    setAnswers(roadmapProgress?.answers?.[step.id] || {});
    setExamResult(null);
  }

  function closeModal() {
    setSelectedStep(null);
    setModalPage("lesson");
    setStudyPageIndex(0);
    setAnswers({});
    setExamResult(null);
  }

  function saveExamResult({ step, nextAnswers }) {
    if (!step) return;

    if (examQuestions.length < EXAM_QUESTION_COUNT) {
      setMsg({
        type: "error",
        text: "Exam questions are incomplete. Please reopen this roadmap step.",
      });
      return;
    }

    if (Object.keys(nextAnswers).length < examQuestions.length) {
      setMsg({
        type: "error",
        text: "Please answer all questions first.",
      });
      return;
    }

    const correctCount = examQuestions.reduce((total, question, index) => {
      return total + (nextAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    const scorePercent = Math.round((correctCount / examQuestions.length) * 100);
    const examPassed = correctCount >= PASSING_SCORE;
    const professorPassed = step.professorCompleted === true;
    const unlockNext = examPassed && professorPassed;

    const nextProgress = {
      examPassed: {
        ...(roadmapProgress?.examPassed || {}),
      },
      attempts: {
        ...(roadmapProgress?.attempts || {}),
        [step.id]: Number(roadmapProgress?.attempts?.[step.id] || 0) + 1,
      },
      scores: {
        ...(roadmapProgress?.scores || {}),
        [step.id]: scorePercent,
      },
      completedAt: {
        ...(roadmapProgress?.completedAt || {}),
      },
      answers: {
        ...(roadmapProgress?.answers || {}),
        [step.id]: nextAnswers,
      },
    };

    if (examPassed) {
      nextProgress.examPassed[step.id] = true;
    }

    if (unlockNext) {
      nextProgress.completedAt[step.id] = new Date().toISOString();
    }

    setRoadmapProgress(nextProgress);
    writeRoadmapProgress(storageKey, nextProgress);

    setExamResult({
      examPassed,
      professorPassed,
      unlockNext,
      correctCount,
      total: examQuestions.length,
      scorePercent,
      wrongItems: examQuestions
        .map((question, index) => ({
          ...question,
          selectedAnswer: nextAnswers[index] || "",
        }))
        .filter((item) => item.selectedAnswer !== item.answer),
    });

    setModalPage("result");

    setMsg({
      type: unlockNext ? "success" : "error",
      text: unlockNext
        ? "Competency exam passed and professor already checked this competency. Next roadmap step is now unlocked."
        : examPassed
        ? "Exam passed, but this competency still needs professor check before the next step unlocks."
        : "Exam not passed yet. Review the study module and try again.",
    });
  }

  function updateAnswer(questionIndex, option) {
    const nextAnswers = {
      ...answers,
      [questionIndex]: option,
    };

    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length >= examQuestions.length) {
      saveExamResult({
        step: selectedStep,
        nextAnswers,
      });
    }
  }

  function resetCurrentExam() {
    setAnswers({});
    setExamResult(null);
    setModalPage("exam");
  }

  const selectedStudyModule = selectedStep
    ? buildStudyModuleSections(selectedStep)
    : null;

  const studyPages = useMemo(
    () => buildStudyModulePages(selectedStep, selectedStudyModule),
    [selectedStep, selectedStudyModule]
  );

  const currentStudyPageIndex = Math.min(
    Math.max(studyPageIndex, 0),
    Math.max(studyPages.length - 1, 0)
  );
  const currentStudyPage = studyPages[currentStudyPageIndex] || null;
  const isFirstStudyPage = currentStudyPageIndex <= 0;
  const isLastStudyPage = currentStudyPageIndex >= studyPages.length - 1;

  return (
    <div className="min-h-screen bg-[#123a20] text-[#395345]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="flex items-center gap-3"
            aria-label="TAMSI Home"
          >
            <img
              src="/TAMSILogoTransparent.png"
              alt="TAMSI Logo"
              className="h-12 w-12 object-contain"
            />

            <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
              TAMSI
            </span>
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              type="button"
              onClick={() => goTo("/trainee-home")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-roadmap")}
              className="border-b-2 border-[#45674b] pb-1 text-[11px] font-bold uppercase tracking-wide text-[#173d25] xl:text-[12px]"
            >
              Roadmap
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-attendance")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-modules")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Modules
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-assignment")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Assignment
            </button>

            <button
              type="button"
              onClick={() => goTo("/trainee-progress")}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Progress
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={goToProfile}
              className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={goToProfile}
              className="h-10 w-10 overflow-hidden rounded-full bg-[#d8d8d8] ring-2 ring-[#45674b]/20"
              aria-label="Profile"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] lg:hidden"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 lg:hidden">
            <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
              <button
                type="button"
                onClick={() => goTo("/trainee-home")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-roadmap")}
                className="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-bold text-[#173d25]"
              >
                Roadmap
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-attendance")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Attendance
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-modules")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-assignment")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Assignment
              </button>

              <button
                type="button"
                onClick={() => goTo("/trainee-progress")}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                Progress
              </button>

              <button
                type="button"
                onClick={goToProfile}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#45674b] hover:bg-white"
              >
                <span>Profile</span>

                <span className="h-8 w-8 overflow-hidden rounded-full bg-[#d8d8d8]">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/80x80/d7ddd4/45674b?text=P";
                      }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* BANNER IMAGE */}
        <section className="h-[180px] overflow-hidden bg-[#cad1c5] sm:h-[230px] md:h-[290px]">
          <img
            src="/tamsi-building.jpg"
            alt="TAMSI Building"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
            }}
          />
        </section>

        {/* ROADMAP TITLE */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute left-8 top-7 opacity-35">
            <span className="absolute left-0 top-0 h-11 w-11 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-7 top-3 h-12 w-12 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-0 top-16 h-9 w-9 rounded-full bg-[#a8c39f]" />
          </div>

          <div className="pointer-events-none absolute right-20 top-7 opacity-35">
            <span className="absolute left-0 top-0 h-12 w-12 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-7 top-9 h-14 w-14 rounded-full bg-[#a8c39f]" />
            <span className="absolute left-20 top-20 h-8 w-8 rounded-full bg-[#a8c39f]" />
          </div>

          <div className="relative mx-auto max-w-[1280px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-['Montserrat',sans-serif] text-3xl font-extrabold drop-shadow-md sm:text-4xl md:text-5xl">
                  Competency Roadmap
                </h1>

                <div className="mt-4 h-[3px] max-w-[520px] rounded-full bg-white/45" />

                <p className="mt-3 text-sm font-semibold text-white/85">
                  {traineeDisplayName} • {traineeEmail}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[560px]">
                <RoadmapStat label="Course" value={course || "Not assigned"} />
                <RoadmapStat
                  label="Completed"
                  value={`${completedCount}/${steps.length || 0}`}
                />
                <RoadmapStat label="Progress" value={`${progressPercent}%`} />
              </div>
            </div>
          </div>
        </section>

        {/* ROADMAP CONTENT */}
        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            {msg.text ? (
              <div
                className={[
                  "mb-6 rounded-xl px-4 py-3 text-sm font-semibold",
                  msg.type === "success"
                    ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                    : "bg-red-50 text-red-800 ring-1 ring-red-200",
                ].join(" ")}
              >
                {msg.text}
              </div>
            ) : null}

            <div className="mb-6 rounded-2xl bg-white p-5 text-[#45674b] shadow-xl">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#45674b]">
                    Competency-Based Roadmap
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#45674b]/75">
                    Each step is based on your course competencies. Study the
                    module, take the exam, and wait for the professor check.
                    The next step unlocks only after both requirements are done.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-2xl bg-[#f7f8f3] px-4 py-3 text-left ring-1 ring-[#e2e8da]">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#748175]">
                      Next Step
                    </div>

                    <div className="mt-1 max-w-[260px] text-sm font-extrabold text-[#45674b]">
                      {nextOpenStep?.title ||
                        "All completed or waiting professor check"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadRoadmap({ silent: true })}
                    disabled={refreshing}
                    className="rounded-full bg-[#45674b] px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#2f463a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refreshing ? "Refreshing..." : "Refresh Professor Check"}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                Loading competency roadmap...
              </div>
            ) : !course ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-red-700 shadow-xl">
                No course assigned to this trainee account yet.
              </div>
            ) : !steps.length ? (
              <div className="rounded-xl bg-white px-5 py-5 text-sm font-semibold text-[#45674b] shadow-xl">
                No competency roadmap found for this course yet.
              </div>
            ) : (
              <>
                <DesktopRoadmap steps={steps} onOpenStep={openStep} />
                <MobileRoadmap steps={steps} onOpenStep={openStep} />
              </>
            )}
          </div>
        </section>

        <div className="h-[55px] bg-[#123a20]" />
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-[#4d6f55]">
        <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
            <div className="border-[#d6ded2] md:border-r md:pr-5">
              <div className="flex items-center gap-3">
                <img
                  src="/LTCLogo.png"
                  alt="Lumispire Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/80x80/ffffff/4d6f55?text=L";
                  }}
                />

                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                  LUMISPIRE
                </h2>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

              <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-0.5 text-[11px] font-semibold text-[#6b776d]">
                <button
                  type="button"
                  onClick={() => goTo("/trainee-home")}
                  className="text-left hover:text-[#173d25]"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-roadmap")}
                  className="text-left hover:text-[#173d25]"
                >
                  Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-attendance")}
                  className="text-left hover:text-[#173d25]"
                >
                  Attendance
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-modules")}
                  className="text-left hover:text-[#173d25]"
                >
                  Modules
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-assignment")}
                  className="text-left hover:text-[#173d25]"
                >
                  Assignment
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/trainee-progress")}
                  className="text-left hover:text-[#173d25]"
                >
                  Progress
                </button>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Contact Information
              </h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>ltc.tamsi@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>0995906805 / 09516281271</p>
              </div>
            </div>

            <div className="border-[#d6ded2] md:border-r md:px-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">Address</h3>

              <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
                <p>2/F 5441 Currie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:pl-5">
              <h3 className="text-xs font-extrabold text-[#45674b]">
                Follow Us
              </h3>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d6ded2] pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>

      <RoadmapModal
        open={Boolean(selectedStep)}
        onClose={closeModal}
        title={
          selectedStep
            ? `${selectedStep.title} ${
                modalPage === "exam"
                  ? "- Exam"
                  : modalPage === "result"
                  ? "- Result"
                  : "- Study Module"
              }`
            : "Competency Roadmap"
        }
      >
        {selectedStep ? (
          <>
            {modalPage === "lesson" && selectedStudyModule && currentStudyPage ? (
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill step={selectedStep} />
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#395345] ring-1 ring-[#d7ddd0]">
                      {selectedStep.code}
                    </span>
                  </div>

                  <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
                    Full Competency Study Module
                  </div>

                  <h4 className="mt-2 text-xl font-extrabold leading-tight text-[#395345]">
                    {selectedStep.title}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-[#647166]">
                    Group: <span className="font-bold">{selectedStep.groupTitle}</span>
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#dce3d6]">
                    <div
                      className="h-full rounded-full bg-[#395345] transition-all"
                      style={{
                        width: `${Math.round(
                          ((currentStudyPageIndex + 1) / studyPages.length) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 text-xs font-bold text-[#647166]">
                    Stage {currentStudyPageIndex + 1} of {studyPages.length}
                  </div>

                  <div className="mt-5 space-y-2">
                    {studyPages.map((page, index) => {
                      const active = index === currentStudyPageIndex;
                      const done = index < currentStudyPageIndex;

                      return (
                        <button
                          key={page.key}
                          type="button"
                          onClick={() => setStudyPageIndex(index)}
                          className={[
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs font-bold transition",
                            active
                              ? "bg-[#395345] text-white"
                              : done
                              ? "bg-green-50 text-green-800 ring-1 ring-green-100"
                              : "bg-white text-[#395345] ring-1 ring-[#e2e8da] hover:bg-[#eef1e7]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                              active
                                ? "bg-white text-[#395345]"
                                : done
                                ? "bg-green-600 text-white"
                                : "bg-[#f7f8f3] text-[#395345] ring-1 ring-[#d7ddd0]",
                            ].join(" ")}
                          >
                            {done ? "✓" : index + 1}
                          </span>
                          <span>{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="rounded-2xl bg-white ring-1 ring-[#e2e8da]">
                  <div className="border-b border-[#edf1e8] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#748175]">
                      {currentStudyPage.eyebrow}
                    </div>
                    <h4 className="mt-2 text-2xl font-extrabold text-[#395345]">
                      {currentStudyPage.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#647166]">
                      {currentStudyPage.description}
                    </p>
                  </div>

                  <div className="min-h-[330px] p-5">
                    {currentStudyPage.content}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1e8] bg-[#fbfcf8] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#748175]">
                      {isLastStudyPage
                        ? "Ready for exam"
                        : `Next: ${studyPages[currentStudyPageIndex + 1]?.label || "Continue"}`}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        disabled={isFirstStudyPage}
                        onClick={() =>
                          setStudyPageIndex((current) => Math.max(current - 1, 0))
                        }
                        className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {!isLastStudyPage ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStudyPageIndex((current) =>
                              Math.min(current + 1, studyPages.length - 1)
                            )
                          }
                          className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                        >
                          Next Stage
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resetCurrentExam}
                          className="rounded-2xl bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                        >
                          Next: Take Exam
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {modalPage === "exam" ? (
              <div>
                <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold text-[#355345]">
                        Competency Exam
                      </h4>
                      <p className="mt-1 text-sm text-[#647166]">
                        Select your answer using the radio buttons. After you
                        answer the last question, the exam will automatically
                        check your score.
                      </p>
                    </div>

                    <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#395345] ring-1 ring-[#d7ddd0]">
                      Answered: {Object.keys(answers).length}/
                      {examQuestions.length}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {examQuestions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-[#dde3d6] bg-white p-5 ring-1 ring-black/5"
                    >
                      <div className="text-sm font-bold uppercase tracking-[0.14em] text-[#748175]">
                        Question {questionIndex + 1}
                      </div>

                      <h5 className="mt-2 text-base font-semibold text-[#355345]">
                        {question.prompt}
                      </h5>

                      <div className="mt-4 space-y-3">
                        {question.options.map((option) => {
                          const checked = answers[questionIndex] === option;

                          return (
                            <label
                              key={option}
                              className={[
                                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                                checked
                                  ? "border-[#395345] bg-[#eef3eb]"
                                  : "border-[#dde3d6] bg-[#fafbf8]",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                value={option}
                                checked={checked}
                                onChange={() =>
                                  updateAnswer(questionIndex, option)
                                }
                                className="mt-1"
                              />
                              <span className="text-sm text-[#355345]">
                                {option}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPage("lesson")}
                    className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                  >
                    Back to Study Module
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      saveExamResult({
                        step: selectedStep,
                        nextAnswers: answers,
                      })
                    }
                    className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                  >
                    Check Now
                  </button>
                </div>
              </div>
            ) : null}

            {modalPage === "result" && examResult ? (
              <div>
                <div
                  className={[
                    "rounded-2xl p-6 ring-1",
                    examResult.unlockNext
                      ? "bg-green-50 text-green-900 ring-green-200"
                      : examResult.examPassed
                      ? "bg-yellow-50 text-yellow-900 ring-yellow-200"
                      : "bg-red-50 text-red-900 ring-red-200",
                  ].join(" ")}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em]">
                    Exam Result
                  </div>

                  <h4 className="mt-2 text-2xl font-extrabold">
                    {examResult.unlockNext
                      ? "Step Completed"
                      : examResult.examPassed
                      ? "Exam Passed - Waiting Professor Check"
                      : "Exam Not Passed"}
                  </h4>

                  <p className="mt-2 text-sm">
                    Score:{" "}
                    <span className="font-bold">
                      {examResult.correctCount}
                    </span>{" "}
                    / {examResult.total} ({examResult.scorePercent}%)
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-white/70 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em]">
                        Exam Requirement
                      </div>
                      <div className="mt-2 text-sm font-bold">
                        {examResult.examPassed
                          ? "Passed"
                          : "Needs at least 7/10"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/70 p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold uppercase tracking-[0.14em]">
                        Professor Competency Check
                      </div>
                      <div className="mt-2 text-sm font-bold">
                        {examResult.professorPassed
                          ? "Already checked"
                          : "Not checked yet"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6">
                    {examResult.unlockNext
                      ? "The next roadmap step is now unlocked."
                      : examResult.examPassed
                      ? "You passed the exam, but your professor must check this competency before the next step unlocks. Click Refresh Professor Check after your professor updates it."
                      : "Review the study module and retake the exam."}
                  </p>
                </div>

                {examResult.wrongItems.length ? (
                  <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#e2e8da]">
                    <h5 className="text-base font-extrabold text-[#355345]">
                      Review Wrong Answers
                    </h5>

                    <div className="mt-4 space-y-4">
                      {examResult.wrongItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="rounded-xl border border-[#ede2e2] bg-[#fff7f7] p-4"
                        >
                          <p className="text-sm font-semibold text-[#355345]">
                            {item.prompt}
                          </p>
                          <p className="mt-2 text-sm text-red-700">
                            Your answer: {item.selectedAnswer || "-"}
                          </p>
                          <p className="mt-1 text-sm text-green-700">
                            Correct answer: {item.answer}
                          </p>
                          <p className="mt-2 text-xs text-[#647166]">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPage("lesson")}
                    className="rounded-2xl border border-[#c9d0c1] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345]"
                  >
                    Review Study Module
                  </button>

                  {!examResult.examPassed ? (
                    <button
                      type="button"
                      onClick={resetCurrentExam}
                      className="rounded-2xl bg-[#c45f34] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Retake Exam
                    </button>
                  ) : null}

                  {!examResult.professorPassed ? (
                    <button
                      type="button"
                      onClick={() => loadRoadmap({ silent: true })}
                      className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Refresh Professor Check
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl bg-[#395345] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
                  >
                    Close Roadmap
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </RoadmapModal>
    </div>
  );
}
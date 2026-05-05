function courseKeyFromName(value = "") {
  const clean = String(value || "").trim().toLowerCase();
  if (clean === "housekeeping") return "housekeeping";
  if (clean === "event management") return "event-management";
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getCourseKey(value = "") {
  return courseKeyFromName(value);
}

export function getLearningPathFromPercent(percent = 0) {
  const safe = Number(percent || 0);
  if (safe >= 85) return "advanced";
  if (safe >= 60) return "intermediate";
  return "beginner";
}

export const DEFAULT_PRETEST_BANK = {
  housekeeping: {
    title: "Housekeeping Pre-Test",
    description:
      "This pre-test checks your cleaning, room preparation, safety, sanitation, and guest service knowledge before your module sequence starts.",
    passingScorePercent: 60,
    questions: [
      {
        prompt: "Which task should be done first when preparing a guest room for cleaning?",
        options: [
          "Arrange decorative pillows",
          "Collect used linens and remove trash",
          "Polish the mirror",
          "Refill the minibar first",
        ],
        correctAnswer: "Collect used linens and remove trash",
        explanation: "Removing waste and used items first prepares the room for full cleaning.",
        points: 1,
      },
      {
        prompt: "What is the best way to prevent cross-contamination during housekeeping work?",
        options: [
          "Use one cloth everywhere",
          "Use color-coded cleaning tools",
          "Mix all chemicals together",
          "Clean the toilet last without gloves",
        ],
        correctAnswer: "Use color-coded cleaning tools",
        explanation: "Color-coded materials help separate tools for different areas.",
        points: 1,
      },
      {
        prompt: "Why must high-touch surfaces be disinfected carefully?",
        options: [
          "To make them shiny only",
          "To reduce germs on frequently touched areas",
          "To remove paint marks",
          "To change room odor",
        ],
        correctAnswer: "To reduce germs on frequently touched areas",
        explanation: "Switches, remotes, and handles need disinfection for hygiene and safety.",
        points: 1,
      },
      {
        prompt: "What should you do if you notice damaged room equipment?",
        options: [
          "Ignore it if the guest has not complained",
          "Report it immediately using the proper process",
          "Repair it yourself without permission",
          "Hide it from the guest",
        ],
        correctAnswer: "Report it immediately using the proper process",
        explanation: "Reporting defects protects guests and helps maintenance act properly.",
        points: 1,
      },
      {
        prompt: "What is the correct purpose of a final room inspection?",
        options: [
          "To decorate the room again",
          "To check if the room is guest-ready",
          "To delay room release",
          "To avoid cleaning the bathroom",
        ],
        correctAnswer: "To check if the room is guest-ready",
        explanation: "The final inspection ensures cleanliness, completeness, and readiness.",
        points: 1,
      },
      {
        prompt: "When making the bed, what shows good housekeeping standard?",
        options: [
          "Wrinkled sheets are acceptable",
          "Use clean and properly tucked linens",
          "Leave the blanket folded at the chair",
          "Skip pillow arrangement",
        ],
        correctAnswer: "Use clean and properly tucked linens",
        explanation: "A neat, clean, and properly made bed reflects quality room preparation.",
        points: 1,
      },
      {
        prompt: "Which cleaning chemical should never be mixed with another unless instructed?",
        options: [
          "Plain water",
          "Detergent soap",
          "Bleach",
          "Glass cleaner cloth",
        ],
        correctAnswer: "Bleach",
        explanation: "Bleach can produce dangerous fumes when mixed with some chemicals.",
        points: 1,
      },
      {
        prompt: "What should be done before entering an occupied guest room for service?",
        options: [
          "Open the door immediately",
          "Knock and announce housekeeping",
          "Use a master key without notice",
          "Call another guest first",
        ],
        correctAnswer: "Knock and announce housekeeping",
        explanation: "This respects guest privacy and follows proper service protocol.",
        points: 1,
      },
      {
        prompt: "How should wet floors be handled during cleaning?",
        options: [
          "Leave them without warning",
          "Place a warning sign and dry as needed",
          "Cover them with towels only",
          "Ignore them if no guest is present",
        ],
        correctAnswer: "Place a warning sign and dry as needed",
        explanation: "Wet floor signs reduce the risk of slips and accidents.",
        points: 1,
      },
      {
        prompt: "What is the proper action when you find a guest’s valuable item left behind?",
        options: [
          "Take it home for safekeeping",
          "Follow lost-and-found procedure immediately",
          "Leave it hidden in the room",
          "Give it to another staff without log entry",
        ],
        correctAnswer: "Follow lost-and-found procedure immediately",
        explanation: "Lost-and-found items must be recorded and handled properly.",
        points: 1,
      },
      {
        prompt: "Why is standard room inventory checking important?",
        options: [
          "It wastes time",
          "It ensures complete guest supplies and reports missing items",
          "It avoids room cleaning",
          "It replaces final inspection",
        ],
        correctAnswer: "It ensures complete guest supplies and reports missing items",
        explanation: "Inventory checking supports room readiness and accountability.",
        points: 1,
      },
      {
        prompt: "Which personal protective equipment is commonly needed in housekeeping?",
        options: [
          "Dance shoes",
          "Gloves and mask when appropriate",
          "Necktie and watch only",
          "Helmet only",
        ],
        correctAnswer: "Gloves and mask when appropriate",
        explanation: "PPE helps protect the worker from chemicals, dirt, and contamination.",
        points: 1,
      },
      {
        prompt: "What should a housekeeper do before using a chemical product?",
        options: [
          "Guess the right amount",
          "Read the label and instructions",
          "Mix it with perfume",
          "Use the strongest possible amount",
        ],
        correctAnswer: "Read the label and instructions",
        explanation: "Proper label reading helps ensure safe and effective chemical use.",
        points: 1,
      },
      {
        prompt: "Why should guest requests be noted carefully?",
        options: [
          "To ignore them later",
          "To personalize and improve service",
          "To delay room release",
          "To reduce communication",
        ],
        correctAnswer: "To personalize and improve service",
        explanation: "Guest requests help provide better satisfaction and service consistency.",
        points: 1,
      },
      {
        prompt: "What should be cleaned from cleaner areas to dirtier areas?",
        options: [
          "Nothing follows that sequence",
          "The room should be cleaned from dirty to clean only",
          "Clean-to-dirty cleaning sequence should be followed",
          "Bathroom should always be cleaned first with same tools",
        ],
        correctAnswer: "Clean-to-dirty cleaning sequence should be followed",
        explanation: "This helps reduce the spread of dirt and bacteria.",
        points: 1,
      },
      {
        prompt: "Which action best supports proper linen handling?",
        options: [
          "Place clean linens on the floor",
          "Separate clean and soiled linens",
          "Use one basket for all linens without sorting",
          "Store damp linens in closed bags for long periods",
        ],
        correctAnswer: "Separate clean and soiled linens",
        explanation: "Clean and used linens must be separated to maintain hygiene.",
        points: 1,
      },
      {
        prompt: "What is the main purpose of room status updating?",
        options: [
          "To confuse the front desk",
          "To keep departments informed of room readiness",
          "To delay check-in intentionally",
          "To replace room cleaning",
        ],
        correctAnswer: "To keep departments informed of room readiness",
        explanation: "Accurate room status supports coordination between housekeeping and front office.",
        points: 1,
      },
      {
        prompt: "How should housekeeping carts be positioned?",
        options: [
          "Blocking the corridor",
          "Near the room without obstructing exits",
          "Inside the elevator",
          "Far away from work area",
        ],
        correctAnswer: "Near the room without obstructing exits",
        explanation: "Cart placement should support efficiency and safety.",
        points: 1,
      },
      {
        prompt: "Why is hand hygiene important in housekeeping?",
        options: [
          "Only for guests",
          "It helps prevent the spread of germs",
          "It is optional when wearing uniform",
          "It replaces glove use",
        ],
        correctAnswer: "It helps prevent the spread of germs",
        explanation: "Proper hand hygiene is a core infection-control practice.",
        points: 1,
      },
      {
        prompt: "What should be done with broken glass found in a room?",
        options: [
          "Pick it up with bare hands",
          "Sweep and dispose of it using safe procedure",
          "Leave it for the next shift",
          "Hide it in the trash without care",
        ],
        correctAnswer: "Sweep and dispose of it using safe procedure",
        explanation: "Broken glass must be handled safely to avoid injury.",
        points: 1,
      },
      {
        prompt: "Which of the following reflects professional guest interaction?",
        options: [
          "Arguing with the guest",
          "Polite, calm, and respectful communication",
          "Ignoring complaints",
          "Using slang during service",
        ],
        correctAnswer: "Polite, calm, and respectful communication",
        explanation: "Professional communication improves guest trust and experience.",
        points: 1,
      },
      {
        prompt: "Why should bathrooms receive separate cleaning attention?",
        options: [
          "They do not need sanitation",
          "They are high-risk areas for contamination",
          "They are cleaned only when visible dirt appears",
          "They use the same tools as bedding areas",
        ],
        correctAnswer: "They are high-risk areas for contamination",
        explanation: "Bathrooms require proper sanitation because of higher contamination risk.",
        points: 1,
      },
      {
        prompt: "What is the benefit of following a room cleaning checklist?",
        options: [
          "It slows the employee down only",
          "It helps ensure no task is missed",
          "It replaces room supervision",
          "It removes the need for training",
        ],
        correctAnswer: "It helps ensure no task is missed",
        explanation: "Checklists improve consistency and work quality.",
        points: 1,
      },
      {
        prompt: "What should be done if a guest is in the room and asks for later cleaning?",
        options: [
          "Refuse the request",
          "Respect the request and note the schedule",
          "Enter anyway",
          "Ask another guest to decide",
        ],
        correctAnswer: "Respect the request and note the schedule",
        explanation: "Guest preference should be respected and properly recorded.",
        points: 1,
      },
      {
        prompt: "Why is odor control important in housekeeping?",
        options: [
          "Only for staff comfort",
          "It contributes to cleanliness perception and guest comfort",
          "It replaces sanitation",
          "It is unrelated to room quality",
        ],
        correctAnswer: "It contributes to cleanliness perception and guest comfort",
        explanation: "Fresh odor supports the guest’s impression of a clean room.",
        points: 1,
      },
    ],
  },

  "event-management": {
    title: "Event Management Pre-Test",
    description:
      "This pre-test checks your planning, coordination, communication, protocol, operations, and customer handling knowledge before your module sequence starts.",
    passingScorePercent: 60,
    questions: [
      {
        prompt: "What should be finalized first when planning an event?",
        options: [
          "The event budget and objectives",
          "The souvenir design",
          "The stage backdrop color",
          "The social media caption only",
        ],
        correctAnswer: "The event budget and objectives",
        explanation: "Budget and goals guide every major event planning decision.",
        points: 1,
      },
      {
        prompt: "Why is a program flow important during an event?",
        options: [
          "It replaces the need for staff",
          "It helps coordinate timing and responsibilities",
          "It removes the need for contingency plans",
          "It is only for decoration",
        ],
        correctAnswer: "It helps coordinate timing and responsibilities",
        explanation: "A structured program flow keeps the event organized and helps teams stay aligned.",
        points: 1,
      },
      {
        prompt: "What is the best response when a supplier is delayed on event day?",
        options: [
          "Ignore the issue and hope it arrives",
          "Blame the client immediately",
          "Activate the contingency plan and update stakeholders",
          "Cancel the whole event without review",
        ],
        correctAnswer: "Activate the contingency plan and update stakeholders",
        explanation: "Quick communication and backup actions are essential in event operations.",
        points: 1,
      },
      {
        prompt: "Which skill matters most when handling guests during an event?",
        options: [
          "Clear and professional communication",
          "Speaking as little as possible",
          "Avoiding team coordination",
          "Changing plans without approval",
        ],
        correctAnswer: "Clear and professional communication",
        explanation: "Professional communication helps solve problems and maintain a positive guest experience.",
        points: 1,
      },
      {
        prompt: "Why is a post-event evaluation important?",
        options: [
          "It is not necessary after a successful event",
          "It identifies results, issues, and improvements",
          "It only increases paperwork",
          "It replaces client feedback",
        ],
        correctAnswer: "It identifies results, issues, and improvements",
        explanation: "Post-event review helps improve future event execution and team performance.",
        points: 1,
      },
      {
        prompt: "What is the purpose of an event brief?",
        options: [
          "To replace the contract",
          "To summarize key event requirements and expectations",
          "To decorate the proposal",
          "To remove the need for meetings",
        ],
        correctAnswer: "To summarize key event requirements and expectations",
        explanation: "An event brief guides planning and aligns teams with the client’s needs.",
        points: 1,
      },
      {
        prompt: "Why must an event team prepare a backup plan?",
        options: [
          "Because the first plan is always wrong",
          "To handle risks and unexpected disruptions",
          "To impress the venue manager only",
          "To remove the need for coordination",
        ],
        correctAnswer: "To handle risks and unexpected disruptions",
        explanation: "Contingency plans help keep the event running despite issues.",
        points: 1,
      },
      {
        prompt: "What should be checked during a venue ocular visit?",
        options: [
          "Only wall paint color",
          "Layout, access, safety, power, and logistics",
          "Only food menu",
          "Only the social media angle",
        ],
        correctAnswer: "Layout, access, safety, power, and logistics",
        explanation: "Venue inspection covers operational and safety needs, not just appearance.",
        points: 1,
      },
      {
        prompt: "Why is supplier coordination essential before event day?",
        options: [
          "To reduce communication",
          "To confirm timing, deliverables, and responsibilities",
          "To avoid written agreements",
          "To increase confusion",
        ],
        correctAnswer: "To confirm timing, deliverables, and responsibilities",
        explanation: "Supplier coordination reduces delays and misunderstandings.",
        points: 1,
      },
      {
        prompt: "What is the correct way to respond to a client last-minute request?",
        options: [
          "Reject it immediately without checking",
          "Assess feasibility, impact, and communicate clearly",
          "Promise it even if impossible",
          "Blame another team member",
        ],
        correctAnswer: "Assess feasibility, impact, and communicate clearly",
        explanation: "Professional event handling requires calm assessment and honest communication.",
        points: 1,
      },
      {
        prompt: "What does RSVP management help control?",
        options: [
          "Only stage lighting",
          "Guest count and attendance planning",
          "Only ticket printing design",
          "Only event hashtags",
        ],
        correctAnswer: "Guest count and attendance planning",
        explanation: "RSVP data supports seating, food, registration, and logistics planning.",
        points: 1,
      },
      {
        prompt: "Why is audience profiling useful in event planning?",
        options: [
          "It is only useful after the event",
          "It helps shape suitable content and experience",
          "It replaces venue inspection",
          "It removes the need for feedback",
        ],
        correctAnswer: "It helps shape suitable content and experience",
        explanation: "Knowing the audience improves program design and engagement.",
        points: 1,
      },
      {
        prompt: "Which document is most useful for assigning event-day tasks?",
        options: [
          "Mood board only",
          "Staff deployment and operations plan",
          "Invitation envelope",
          "Backdrop sketch only",
        ],
        correctAnswer: "Staff deployment and operations plan",
        explanation: "Clear deployment helps the team know where and when to work.",
        points: 1,
      },
      {
        prompt: "What is the value of a technical rehearsal?",
        options: [
          "It delays the event only",
          "It tests flow, timing, audio, visuals, and coordination",
          "It replaces final briefing",
          "It is only for performers",
        ],
        correctAnswer: "It tests flow, timing, audio, visuals, and coordination",
        explanation: "A rehearsal identifies issues before guests arrive.",
        points: 1,
      },
      {
        prompt: "Why should event managers monitor the event timeline closely?",
        options: [
          "To make the event shorter without approval",
          "To keep activities on schedule and coordinate adjustments",
          "To avoid talking to staff",
          "To cancel guest participation",
        ],
        correctAnswer: "To keep activities on schedule and coordinate adjustments",
        explanation: "Timeline monitoring keeps the program under control.",
        points: 1,
      },
      {
        prompt: "What is the best practice when handling VIP guests?",
        options: [
          "Treat protocol casually",
          "Follow protocol and coordinate details carefully",
          "Ignore the seating plan",
          "Change the program without notice",
        ],
        correctAnswer: "Follow protocol and coordinate details carefully",
        explanation: "VIP handling requires planning, protocol awareness, and attention to detail.",
        points: 1,
      },
      {
        prompt: "What does crowd management mainly protect?",
        options: [
          "Only the decorations",
          "Guest safety, flow, and order",
          "Only ticket color coding",
          "Only stage performance timing",
        ],
        correctAnswer: "Guest safety, flow, and order",
        explanation: "Crowd management is essential for safety and smooth movement.",
        points: 1,
      },
      {
        prompt: "What is the role of an event checklist?",
        options: [
          "To create confusion",
          "To track tasks and reduce missed details",
          "To replace team meetings",
          "To remove supplier communication",
        ],
        correctAnswer: "To track tasks and reduce missed details",
        explanation: "Checklists improve consistency and reduce oversight.",
        points: 1,
      },
      {
        prompt: "Why should client approvals be documented?",
        options: [
          "To avoid accountability",
          "To confirm agreed decisions and reduce disputes",
          "To replace proposals",
          "To skip follow-up communication",
        ],
        correctAnswer: "To confirm agreed decisions and reduce disputes",
        explanation: "Documented approvals protect both the client and the event team.",
        points: 1,
      },
      {
        prompt: "How should an event team handle an on-site complaint?",
        options: [
          "Argue with the guest",
          "Respond calmly, acknowledge, and solve promptly",
          "Ignore it if the program continues",
          "Transfer blame immediately",
        ],
        correctAnswer: "Respond calmly, acknowledge, and solve promptly",
        explanation: "Professional recovery protects guest experience and event reputation.",
        points: 1,
      },
      {
        prompt: "What does proper registration management improve?",
        options: [
          "Only decoration setup",
          "Arrival flow, attendance accuracy, and guest experience",
          "Only catering taste",
          "Only stage design",
        ],
        correctAnswer: "Arrival flow, attendance accuracy, and guest experience",
        explanation: "Efficient registration supports a smooth start to the event.",
        points: 1,
      },
      {
        prompt: "Why is budget tracking important during planning?",
        options: [
          "To overspend faster",
          "To keep costs aligned with approved resources",
          "To replace supplier contracts",
          "To delay payments intentionally",
        ],
        correctAnswer: "To keep costs aligned with approved resources",
        explanation: "Budget tracking helps control expenses and decision-making.",
        points: 1,
      },
      {
        prompt: "What is the purpose of event signage?",
        options: [
          "Decoration only",
          "To guide guests and support event flow",
          "To replace ushers",
          "To reduce venue capacity",
        ],
        correctAnswer: "To guide guests and support event flow",
        explanation: "Signage helps participants navigate efficiently.",
        points: 1,
      },
      {
        prompt: "Which action supports good team coordination during live operations?",
        options: [
          "Avoid updates until the event ends",
          "Maintain clear communication channels",
          "Let each staff improvise independently",
          "Remove command structure",
        ],
        correctAnswer: "Maintain clear communication channels",
        explanation: "Real-time coordination helps the team respond quickly to needs.",
        points: 1,
      },
      {
        prompt: "Why should event risks be identified early?",
        options: [
          "To frighten the client",
          "To prepare controls before problems happen",
          "To avoid event permits",
          "To cancel the program layout",
        ],
        correctAnswer: "To prepare controls before problems happen",
        explanation: "Early risk identification improves prevention and readiness.",
        points: 1,
      },
    ],
  },
};


export function buildGenericPretestBank(course = "") {
  const courseName = String(course || "Training Course").trim() || "Training Course";
  const questions = [
    {
      prompt: `What is the best first step before starting a ${courseName} task?`,
      options: ["Understand the instructions and safety reminders", "Skip planning and start immediately", "Use any available tool without checking", "Wait until the task becomes urgent"],
      correctAnswer: "Understand the instructions and safety reminders",
      explanation: "Good preparation helps the trainee work safely and correctly.",
      points: 1,
    },
    {
      prompt: "Why is workplace communication important during training?",
      options: ["It helps prevent mistakes and keeps everyone coordinated", "It is only needed after errors happen", "It replaces actual skills", "It is optional when the trainee is busy"],
      correctAnswer: "It helps prevent mistakes and keeps everyone coordinated",
      explanation: "Clear communication supports teamwork, safety, and quality work.",
      points: 1,
    },
    {
      prompt: "What should a trainee do when they are unsure about a procedure?",
      options: ["Ask the trainer or professor for guidance", "Guess the steps", "Ignore the task", "Copy another trainee without checking"],
      correctAnswer: "Ask the trainer or professor for guidance",
      explanation: "Asking for guidance prevents unsafe or incorrect work.",
      points: 1,
    },
    {
      prompt: "Which behavior shows professionalism during training?",
      options: ["Being punctual, respectful, and prepared", "Arriving late without notice", "Ignoring instructions", "Leaving tasks unfinished"],
      correctAnswer: "Being punctual, respectful, and prepared",
      explanation: "Professional habits are part of workplace readiness.",
      points: 1,
    },
    {
      prompt: "What is the purpose of following a checklist?",
      options: ["To make sure important steps are not missed", "To slow down the work only", "To avoid asking questions", "To replace skill practice"],
      correctAnswer: "To make sure important steps are not missed",
      explanation: "Checklists improve consistency and reduce forgotten tasks.",
      points: 1,
    },
    {
      prompt: "What should be done when equipment or materials appear damaged?",
      options: ["Report it immediately", "Use it anyway", "Hide it", "Give it to another trainee without warning"],
      correctAnswer: "Report it immediately",
      explanation: "Damaged materials can cause safety and quality problems.",
      points: 1,
    },
    {
      prompt: "Why are safety reminders important before practical activities?",
      options: ["They reduce the risk of injury and mistakes", "They are only for beginners", "They replace practice", "They are optional"],
      correctAnswer: "They reduce the risk of injury and mistakes",
      explanation: "Safety reminders protect trainees, staff, and customers.",
      points: 1,
    },
    {
      prompt: "Which action best shows teamwork?",
      options: ["Helping coordinate tasks and respecting assigned roles", "Doing only personal tasks and ignoring others", "Avoiding communication", "Blaming teammates immediately"],
      correctAnswer: "Helping coordinate tasks and respecting assigned roles",
      explanation: "Teamwork requires cooperation, communication, and respect.",
      points: 1,
    },
    {
      prompt: "What should a trainee do after receiving feedback?",
      options: ["Use it to improve the next performance", "Ignore it", "Argue immediately", "Stop practicing"],
      correctAnswer: "Use it to improve the next performance",
      explanation: "Feedback helps identify strengths and areas for improvement.",
      points: 1,
    },
    {
      prompt: "Why is cleanliness important in most service-related tasks?",
      options: ["It supports safety, quality, and customer confidence", "It is only for appearance", "It is not related to work quality", "It replaces training"],
      correctAnswer: "It supports safety, quality, and customer confidence",
      explanation: "Clean work habits support professional service standards.",
      points: 1,
    },
    {
      prompt: "What is the best response to a customer or guest concern?",
      options: ["Listen calmly and report or resolve it properly", "Ignore the concern", "Argue with the customer", "Leave without explanation"],
      correctAnswer: "Listen calmly and report or resolve it properly",
      explanation: "Good service means responding respectfully and responsibly.",
      points: 1,
    },
    {
      prompt: "Why should trainees follow the professor's posted deadlines?",
      options: ["Deadlines help manage progress and assessment", "Deadlines do not matter", "Deadlines only apply to other trainees", "Late work is always better"],
      correctAnswer: "Deadlines help manage progress and assessment",
      explanation: "Timely submissions help the professor track performance.",
      points: 1,
    },
    {
      prompt: "What is the correct action when a required file or proof must be uploaded?",
      options: ["Upload the correct file within the allowed time", "Upload any random file", "Wait until the window closes", "Submit without checking"],
      correctAnswer: "Upload the correct file within the allowed time",
      explanation: "Proper upload behavior keeps attendance and assessment records accurate.",
      points: 1,
    },
    {
      prompt: "Which habit helps a trainee learn practical skills faster?",
      options: ["Practice, ask questions, and review mistakes", "Avoid practice", "Skip instructions", "Memorize without doing"],
      correctAnswer: "Practice, ask questions, and review mistakes",
      explanation: "Practical skills improve through guided practice and reflection.",
      points: 1,
    },
    {
      prompt: "Why should tools and materials be returned after use?",
      options: ["To keep the workplace organized and ready", "To make others look for them", "To hide mistakes", "To avoid responsibility"],
      correctAnswer: "To keep the workplace organized and ready",
      explanation: "Proper organization supports safety and efficiency.",
      points: 1,
    },
    {
      prompt: "What does quality work mean in training?",
      options: ["Completing tasks correctly according to standards", "Finishing fast even with errors", "Ignoring details", "Doing only easy tasks"],
      correctAnswer: "Completing tasks correctly according to standards",
      explanation: "Quality means meeting the expected process and result.",
      points: 1,
    },
    {
      prompt: "Why is attendance important in a training program?",
      options: ["It shows participation and supports completion tracking", "It is unrelated to progress", "It only matters on the first day", "It replaces assessments"],
      correctAnswer: "It shows participation and supports completion tracking",
      explanation: "Attendance is part of training progress and accountability.",
      points: 1,
    },
    {
      prompt: "What should a trainee do before submitting an assignment?",
      options: ["Review the instructions, file, and deadline", "Submit without reading", "Use an unrelated file", "Ask someone else to submit blindly"],
      correctAnswer: "Review the instructions, file, and deadline",
      explanation: "Checking before submission reduces errors.",
      points: 1,
    },
    {
      prompt: "Which action shows responsible use of workplace information?",
      options: ["Keep records accurate and private when needed", "Share private information casually", "Change records without permission", "Ignore documentation"],
      correctAnswer: "Keep records accurate and private when needed",
      explanation: "Responsible documentation protects people and the organization.",
      points: 1,
    },
    {
      prompt: "What is the best way to handle a mistake during practical work?",
      options: ["Report it, correct it if allowed, and learn from it", "Hide it", "Blame someone else", "Continue without checking"],
      correctAnswer: "Report it, correct it if allowed, and learn from it",
      explanation: "Safe correction and honesty are part of professional growth.",
      points: 1,
    },
    {
      prompt: "Why should trainees respect assigned roles during activities?",
      options: ["It keeps the activity organized and accountable", "It prevents learning", "It is only for leaders", "It removes teamwork"],
      correctAnswer: "It keeps the activity organized and accountable",
      explanation: "Clear roles help the team complete work properly.",
      points: 1,
    },
    {
      prompt: "Which action is best when handling time-sensitive tasks?",
      options: ["Prioritize, follow instructions, and update the professor if delayed", "Ignore the deadline", "Rush without quality", "Stop working"],
      correctAnswer: "Prioritize, follow instructions, and update the professor if delayed",
      explanation: "Time management includes planning and communication.",
      points: 1,
    },
    {
      prompt: "Why is it important to understand the goal of a task?",
      options: ["It helps the trainee choose the correct process", "It makes the task optional", "It replaces safety", "It removes the need for review"],
      correctAnswer: "It helps the trainee choose the correct process",
      explanation: "Knowing the goal improves decision-making and task quality.",
      points: 1,
    },
    {
      prompt: "What should a trainee do when a task is completed?",
      options: ["Check the output and clean/organize the work area", "Leave immediately", "Delete records", "Ignore remaining materials"],
      correctAnswer: "Check the output and clean/organize the work area",
      explanation: "Final checking and organization are part of completion standards.",
      points: 1,
    },
    {
      prompt: `What is the main purpose of the ${courseName} pre-test?`,
      options: ["To identify the trainee's starting level and learning needs", "To remove the need for modules", "To automatically complete the course", "To replace professor evaluation"],
      correctAnswer: "To identify the trainee's starting level and learning needs",
      explanation: "The pre-test helps create a better learning path for the trainee.",
      points: 1,
    },
  ];

  return {
    title: `${courseName} Pre-Test`,
    description: `This pre-test checks your readiness, safety awareness, communication, professionalism, and basic ${courseName} training knowledge before your module sequence starts.`,
    passingScorePercent: 60,
    questions,
  };
}

export function getPretestBankForCourse(course = "") {
  const courseKey = getCourseKey(course);
  return DEFAULT_PRETEST_BANK[courseKey] || buildGenericPretestBank(course);
}

export default {
  DEFAULT_PRETEST_BANK,
  getCourseKey,
  getLearningPathFromPercent,
  buildGenericPretestBank,
  getPretestBankForCourse,
};
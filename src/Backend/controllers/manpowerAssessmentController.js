// src/Backend/controllers/manpowerAssessmentController.js
import ManpowerApplication from "../models/ManpowerApplication.js";
import {
  getManpowerExamByVacancy,
  sanitizeManpowerExamForApplicant,
} from "../utils/manpowerAssessmentBank.js";
import { evaluateManpowerAssessment } from "../utils/manpowerAssessmentEvaluator.js";

export async function getManpowerExamByApplication(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const exam = getManpowerExamByVacancy(application.vacancy);
    if (!exam) {
      return res.status(404).json({
        message: "No qualifying exam is available for this job offer.",
      });
    }

    if (!application.assessment?.startedAt) {
      application.assessment = {
        ...(application.assessment || {}),
        status: "in_progress",
        examId: exam.examId,
        examTitle: exam.title,
        vacancy: application.vacancy,
        passingScore: exam.passingScore,
        maxScore: exam.maxScore,
        startedAt: new Date(),
      };
      await application.save();
    }

    return res.json({
      applicationId: application._id,
      vacancy: application.vacancy,
      applicantName: `${application.firstName} ${application.lastName}`.trim(),
      assessmentStatus: application?.assessment?.status || "not_started",
      exam: sanitizeManpowerExamForApplicant(exam),
      existingAssessment:
        application?.assessment?.status === "completed"
          ? application.assessment
          : null,
    });
  } catch (error) {
    console.error("getManpowerExamByApplication error:", error);
    return res.status(500).json({
      message: "Failed to load manpower qualifying exam.",
    });
  }
}

export async function submitManpowerExamByApplication(req, res) {
  try {
    const application = await ManpowerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application?.assessment?.status === "completed") {
      return res.status(409).json({
        message: "This qualifying exam was already submitted.",
        assessment: application.assessment,
      });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    if (!answers.length) {
      return res.status(400).json({
        message: "Please answer the qualifying exam before submitting.",
      });
    }

    const result = await evaluateManpowerAssessment({
      vacancy: application.vacancy,
      answers,
    });

    application.assessment = {
      status: result.status,
      examId: result.examId,
      examTitle: result.examTitle,
      vacancy: result.vacancy,
      passingScore: result.passingScore,
      maxScore: result.maxScore,
      totalScore: result.totalScore,
      percentage: result.percentage,
      passed: result.passed,
      startedAt: application?.assessment?.startedAt || new Date(),
      submittedAt: result.submittedAt,
      answers: result.answers,
    };

    await application.save();

    return res.json({
      message: result.passed
        ? "Exam submitted successfully. You passed the qualifying exam."
        : "Exam submitted successfully. Your result was recorded.",
      assessment: application.assessment,
    });
  } catch (error) {
    console.error("submitManpowerExamByApplication error:", error);
    return res.status(500).json({
      message: error?.message || "Failed to submit manpower qualifying exam.",
    });
  }
}
import ManpowerApplication from "../models/ManpowerApplication.js";
import ManpowerJob from "../models/ManpowerJob.js";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeQualifications(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);

  return String(value || "")
    .split(/\r?\n|,/)
    .map(cleanText)
    .filter(Boolean);
}

function buildJobPayload(job) {
  if (!job) return null;

  return {
    _id: job._id,
    title: job.title || "",
    description: job.description || "",
    qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
    active: job.active !== false,
    createdBy: job.createdBy || "",
    createdAt: job.createdAt || null,
    updatedAt: job.updatedAt || null,
  };
}

export async function listManpowerJobs(req, res) {
  try {
    const search = cleanText(req.query?.search);
    const status = cleanText(req.query?.status).toLowerCase();

    const query = {};

    if (status === "active") query.active = true;
    if (status === "inactive") query.active = false;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    const jobs = await ManpowerJob.find(query).sort({ title: 1 }).lean();

    return res.json({
      jobs: jobs.map(buildJobPayload),
    });
  } catch (error) {
    console.error("listManpowerJobs error:", error);

    return res.status(500).json({
      message: "Failed to load job vacancies.",
    });
  }
}

export async function createManpowerJob(req, res) {
  try {
    const title = cleanText(req.body?.title);
    const description = cleanText(req.body?.description);
    const qualifications = normalizeQualifications(req.body?.qualifications);

    if (!title || title.length < 2) {
      return res.status(400).json({
        message: "Job title is required.",
      });
    }

    const existing = await ManpowerJob.findOne({
      title: new RegExp(`^${escapeRegex(title)}$`, "i"),
    }).lean();

    if (existing) {
      return res.status(409).json({
        message: "This job already exists.",
      });
    }

    const job = await ManpowerJob.create({
      title,
      description,
      qualifications,
      active: req.body?.active === false ? false : true,
      createdBy: req.manpowerAdmin?.username || "admin",
    });

    return res.status(201).json({
      message: "Job vacancy created successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("createManpowerJob error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This job already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to create job vacancy.",
    });
  }
}

export async function updateManpowerJob(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);
    const title = cleanText(req.body?.title);
    const description = cleanText(req.body?.description);
    const qualifications = normalizeQualifications(req.body?.qualifications);
    const active =
      typeof req.body?.active === "boolean" ? req.body.active : true;

    if (!title || title.length < 2) {
      return res.status(400).json({
        message: "Job title is required.",
      });
    }

    const duplicate = await ManpowerJob.findOne({
      _id: { $ne: jobId },
      title: new RegExp(`^${escapeRegex(title)}$`, "i"),
    }).lean();

    if (duplicate) {
      return res.status(409).json({
        message: "Another job with this title already exists.",
      });
    }

    const job = await ManpowerJob.findByIdAndUpdate(
      jobId,
      {
        $set: {
          title,
          description,
          qualifications,
          active,
        },
        $unset: {
          dailyRate: "",
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    return res.json({
      message: "Job vacancy updated successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("updateManpowerJob error:", error);

    return res.status(500).json({
      message: "Failed to update job vacancy.",
    });
  }
}

export async function updateManpowerJobStatus(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);
    const active = req.body?.active;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        message: "Active status must be true or false.",
      });
    }

    const job = await ManpowerJob.findByIdAndUpdate(
      jobId,
      { active },
      { new: true }
    ).lean();

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    return res.json({
      message: active
        ? "Job vacancy activated successfully."
        : "Job vacancy deactivated successfully.",
      job: buildJobPayload(job),
    });
  } catch (error) {
    console.error("updateManpowerJobStatus error:", error);

    return res.status(500).json({
      message: "Failed to update job status.",
    });
  }
}

export async function deleteManpowerJob(req, res) {
  try {
    const jobId = cleanText(req.params?.jobId);

    const job = await ManpowerJob.findById(jobId).lean();

    if (!job) {
      return res.status(404).json({
        message: "Job vacancy not found.",
      });
    }

    const usedCount = await ManpowerApplication.countDocuments({
      vacancy: job.title,
    });

    if (usedCount > 0) {
      await ManpowerJob.findByIdAndUpdate(jobId, { active: false });

      return res.json({
        message:
          "This job already has application records, so it was deactivated instead of permanently deleted.",
      });
    }

    await ManpowerJob.findByIdAndDelete(jobId);

    return res.json({
      message: "Job vacancy deleted successfully.",
    });
  } catch (error) {
    console.error("deleteManpowerJob error:", error);

    return res.status(500).json({
      message: "Failed to delete job vacancy.",
    });
  }
}
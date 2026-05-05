import mongoose from "mongoose";
import ManpowerApplication from "../models/ManpowerApplication.js";
import ManpowerEmployee from "../models/ManpowerEmployee.js";
import ManpowerPayroll from "../models/ManpowerPayroll.js";
import { computePayroll } from "../utils/manpowerPayroll.js";
import { getActiveManpowerDeductionConfig } from "../utils/manpowerDeductionConfig.js";

function parseDateInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDate(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthBounds(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    start: new Date(year, month, 1, 0, 0, 0, 0),
    end: new Date(year, month + 1, 1, 0, 0, 0, 0),
  };
}

function getDayBounds(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function buildSameCutoffQuery(employeeId, cutoffStart, cutoffEnd) {
  const startBounds = getDayBounds(cutoffStart);
  const endBounds = getDayBounds(cutoffEnd);

  return {
    employeeId,
    cutoffStart: {
      $gte: startBounds.start,
      $lt: startBounds.end,
    },
    cutoffEnd: {
      $gte: endBounds.start,
      $lt: endBounds.end,
    },
  };
}

function formatDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEmployeeIdValue(row) {
  if (!row?.employeeId) return "";
  if (typeof row.employeeId === "string") return row.employeeId;
  return String(row.employeeId?._id || row.employeeId || "");
}

function getPayrollRowKey(row) {
  return [
    getEmployeeIdValue(row),
    formatDateKey(row?.cutoffStart),
    formatDateKey(row?.cutoffEnd),
  ].join("__");
}

function getRowTimestamp(row) {
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  const createdAt = row?.createdAt ? new Date(row.createdAt).getTime() : 0;
  return Math.max(updatedAt || 0, createdAt || 0);
}

function dedupePayrollRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const key = getPayrollRowKey(row);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing || getRowTimestamp(row) >= getRowTimestamp(existing)) {
      map.set(key, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aStart = a?.cutoffStart ? new Date(a.cutoffStart).getTime() : 0;
    const bStart = b?.cutoffStart ? new Date(b.cutoffStart).getTime() : 0;

    if (bStart !== aStart) return bStart - aStart;

    const aUpdated = getRowTimestamp(a);
    const bUpdated = getRowTimestamp(b);
    return bUpdated - aUpdated;
  });
}

export async function upsertManpowerPayroll(req, res) {
  try {
    const employee = await ManpowerEmployee.findById(req.params.employeeId).lean();
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const application = await ManpowerApplication.findById(
      employee.applicationId
    ).lean();

    if (!application) {
      return res.status(404).json({ message: "Application record not found." });
    }

    const cutoffStart = parseDateInput(req.body?.cutoffStart);
    const cutoffEnd = parseDateInput(req.body?.cutoffEnd);

    if (!cutoffStart) {
      return res.status(400).json({ message: "Valid cutoff start is required." });
    }

    if (!cutoffEnd) {
      return res.status(400).json({ message: "Valid cutoff end is required." });
    }

    if (cutoffEnd.getTime() < cutoffStart.getTime()) {
      return res.status(400).json({
        message: "Cutoff end must not be earlier than cutoff start.",
      });
    }

    const attendance = req.body?.attendance || {};
    const adjustments = req.body?.adjustments || {};
    const deductionConfig = await getActiveManpowerDeductionConfig();

    const draftComputed = computePayroll({
      cutoffStart,
      cutoffEnd,
      dailyRate: employee.dailyRate,
      wholeMonthSalary: 0,
      deductionConfig,
      ...attendance,
      ...adjustments,
      allowAutoGovernmentDeductions: false,
      sssEmployee: 0,
      philhealthEmployee: 0,
      pagibigEmployee: 0,
      withholdingTax: 0,
    });

    const currentGrossPay = Number(draftComputed?.grossPay || 0);

    const { start: monthStart, end: monthEnd } = getMonthBounds(cutoffEnd);

    const sameMonthPayrolls = await ManpowerPayroll.find({
      employeeId: employee._id,
      cutoffEnd: {
        $gte: monthStart,
        $lt: monthEnd,
      },
    }).lean();

    const otherPayrollGrossTotal = sameMonthPayrolls.reduce((sum, row) => {
      const rowStart = row?.cutoffStart ? new Date(row.cutoffStart) : null;
      const rowEnd = row?.cutoffEnd ? new Date(row.cutoffEnd) : null;

      const isSameCutoff =
        sameDate(rowStart, cutoffStart) && sameDate(rowEnd, cutoffEnd);

      if (isSameCutoff) return sum;

      return sum + Number(row?.computed?.grossPay || 0);
    }, 0);

    const explicitWholeMonthSalary = Number(req.body?.wholeMonthSalary || 0);

    const wholeMonthSalary =
      explicitWholeMonthSalary > 0
        ? explicitWholeMonthSalary
        : otherPayrollGrossTotal > 0
        ? currentGrossPay + otherPayrollGrossTotal
        : currentGrossPay * 2;

    const computed = computePayroll({
      cutoffStart,
      cutoffEnd,
      dailyRate: employee.dailyRate,
      wholeMonthSalary,
      deductionConfig,
      ...attendance,
      ...adjustments,
    });

    let payroll = await ManpowerPayroll.findOne(
      buildSameCutoffQuery(employee._id, cutoffStart, cutoffEnd)
    );

    if (!payroll) {
      payroll = new ManpowerPayroll({
        employeeId: employee._id,
        applicationId: application._id,
        vacancy: employee.vacancy,
        cutoffStart,
        cutoffEnd,
      });
    }

    payroll.applicationId = application._id;
    payroll.vacancy = employee.vacancy;
    payroll.attendance = attendance;
    payroll.adjustments = adjustments;
    payroll.computed = computed;
    payroll.encodedBy = req.hr?.username || "HR";

    await payroll.save();

    return res.json({
      message: "Payroll saved successfully.",
      payroll,
    });
  } catch (error) {
    console.error("upsertManpowerPayroll error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: error.message || "Invalid payroll input.",
      });
    }

    return res.status(500).json({
      message: error?.message || "Failed to save payroll.",
    });
  }
}

export async function listManpowerPayroll(req, res) {
  try {
    const vacancy = String(req.query?.vacancy || "").trim();
    const employeeId = String(req.query?.employeeId || "").trim();
    const cutoffStart = parseDateInput(req.query?.cutoffStart);
    const cutoffEnd = parseDateInput(req.query?.cutoffEnd);

    const query = {};
    if (vacancy) query.vacancy = vacancy;
    if (employeeId) query.employeeId = employeeId;

    if (cutoffStart) {
      const bounds = getDayBounds(cutoffStart);
      query.cutoffStart = {
        $gte: bounds.start,
        $lt: bounds.end,
      };
    }

    if (cutoffEnd) {
      const bounds = getDayBounds(cutoffEnd);
      query.cutoffEnd = {
        $gte: bounds.start,
        $lt: bounds.end,
      };
    }

    const payrolls = await ManpowerPayroll.find(query)
      .populate("employeeId", "companyEmail firstName lastName vacancy dailyRate")
      .sort({ cutoffStart: -1, updatedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      payrolls: dedupePayrollRows(payrolls),
    });
  } catch (error) {
    console.error("listManpowerPayroll error:", error);
    return res.status(500).json({ message: "Failed to load payroll records." });
  }
}
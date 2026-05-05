import mongoose from "mongoose";

const manpowerPayrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerEmployee",
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManpowerApplication",
      required: true,
      index: true,
    },
    vacancy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cutoffStart: {
      type: Date,
      required: true,
      index: true,
    },
    cutoffEnd: {
      type: Date,
      required: true,
      index: true,
    },
    attendance: {
      regularDays: { type: Number, default: 0 },
      regularHours: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
      restDayHours: { type: Number, default: 0 },
      restDayOtHours: { type: Number, default: 0 },
      specialHolidayHours: { type: Number, default: 0 },
      specialHolidayOtHours: { type: Number, default: 0 },
      specialHolidayRestDayHours: { type: Number, default: 0 },
      specialHolidayRestDayOtHours: { type: Number, default: 0 },
      regularHolidayHours: { type: Number, default: 0 },
      regularHolidayOtHours: { type: Number, default: 0 },
      regularHolidayRestDayHours: { type: Number, default: 0 },
      regularHolidayRestDayOtHours: { type: Number, default: 0 },
      nightDiffHours: { type: Number, default: 0 },
      sundayHours: { type: Number, default: 0 },
      sundayOtHours: { type: Number, default: 0 },
      lateHours: { type: Number, default: 0 },
      undertimeHours: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
    },
    adjustments: {
      manualAllowance: { type: Number, default: 0 },
      manualBonus: { type: Number, default: 0 },
      cashAdvance: { type: Number, default: 0 },
      loanDeduction: { type: Number, default: 0 },
      otherDeduction: { type: Number, default: 0 },
      withholdingTax: { type: Number, default: 0 },
      sssEmployee: { type: Number, default: null },
      philhealthEmployee: { type: Number, default: null },
      pagibigEmployee: { type: Number, default: null },
      allowAutoGovernmentDeductions: { type: Boolean, default: true },
    },
    computed: {
      ratePerDay: { type: Number, default: 0 },
      hourlyRate: { type: Number, default: 0 },
      estimatedMonthlyBasic: { type: Number, default: 0 },
      items: { type: Object, default: {} },
      grossPay: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
      netPay: { type: Number, default: 0 },
    },
    encodedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

manpowerPayrollSchema.index(
  { employeeId: 1, cutoffStart: 1, cutoffEnd: 1 },
  { unique: true }
);

export default mongoose.model("ManpowerPayroll", manpowerPayrollSchema);
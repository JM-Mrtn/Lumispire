import mongoose from "mongoose";

const rangeNumber = {
  type: Number,
  default: 0,
};

const sssBracketSchema = new mongoose.Schema(
  {
    min: rangeNumber,
    max: {
      type: Number,
      default: null,
    },
    employeeShare: rangeNumber,
  },
  { _id: false }
);

const withholdingBracketSchema = new mongoose.Schema(
  {
    min: rangeNumber,
    max: {
      type: Number,
      default: null,
    },
    baseTax: rangeNumber,
    excessOver: rangeNumber,
    rate: rangeNumber,
    bracket: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const manpowerDeductionConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      index: true,
    },

    sss: {
      enabled: {
        type: Boolean,
        default: true,
      },
      table: {
        type: [sssBracketSchema],
        default: [],
      },
    },

    philhealth: {
      enabled: {
        type: Boolean,
        default: true,
      },
      monthlyRate: {
        type: Number,
        default: 0.02,
      },
      employeeShareRate: {
        type: Number,
        default: 0.5,
      },
      firstHalfFixedDeduction: {
        type: Number,
        default: 250,
      },
    },

    pagibig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      fixedEmployeeShare: {
        type: Number,
        default: 100,
      },
    },

    withholdingTax: {
      enabled: {
        type: Boolean,
        default: true,
      },
      payrollType: {
        type: String,
        default: "semi-monthly",
        trim: true,
      },
      table: {
        type: [withholdingBracketSchema],
        default: [],
      },
    },

    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ManpowerDeductionConfig",
  manpowerDeductionConfigSchema
);
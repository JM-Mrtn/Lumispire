import ManpowerDeductionConfig from "../models/ManpowerDeductionConfig.js";

export const DEFAULT_SSS_TABLE = [
  { min: 0, max: 4249.99, employeeShare: 180.0 },
  { min: 4250, max: 4749.99, employeeShare: 202.5 },
  { min: 4750, max: 5249.99, employeeShare: 225.0 },
  { min: 5250, max: 5749.99, employeeShare: 247.5 },
  { min: 5750, max: 6249.99, employeeShare: 270.0 },
  { min: 6250, max: 6749.99, employeeShare: 292.5 },
  { min: 6750, max: 7249.99, employeeShare: 315.0 },
  { min: 7250, max: 7749.99, employeeShare: 337.5 },
  { min: 7750, max: 8249.99, employeeShare: 360.0 },
  { min: 8250, max: 8749.99, employeeShare: 382.5 },
  { min: 8750, max: 9249.99, employeeShare: 405.0 },
  { min: 9250, max: 9749.99, employeeShare: 427.5 },
  { min: 9750, max: 10249.99, employeeShare: 450.0 },
  { min: 10250, max: 10749.99, employeeShare: 472.5 },
  { min: 10750, max: 11249.99, employeeShare: 495.0 },
  { min: 11250, max: 11749.99, employeeShare: 517.5 },
  { min: 11750, max: 12249.99, employeeShare: 540.0 },
  { min: 12250, max: 12749.99, employeeShare: 562.5 },
  { min: 12750, max: 13249.99, employeeShare: 585.0 },
  { min: 13250, max: 13749.99, employeeShare: 607.5 },
  { min: 13750, max: 14249.99, employeeShare: 630.0 },
  { min: 14250, max: 14749.99, employeeShare: 652.5 },
  { min: 14750, max: 15249.99, employeeShare: 675.0 },
  { min: 15250, max: 15749.99, employeeShare: 697.5 },
  { min: 15750, max: 16249.99, employeeShare: 720.0 },
  { min: 16250, max: 16749.99, employeeShare: 742.5 },
  { min: 16750, max: 17249.99, employeeShare: 765.0 },
  { min: 17250, max: 17749.99, employeeShare: 787.5 },
  { min: 17750, max: 18249.99, employeeShare: 810.0 },
  { min: 18250, max: 18749.99, employeeShare: 832.5 },
  { min: 18750, max: 19249.99, employeeShare: 855.0 },
  { min: 19250, max: 19749.99, employeeShare: 877.5 },
  { min: 19750, max: 20249.99, employeeShare: 900.0 },
  { min: 20250, max: 20749.99, employeeShare: 922.5 },
  { min: 20750, max: 21249.99, employeeShare: 945.0 },
  { min: 21250, max: 21749.99, employeeShare: 967.5 },
  { min: 21750, max: 22249.99, employeeShare: 990.0 },
  { min: 22250, max: 22749.99, employeeShare: 1012.5 },
  { min: 22750, max: 23249.99, employeeShare: 1035.0 },
  { min: 23250, max: 23749.99, employeeShare: 1057.5 },
  { min: 23750, max: 24249.99, employeeShare: 1080.0 },
  { min: 24250, max: 24749.99, employeeShare: 1102.5 },
  { min: 24750, max: 25249.99, employeeShare: 1125.0 },
  { min: 25250, max: 25749.99, employeeShare: 1147.5 },
  { min: 25750, max: 26249.99, employeeShare: 1170.0 },
  { min: 26250, max: 26749.99, employeeShare: 1192.5 },
  { min: 26750, max: 27249.99, employeeShare: 1215.0 },
  { min: 27250, max: 27749.99, employeeShare: 1237.5 },
  { min: 27750, max: 28249.99, employeeShare: 1260.0 },
  { min: 28250, max: 28749.99, employeeShare: 1282.5 },
  { min: 28750, max: 29249.99, employeeShare: 1305.0 },
  { min: 29250, max: 29749.99, employeeShare: 1327.5 },
  { min: 29750, max: null, employeeShare: 1350.0 },
];

export const DEFAULT_WITHHOLDING_TAX_TABLE = [
  {
    min: 0,
    max: 10417,
    baseTax: 0,
    excessOver: 0,
    rate: 0,
    bracket: "₱10,417 and below",
  },
  {
    min: 10417.01,
    max: 16666,
    baseTax: 0,
    excessOver: 10417,
    rate: 0.15,
    bracket: "Over ₱10,417 to ₱16,666",
  },
  {
    min: 16666.01,
    max: 33332,
    baseTax: 937.5,
    excessOver: 16667,
    rate: 0.2,
    bracket: "Over ₱16,667 to ₱33,332",
  },
  {
    min: 33332.01,
    max: 83332,
    baseTax: 4270.7,
    excessOver: 33333,
    rate: 0.25,
    bracket: "Over ₱33,333 to ₱83,332",
  },
  {
    min: 83332.01,
    max: 333332,
    baseTax: 16770.7,
    excessOver: 83333,
    rate: 0.3,
    bracket: "Over ₱83,333 to ₱333,332",
  },
  {
    min: 333332.01,
    max: null,
    baseTax: 91770.7,
    excessOver: 333333,
    rate: 0.35,
    bracket: "Over ₱333,333",
  },
];

export function getDefaultDeductionConfig() {
  return {
    key: "default",
    sss: {
      enabled: true,
      table: DEFAULT_SSS_TABLE,
    },
    philhealth: {
      enabled: true,
      monthlyRate: 0.02,
      employeeShareRate: 0.5,
      firstHalfFixedDeduction: 250,
    },
    pagibig: {
      enabled: true,
      fixedEmployeeShare: 100,
    },
    withholdingTax: {
      enabled: true,
      payrollType: "semi-monthly",
      table: DEFAULT_WITHHOLDING_TAX_TABLE,
    },
  };
}

export async function getActiveManpowerDeductionConfig() {
  let config = await ManpowerDeductionConfig.findOne({ key: "default" }).lean();

  if (!config) {
    config = await ManpowerDeductionConfig.create(getDefaultDeductionConfig());
    return config.toObject();
  }

  return config;
}

export async function upsertActiveManpowerDeductionConfig(payload = {}) {
  const current = await getActiveManpowerDeductionConfig();

  const nextConfig = {
    sss: {
      enabled: payload?.sss?.enabled !== false,
      table: Array.isArray(payload?.sss?.table)
        ? payload.sss.table
        : current?.sss?.table || DEFAULT_SSS_TABLE,
    },
    philhealth: {
      enabled: payload?.philhealth?.enabled !== false,
      monthlyRate: Number(payload?.philhealth?.monthlyRate ?? 0.02),
      employeeShareRate: Number(payload?.philhealth?.employeeShareRate ?? 0.5),
      firstHalfFixedDeduction: Number(
        payload?.philhealth?.firstHalfFixedDeduction ?? 250
      ),
    },
    pagibig: {
      enabled: payload?.pagibig?.enabled !== false,
      fixedEmployeeShare: Number(payload?.pagibig?.fixedEmployeeShare ?? 100),
    },
    withholdingTax: {
      enabled: payload?.withholdingTax?.enabled !== false,
      payrollType: "semi-monthly",
      table: Array.isArray(payload?.withholdingTax?.table)
        ? payload.withholdingTax.table
        : current?.withholdingTax?.table || DEFAULT_WITHHOLDING_TAX_TABLE,
    },
    updatedBy: payload?.updatedBy || "",
  };

  const updated = await ManpowerDeductionConfig.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        key: "default",
        ...nextConfig,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return updated;
}
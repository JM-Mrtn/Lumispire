function toNumber(value = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round2(value = 0) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function toValidDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMaxValue(value) {
  if (value === null || value === undefined || value === "") return Infinity;
  const num = Number(value);
  return Number.isFinite(num) ? num : Infinity;
}

export function getPayrollCycle({ cutoffStart = null, cutoffEnd = null } = {}) {
  const basisDate =
    toValidDate(cutoffEnd) || toValidDate(cutoffStart) || new Date();

  const dayOfMonth = basisDate.getDate();

  if (dayOfMonth <= 15) {
    return {
      code: "FIRST_HALF",
      label: "1st Half",
      dayOfMonth,
    };
  }

  return {
    code: "SECOND_HALF",
    label: "2nd Half",
    dayOfMonth,
  };
}

const FALLBACK_CONFIG = {
  sss: {
    enabled: true,
    table: [
      { min: 0, max: 4249.99, employeeShare: 180 },
      { min: 4250, max: 4749.99, employeeShare: 202.5 },
      { min: 4750, max: 5249.99, employeeShare: 225 },
      { min: 5250, max: 5749.99, employeeShare: 247.5 },
      { min: 5750, max: 6249.99, employeeShare: 270 },
      { min: 6250, max: 6749.99, employeeShare: 292.5 },
      { min: 6750, max: 7249.99, employeeShare: 315 },
      { min: 7250, max: 7749.99, employeeShare: 337.5 },
      { min: 7750, max: 8249.99, employeeShare: 360 },
      { min: 8250, max: 8749.99, employeeShare: 382.5 },
      { min: 8750, max: 9249.99, employeeShare: 405 },
      { min: 9250, max: 9749.99, employeeShare: 427.5 },
      { min: 9750, max: 10249.99, employeeShare: 450 },
      { min: 10250, max: 10749.99, employeeShare: 472.5 },
      { min: 10750, max: 11249.99, employeeShare: 495 },
      { min: 11250, max: 11749.99, employeeShare: 517.5 },
      { min: 11750, max: 12249.99, employeeShare: 540 },
      { min: 12250, max: 12749.99, employeeShare: 562.5 },
      { min: 12750, max: 13249.99, employeeShare: 585 },
      { min: 13250, max: 13749.99, employeeShare: 607.5 },
      { min: 13750, max: 14249.99, employeeShare: 630 },
      { min: 14250, max: 14749.99, employeeShare: 652.5 },
      { min: 14750, max: 15249.99, employeeShare: 675 },
      { min: 15250, max: 15749.99, employeeShare: 697.5 },
      { min: 15750, max: 16249.99, employeeShare: 720 },
      { min: 16250, max: 16749.99, employeeShare: 742.5 },
      { min: 16750, max: 17249.99, employeeShare: 765 },
      { min: 17250, max: 17749.99, employeeShare: 787.5 },
      { min: 17750, max: 18249.99, employeeShare: 810 },
      { min: 18250, max: 18749.99, employeeShare: 832.5 },
      { min: 18750, max: 19249.99, employeeShare: 855 },
      { min: 19250, max: 19749.99, employeeShare: 877.5 },
      { min: 19750, max: 20249.99, employeeShare: 900 },
      { min: 20250, max: 20749.99, employeeShare: 922.5 },
      { min: 20750, max: 21249.99, employeeShare: 945 },
      { min: 21250, max: 21749.99, employeeShare: 967.5 },
      { min: 21750, max: 22249.99, employeeShare: 990 },
      { min: 22250, max: 22749.99, employeeShare: 1012.5 },
      { min: 22750, max: 23249.99, employeeShare: 1035 },
      { min: 23250, max: 23749.99, employeeShare: 1057.5 },
      { min: 23750, max: 24249.99, employeeShare: 1080 },
      { min: 24250, max: 24749.99, employeeShare: 1102.5 },
      { min: 24750, max: 25249.99, employeeShare: 1125 },
      { min: 25250, max: 25749.99, employeeShare: 1147.5 },
      { min: 25750, max: 26249.99, employeeShare: 1170 },
      { min: 26250, max: 26749.99, employeeShare: 1192.5 },
      { min: 26750, max: 27249.99, employeeShare: 1215 },
      { min: 27250, max: 27749.99, employeeShare: 1237.5 },
      { min: 27750, max: 28249.99, employeeShare: 1260 },
      { min: 28250, max: 28749.99, employeeShare: 1282.5 },
      { min: 28750, max: 29249.99, employeeShare: 1305 },
      { min: 29250, max: 29749.99, employeeShare: 1327.5 },
      { min: 29750, max: null, employeeShare: 1350 },
    ],
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
    table: [
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
    ],
  },
};

function resolveDeductionConfig(config = null) {
  return {
    sss: {
      enabled: config?.sss?.enabled !== false,
      table:
        Array.isArray(config?.sss?.table) && config.sss.table.length
          ? config.sss.table
          : FALLBACK_CONFIG.sss.table,
    },
    philhealth: {
      enabled: config?.philhealth?.enabled !== false,
      monthlyRate: toNumber(config?.philhealth?.monthlyRate || 0.02),
      employeeShareRate: toNumber(config?.philhealth?.employeeShareRate || 0.5),
      firstHalfFixedDeduction: toNumber(
        config?.philhealth?.firstHalfFixedDeduction ?? 250
      ),
    },
    pagibig: {
      enabled: config?.pagibig?.enabled !== false,
      fixedEmployeeShare: toNumber(config?.pagibig?.fixedEmployeeShare ?? 100),
    },
    withholdingTax: {
      enabled: config?.withholdingTax?.enabled !== false,
      table:
        Array.isArray(config?.withholdingTax?.table) &&
        config.withholdingTax.table.length
          ? config.withholdingTax.table
          : FALLBACK_CONFIG.withholdingTax.table,
    },
  };
}

export function computeSssEmployeeShareFromTable(cycleSalary = 0, config = null) {
  const deductionConfig = resolveDeductionConfig(config);
  const salary = round2(toNumber(cycleSalary));

  if (!deductionConfig.sss.enabled || salary <= 0) return 0;

  const table = deductionConfig.sss.table;

  const match =
    table.find((row) => {
      const min = toNumber(row.min);
      const max = getMaxValue(row.max);
      return salary >= min && salary <= max;
    }) || table[table.length - 1];

  return round2(match?.employeeShare || 0);
}

export function computeCustomPhilHealthBreakdown(
  wholeMonthSalary = 0,
  config = null
) {
  const deductionConfig = resolveDeductionConfig(config);
  const monthlySalary = round2(toNumber(wholeMonthSalary));

  if (!deductionConfig.philhealth.enabled || monthlySalary <= 0) {
    return {
      wholeMonthSalary: monthlySalary,
      totalPhilHealth: 0,
      employeeMonthlyShare: 0,
      firstHalfDeduction: 0,
      secondHalfDeduction: 0,
    };
  }

  const monthlyRate = toNumber(deductionConfig.philhealth.monthlyRate);
  const employeeShareRate = toNumber(deductionConfig.philhealth.employeeShareRate);
  const firstHalfFixedDeduction = toNumber(
    deductionConfig.philhealth.firstHalfFixedDeduction
  );

  const totalPhilHealth = round2(monthlySalary * monthlyRate);
  const employeeMonthlyShare = round2(totalPhilHealth * employeeShareRate);

  const firstHalfDeduction = round2(firstHalfFixedDeduction);
  const secondHalfDeduction = round2(
    Math.max(employeeMonthlyShare - firstHalfDeduction, 0)
  );

  return {
    wholeMonthSalary: monthlySalary,
    totalPhilHealth,
    employeeMonthlyShare,
    firstHalfDeduction,
    secondHalfDeduction,
  };
}

export function computeSemiMonthlyWithholdingTax(
  taxableCompensation = 0,
  config = null
) {
  const deductionConfig = resolveDeductionConfig(config);
  const taxable = round2(toNumber(taxableCompensation));

  if (!deductionConfig.withholdingTax.enabled || taxable <= 0) {
    return {
      taxableCompensation: taxable,
      withholdingTax: 0,
      baseTax: 0,
      excessOver: 0,
      rate: 0,
      bracket: "No taxable compensation",
    };
  }

  const table = deductionConfig.withholdingTax.table;

  const bracket =
    table.find((row) => {
      const min = toNumber(row.min);
      const max = getMaxValue(row.max);
      return taxable >= min && taxable <= max;
    }) || table[table.length - 1];

  const baseTax = toNumber(bracket?.baseTax);
  const excessOver = toNumber(bracket?.excessOver);
  const rate = toNumber(bracket?.rate);
  const excess = Math.max(taxable - excessOver, 0);
  const withholdingTax = round2(baseTax + excess * rate);

  return {
    taxableCompensation: taxable,
    withholdingTax,
    baseTax: round2(baseTax),
    excessOver: round2(excessOver),
    rate,
    bracket: bracket?.bracket || "",
  };
}

export function computePayroll({
  cutoffStart = null,
  cutoffEnd = null,

  dailyRate = 0,
  wholeMonthSalary = 0,

  regularDays = 0,
  regularHours = 0,
  overtimeHours = 0,

  restDayHours = 0,
  restDayOtHours = 0,

  specialHolidayHours = 0,
  specialHolidayOtHours = 0,
  specialHolidayRestDayHours = 0,
  specialHolidayRestDayOtHours = 0,

  regularHolidayHours = 0,
  regularHolidayOtHours = 0,
  regularHolidayRestDayHours = 0,
  regularHolidayRestDayOtHours = 0,

  nightDiffHours = 0,
  sundayHours = 0,
  sundayOtHours = 0,

  lateHours = 0,
  undertimeHours = 0,
  absentDays = 0,

  allowAutoGovernmentDeductions = true,

  manualAllowance = 0,
  manualBonus = 0,
  cashAdvance = 0,
  loanDeduction = 0,
  otherDeduction = 0,

  withholdingTax = null,

  sssEmployee = null,
  philhealthEmployee = null,
  pagibigEmployee = null,

  deductionConfig = null,
}) {
  const config = resolveDeductionConfig(deductionConfig);
  const cycle = getPayrollCycle({ cutoffStart, cutoffEnd });

  const ratePerDay = round2(toNumber(dailyRate));
  const hourlyRate = round2(ratePerDay / 8);

  const computedBaseFromDays = round2(ratePerDay * toNumber(regularDays));
  const computedBaseFromHours = round2(hourlyRate * toNumber(regularHours));
  const basePay = round2(computedBaseFromDays + computedBaseFromHours);

  const otPay = round2(hourlyRate * 1.25 * toNumber(overtimeHours));

  const restDayPay = round2(hourlyRate * 1.3 * toNumber(restDayHours));
  const restDayOtPay = round2(hourlyRate * 1.3 * 1.3 * toNumber(restDayOtHours));

  const specialPay = round2(hourlyRate * 1.3 * toNumber(specialHolidayHours));
  const specialOtPay = round2(
    hourlyRate * 1.3 * 1.3 * toNumber(specialHolidayOtHours)
  );
  const specialRestDayPay = round2(
    hourlyRate * 1.5 * toNumber(specialHolidayRestDayHours)
  );
  const specialRestDayOtPay = round2(
    hourlyRate * 1.5 * 1.3 * toNumber(specialHolidayRestDayOtHours)
  );

  const regularHolidayPay = round2(
    hourlyRate * 2.0 * toNumber(regularHolidayHours)
  );
  const regularHolidayOtPay = round2(
    hourlyRate * 2.0 * 1.3 * toNumber(regularHolidayOtHours)
  );
  const regularHolidayRestDayPay = round2(
    hourlyRate * 2.6 * toNumber(regularHolidayRestDayHours)
  );
  const regularHolidayRestDayOtPay = round2(
    hourlyRate * 2.6 * 1.3 * toNumber(regularHolidayRestDayOtHours)
  );

  const sundayPay = round2(hourlyRate * 1.3 * toNumber(sundayHours));
  const sundayOtPay = round2(hourlyRate * 1.3 * 1.3 * toNumber(sundayOtHours));

  const nightDiffPay = round2(hourlyRate * 0.1 * toNumber(nightDiffHours));

  const lateDeduction = round2(hourlyRate * toNumber(lateHours));
  const undertimeDeduction = round2(hourlyRate * toNumber(undertimeHours));
  const absentDeduction = round2(ratePerDay * toNumber(absentDays));

  const allowanceValue = round2(toNumber(manualAllowance));
  const bonusValue = round2(toNumber(manualBonus));
  const cashAdvanceValue = round2(toNumber(cashAdvance));
  const loanDeductionValue = round2(toNumber(loanDeduction));
  const otherDeductionValue = round2(toNumber(otherDeduction));

  const grossPay = round2(
    basePay +
      otPay +
      restDayPay +
      restDayOtPay +
      specialPay +
      specialOtPay +
      specialRestDayPay +
      specialRestDayOtPay +
      regularHolidayPay +
      regularHolidayOtPay +
      regularHolidayRestDayPay +
      regularHolidayRestDayOtPay +
      sundayPay +
      sundayOtPay +
      nightDiffPay +
      allowanceValue +
      bonusValue
  );

  const cycleSalaryForSss = grossPay;

  const monthSalaryForPhilHealth =
    toNumber(wholeMonthSalary) > 0
      ? round2(wholeMonthSalary)
      : grossPay > 0
      ? round2(grossPay * 2)
      : 0;

  const philhealthBreakdown = computeCustomPhilHealthBreakdown(
    monthSalaryForPhilHealth,
    config
  );

  const autoSss = allowAutoGovernmentDeductions
    ? computeSssEmployeeShareFromTable(cycleSalaryForSss, config)
    : 0;

  const autoPagibig =
    allowAutoGovernmentDeductions && config.pagibig.enabled && grossPay > 0
      ? round2(config.pagibig.fixedEmployeeShare)
      : 0;

  const autoPhilHealth =
    !allowAutoGovernmentDeductions
      ? 0
      : cycle.code === "FIRST_HALF"
      ? philhealthBreakdown.firstHalfDeduction
      : cycle.code === "SECOND_HALF"
      ? philhealthBreakdown.secondHalfDeduction
      : 0;

  const sss = round2(sssEmployee == null ? autoSss : toNumber(sssEmployee));

  const philhealth = round2(
    philhealthEmployee == null ? autoPhilHealth : toNumber(philhealthEmployee)
  );

  const pagibig = round2(
    pagibigEmployee == null ? autoPagibig : toNumber(pagibigEmployee)
  );

  const taxableCompensation = round2(
    Math.max(grossPay - sss - philhealth - pagibig, 0)
  );

  const withholdingTaxBreakdown = computeSemiMonthlyWithholdingTax(
    taxableCompensation,
    config
  );

  const autoWithholdingTax =
    allowAutoGovernmentDeductions && config.withholdingTax.enabled
      ? withholdingTaxBreakdown.withholdingTax
      : 0;

  const withholdingTaxValue = round2(
    withholdingTax == null ? autoWithholdingTax : toNumber(withholdingTax)
  );

  const totalDeductions = round2(
    sss +
      philhealth +
      pagibig +
      withholdingTaxValue +
      cashAdvanceValue +
      loanDeductionValue +
      otherDeductionValue +
      lateDeduction +
      undertimeDeduction +
      absentDeduction
  );

  const netPay = round2(grossPay - totalDeductions);

  return {
    payrollCycle: cycle.code,
    payrollCycleLabel: cycle.label,
    ratePerDay,
    hourlyRate,

    cycleSalaryForSss: round2(cycleSalaryForSss),
    wholeMonthSalary: round2(monthSalaryForPhilHealth),
    estimatedMonthlyBasic: round2(monthSalaryForPhilHealth),

    deductionConfigSnapshot: config,

    philhealthRule: {
      wholeMonthSalary: philhealthBreakdown.wholeMonthSalary,
      totalPhilHealth: philhealthBreakdown.totalPhilHealth,
      employeeMonthlyShare: philhealthBreakdown.employeeMonthlyShare,
      firstHalfDeduction: philhealthBreakdown.firstHalfDeduction,
      secondHalfDeduction: philhealthBreakdown.secondHalfDeduction,
      monthlyRate: config.philhealth.monthlyRate,
      employeeShareRate: config.philhealth.employeeShareRate,
    },

    withholdingTaxRule: {
      method: "ADMIN_CONFIG_SEMI_MONTHLY",
      taxableCompensation,
      withholdingTax: withholdingTaxValue,
      autoWithholdingTax,
      manualOverride: withholdingTax != null,
      baseTax: withholdingTaxBreakdown.baseTax,
      excessOver: withholdingTaxBreakdown.excessOver,
      rate: withholdingTaxBreakdown.rate,
      bracket: withholdingTaxBreakdown.bracket,
    },

    items: {
      basePay,

      otPay,
      restDayPay,
      restDayOtPay,
      specialPay,
      specialOtPay,
      specialRestDayPay,
      specialRestDayOtPay,
      regularHolidayPay,
      regularHolidayOtPay,
      regularHolidayRestDayPay,
      regularHolidayRestDayOtPay,
      sundayPay,
      sundayOtPay,
      nightDiffPay,

      lateDeduction,
      undertimeDeduction,
      absentDeduction,

      sssEmployee: sss,
      philhealthEmployee: philhealth,
      pagibigEmployee: pagibig,
      withholdingTax: withholdingTaxValue,
    },

    grossPay,
    totalDeductions,
    netPay,
  };
}
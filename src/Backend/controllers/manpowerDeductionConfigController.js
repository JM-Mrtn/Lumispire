import {
  getActiveManpowerDeductionConfig,
  getDefaultDeductionConfig,
  upsertActiveManpowerDeductionConfig,
} from "../utils/manpowerDeductionConfig.js";

function cleanTableRows(rows = [], type = "sss") {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      if (type === "withholdingTax") {
        return {
          min: Number(row?.min || 0),
          max:
            row?.max === "" || row?.max == null
              ? null
              : Number(row?.max || 0),
          baseTax: Number(row?.baseTax || 0),
          excessOver: Number(row?.excessOver || 0),
          rate: Number(row?.rate || 0),
          bracket: String(row?.bracket || "").trim(),
        };
      }

      return {
        min: Number(row?.min || 0),
        max:
          row?.max === "" || row?.max == null ? null : Number(row?.max || 0),
        employeeShare: Number(row?.employeeShare || 0),
      };
    })
    .filter((row) => Number.isFinite(row.min));
}

export async function getManpowerDeductionConfig(req, res) {
  try {
    const config = await getActiveManpowerDeductionConfig();

    return res.json({
      config,
      defaults: getDefaultDeductionConfig(),
    });
  } catch (error) {
    console.error("getManpowerDeductionConfig error:", error);

    return res.status(500).json({
      message: "Failed to load government deduction settings.",
    });
  }
}

export async function updateManpowerDeductionConfig(req, res) {
  try {
    const payload = {
      sss: {
        enabled: req.body?.sss?.enabled !== false,
        table: cleanTableRows(req.body?.sss?.table, "sss"),
      },
      philhealth: {
        enabled: req.body?.philhealth?.enabled !== false,
        monthlyRate: Number(req.body?.philhealth?.monthlyRate || 0),
        employeeShareRate: Number(req.body?.philhealth?.employeeShareRate || 0),
        firstHalfFixedDeduction: Number(
          req.body?.philhealth?.firstHalfFixedDeduction || 0
        ),
      },
      pagibig: {
        enabled: req.body?.pagibig?.enabled !== false,
        fixedEmployeeShare: Number(req.body?.pagibig?.fixedEmployeeShare || 0),
      },
      withholdingTax: {
        enabled: req.body?.withholdingTax?.enabled !== false,
        table: cleanTableRows(
          req.body?.withholdingTax?.table,
          "withholdingTax"
        ),
      },
      updatedBy: req.manpowerAdmin?.username || "admin",
    };

    if (!payload.sss.table.length) {
      return res.status(400).json({
        message: "Please add at least one SSS bracket.",
      });
    }

    if (!payload.withholdingTax.table.length) {
      return res.status(400).json({
        message: "Please add at least one withholding tax bracket.",
      });
    }

    const config = await upsertActiveManpowerDeductionConfig(payload);

    return res.json({
      message: "Government deduction settings updated successfully.",
      config,
    });
  } catch (error) {
    console.error("updateManpowerDeductionConfig error:", error);

    return res.status(500).json({
      message:
        error?.message || "Failed to update government deduction settings.",
    });
  }
}

export async function resetManpowerDeductionConfig(req, res) {
  try {
    const defaults = getDefaultDeductionConfig();

    const config = await upsertActiveManpowerDeductionConfig({
      ...defaults,
      updatedBy: req.manpowerAdmin?.username || "admin",
    });

    return res.json({
      message: "Government deduction settings reset to default.",
      config,
    });
  } catch (error) {
    console.error("resetManpowerDeductionConfig error:", error);

    return res.status(500).json({
      message: "Failed to reset government deduction settings.",
    });
  }
}
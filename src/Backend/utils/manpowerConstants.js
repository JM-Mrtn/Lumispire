export const DEFAULT_MANPOWER_JOBS = [
  { title: "Accounting Clerk" },
  { title: "General Clerk" },
  { title: "Money Sorter" },
  { title: "Data Encoder" },
  { title: "Admin Assistant" },
  { title: "HR Assistant" },
  { title: "Production Worker" },
  { title: "Warehouseman" },
  { title: "Stockman" },
  { title: "Sales Coordinator" },
  { title: "Financial Advisor" },
  { title: "Engineer" },
  { title: "Driver" },
  { title: "Promodiser" },
  { title: "Merchandiser" },
  { title: "Messenger" },
  { title: "Forklift Operator" },
  { title: "Janitor" },
];

export const REQUIRED_REQUIREMENTS = [
  "validId",
  "resume",
  "nbi",
  "barangayClearance",
  "sss",
  "philhealth",
  "pagibig",
  "tin",
  "transcriptOfRecords",
  "diploma",
  "birthCertificate",
  "photo1x1",
  "photo2x2",
];

export function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function normalizeText(value = "") {
  return String(value || "").trim();
}

export function normalizePhone(value = "") {
  return String(value || "").replace(/[^\d+]/g, "").trim();
}

export function buildSystemEmail({
  firstName = "",
  lastName = "",
  middleName = "",
}) {
  const clean = (value) =>
    String(value || "")
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .toLowerCase();

  const last = clean(lastName);
  const first = clean(firstName);
  const middle = clean(middleName);

  const firstInitial = first ? first[0] : "x";
  const middleInitial = middle ? middle[0] : "x";

  return `${last}${firstInitial}${middleInitial}@ltc-manpower.com`;
}
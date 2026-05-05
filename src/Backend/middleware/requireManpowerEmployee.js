import jwt from "jsonwebtoken";

export default function requireManpowerEmployee(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({ message: "Employee authentication required." });
    }

    const secret =
      process.env.MANPOWER_JWT_SECRET ||
      process.env.JWT_SECRET ||
      "change-this-secret";

    const decoded = jwt.verify(token, secret);

    if (!decoded?.isManpowerEmployee || !decoded?.employeeId) {
      return res.status(403).json({ message: "Employee access only." });
    }

    req.employee = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired employee token." });
  }
}
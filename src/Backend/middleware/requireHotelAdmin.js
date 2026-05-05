import jwt from "jsonwebtoken";

function getHotelAdminSecret() {
  return (
    String(process.env.HOTEL_ADMIN_JWT_SECRET || "").trim() ||
    String(process.env.JWT_SECRET || "").trim()
  );
}

function validateHotelAdminRequest(req) {
  const auth = String(req?.headers?.authorization || "").trim();

  if (!auth.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      message: "Missing Authorization token.",
    };
  }

  const token = auth.slice("Bearer ".length).trim();

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Missing token.",
    };
  }

  const secret = getHotelAdminSecret();

  if (!secret) {
    return {
      ok: false,
      status: 500,
      message: "HOTEL_ADMIN_JWT_SECRET or JWT_SECRET is missing in .env",
    };
  }

  try {
    const decoded = jwt.verify(token, secret);

    const role = String(
      decoded?.role || decoded?.userRole || decoded?.type || ""
    ).trim();

    const isHotelAdmin =
      decoded?.isHotelAdmin === true ||
      decoded?.hotelAdmin === true ||
      decoded?.scope === "hotel" ||
      role === "hotel_admin";

    if (!isHotelAdmin) {
      return {
        ok: false,
        status: 403,
        message: "Hotel admin access required.",
      };
    }

    req.hotelAdmin = decoded;

    return {
      ok: true,
      hotelAdmin: decoded,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Invalid or expired hotel admin token.",
    };
  }
}

export function requireHotelAdmin(req, res, next) {
  const result = validateHotelAdminRequest(req);

  if (!result.ok) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  return next();
}

export function checkHotelAdmin(req) {
  return validateHotelAdminRequest(req);
}

export default requireHotelAdmin;
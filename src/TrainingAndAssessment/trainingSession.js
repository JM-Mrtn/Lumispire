export function clearTrainingSession() {
  localStorage.removeItem("trainingToken");
  localStorage.removeItem("trainingUser");
  localStorage.removeItem("trainingPretestState");
}

export function isTrainingAuthResponse(res, data = {}) {
  const status = Number(res?.status || 0);
  if (status !== 401 && status !== 403) return false;

  const message = String(data?.message || "").toLowerCase();

  if (!message) return true;

  return [
    "unauthorized",
    "invalid or expired token",
    "missing token",
    "trainee access required",
    "invalid token",
    "expired token",
    "authorization token",
    "account is deactivated",
    "account is inactive",
    "user not found",
  ].some((part) => message.includes(part));
}

export function redirectToTraineeLogin(navigate, options = {}) {
  const { replace = true, message = "" } = options || {};
  clearTrainingSession();
  navigate("/trainee-login", {
    replace,
    state: message ? { message } : undefined,
  });
}

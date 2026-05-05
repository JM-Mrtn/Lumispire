import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const EMPTY_EDIT_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const AdminAccounts = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recent");

  const pageSize = 10;
  const [activePage, setActivePage] = useState(1);
  const [deactPage, setDeactPage] = useState(1);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const GREEN_DARK = "#2A4F33";
  const ROW_BG = "#EDEADF";
  const CARD_BG = "#EDEADF";

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    return raw.includes("/api/hotel") ? raw : `${raw}/api/hotel`;
  }, []);

  const getAdminToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("hotelAdminToken") || "";

  const adminHeaders = () => {
    const t = getAdminToken();
    return {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  };

  const handleAuthFail = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  useEffect(() => {
    if (!getAdminToken()) navigate("/hotel-admin-login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const res = await fetch(`${API_BASE}/hotel-users`, {
        method: "GET",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => []);

      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        setAccounts([]);
        return;
      }

      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActivePage(1);
    setDeactPage(1);
  }, [search, sortBy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = accounts.filter((a) => {
      const username = a.username || "";
      const email = a.email || "";
      const phone = a.phone || "";
      const fullName = `${a.firstName || ""} ${a.lastName || ""}`.trim();

      return (
        !q ||
        username.toLowerCase().includes(q) ||
        String(email).toLowerCase().includes(q) ||
        String(phone).toLowerCase().includes(q) ||
        fullName.toLowerCase().includes(q)
      );
    });

    list = [...list];

    if (sortBy === "A-Z") {
      list.sort((x, y) =>
        (x.username || "").toLowerCase().localeCompare((y.username || "").toLowerCase())
      );
    } else if (sortBy === "Z-A") {
      list.sort((x, y) =>
        (y.username || "").toLowerCase().localeCompare((x.username || "").toLowerCase())
      );
    }

    return list;
  }, [accounts, search, sortBy]);

  const activeAccounts = useMemo(() => filtered.filter((u) => u.active !== false), [filtered]);
  const deactivatedAccounts = useMemo(() => filtered.filter((u) => u.active === false), [filtered]);

  const paginate = (list, page) => {
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, total);
    const rows = list.slice((safePage - 1) * pageSize, safePage * pageSize);
    return { total, start, end, rows, totalPages, safePage };
  };

  const activePg = useMemo(() => paginate(activeAccounts, activePage), [activeAccounts, activePage]);
  const deactPg = useMemo(
    () => paginate(deactivatedAccounts, deactPage),
    [deactivatedAccounts, deactPage]
  );

  useEffect(() => {
    if (activePage !== activePg.safePage) setActivePage(activePg.safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePg.safePage]);

  useEffect(() => {
    if (deactPage !== deactPg.safePage) setDeactPage(deactPg.safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deactPg.safePage]);

  const handleDeactivate = async (userId) => {
    if (!userId) return;
    if (!window.confirm("Deactivate this account?")) return;

    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const res = await fetch(`${API_BASE}/deactivate-user/${userId}`, {
        method: "PUT",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        alert(data.message || "Failed to deactivate.");
        return;
      }

      setAccounts((prev) =>
        prev.map((u) => (String(u._id) === String(userId) ? { ...u, active: false } : u))
      );
    } catch (e) {
      console.error(e);
      alert("Network error while deactivating.");
    }
  };

  const handleActivate = async (userId) => {
    if (!userId) return;
    if (!window.confirm("Activate this account?")) return;

    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const res = await fetch(`${API_BASE}/activate-user/${userId}`, {
        method: "PUT",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        alert(data.message || "Failed to activate.");
        return;
      }

      setAccounts((prev) =>
        prev.map((u) => (String(u._id) === String(userId) ? { ...u, active: true } : u))
      );
    } catch (e) {
      console.error(e);
      alert("Network error while activating.");
    }
  };

  const handleDeleteDeactivated = async (userId) => {
    if (!userId) return;

    const user = accounts.find((item) => String(item._id) === String(userId));

    if (user?.active !== false) {
      alert("Only deactivated accounts can be deleted.");
      return;
    }

    const label = user?.username || user?.email || "this account";
    const ok = window.confirm(
      `Permanently delete ${label}? This action cannot be undone.`
    );

    if (!ok) return;

    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const res = await fetch(`${API_BASE}/hotel-users/${userId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        alert(data.message || "Failed to delete account.");
        return;
      }

      setAccounts((prev) => prev.filter((u) => String(u._id) !== String(userId)));
    } catch (e) {
      console.error(e);
      alert("Network error while deleting account.");
    }
  };

  const nameRegex = /^[A-Za-z\s]+$/;
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEditForm = (data) => {
    const e = {};
    const firstName = (data.firstName || "").trim();
    const lastName = (data.lastName || "").trim();
    const username = (data.username || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const phone = (data.phone || "").trim();
    const password = data.password || "";
    const confirmPassword = data.confirmPassword || "";

    if (!firstName) e.firstName = "First name is required.";
    else if (firstName.length > 20) e.firstName = "Max 20 characters.";
    else if (!nameRegex.test(firstName)) e.firstName = "Letters only.";

    if (!lastName) e.lastName = "Last name is required.";
    else if (lastName.length > 20) e.lastName = "Max 20 characters.";
    else if (!nameRegex.test(lastName)) e.lastName = "Letters only.";

    if (!username) e.username = "Username is required.";
    else if (username.length > 20) e.username = "Max 20 characters.";
    else if (!usernameRegex.test(username)) e.username = "Letters and numbers only.";

    if (!email) e.email = "Email is required.";
    else if (email.length > 50) e.email = "Max 50 characters.";
    else if (!emailRegex.test(email)) e.email = "Invalid email format.";

    if (!phone) e.phone = "Phone is required.";
    else if (!/^\d+$/.test(phone)) e.phone = "Numbers only.";
    else if (phone.length !== 11) e.phone = "Must be 11 digits.";
    else if (!phone.startsWith("09")) e.phone = "Must start with 09.";

    if (password.length > 0) {
      if (password.length < 6 || password.length > 20) {
        e.password = "Password must be 6-20 characters.";
      } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        e.password = "Must include uppercase and lowercase.";
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        e.password = "Must contain at least 1 symbol.";
      }

      if (!confirmPassword) e.confirmPassword = "Confirm password is required.";
      else if (confirmPassword !== password) e.confirmPassword = "Passwords do not match.";
    } else if (confirmPassword.length > 0) {
      e.confirmPassword = "Remove confirm password or enter a new password.";
    }

    return e;
  };

  const closeEditModal = () => {
    if (editSaving) return;
    setEditingUser(null);
    setEditForm(EMPTY_EDIT_FORM);
    setEditErrors({});
    setEditStatus({ type: "", message: "" });
    setEditLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openEditModal = async (user) => {
    if (!user?._id) return;

    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      confirmPassword: "",
    });
    setEditErrors({});
    setEditStatus({ type: "", message: "" });
    setEditLoading(true);
    setShowPassword(false);
    setShowConfirmPassword(false);

    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const res = await fetch(`${API_BASE}/hotel-users/${user._id}`, {
        method: "GET",
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        setEditStatus({ type: "error", message: data.message || "Failed to load account." });
        return;
      }

      setEditingUser(data?._id ? data : user);
      setEditForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setEditStatus({ type: "error", message: "Network error while loading account." });
    } finally {
      setEditLoading(false);
    }
  };

  const onEditChange = (key, value) => {
    let next = value;

    if (key === "firstName" || key === "lastName") next = next.replace(/[^A-Za-z\s]/g, "").slice(0, 20);
    if (key === "username") next = next.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
    if (key === "email") next = next.replace(/\s/g, "").slice(0, 50);
    if (key === "phone") next = next.replace(/\D/g, "").slice(0, 11);
    if (key === "password" || key === "confirmPassword") next = next.slice(0, 20);

    setEditForm((prev) => ({ ...prev, [key]: next }));
    setEditErrors((prev) => ({ ...prev, [key]: "" }));
    setEditStatus({ type: "", message: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingUser?._id) return;

    const nextErrors = validateEditForm(editForm);
    setEditErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setEditStatus({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setEditSaving(true);
    setEditStatus({ type: "", message: "" });

    try {
      const token = getAdminToken();
      if (!token) return handleAuthFail();

      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        username: editForm.username.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.trim(),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
        payload.confirmPassword = editForm.confirmPassword;
      }

      const res = await fetch(`${API_BASE}/admin-update-user/${editingUser._id}`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) return handleAuthFail();

      if (!res.ok) {
        setEditStatus({ type: "error", message: data.message || "Update failed." });
        return;
      }

      setAccounts((prev) =>
        prev.map((u) =>
          String(u._id) === String(editingUser._id)
            ? {
                ...u,
                firstName: payload.firstName,
                lastName: payload.lastName,
                username: payload.username,
                email: payload.email,
                phone: payload.phone,
              }
            : u
        )
      );

      setEditStatus({ type: "success", message: "Account updated successfully." });
      await fetchAccounts();
      closeEditModal();
    } catch (err) {
      console.error(err);
      setEditStatus({ type: "error", message: "Network error while saving." });
    } finally {
      setEditSaving(false);
    }
  };

  const TableHeader = () => (
    <div className="mt-4 grid grid-cols-12 gap-3 px-3 text-xs font-bold text-black/60">
      <div className="col-span-4">Username</div>
      <div className="col-span-4">Email</div>
      <div className="col-span-2">Phone Number</div>
      <div className="col-span-2 text-right">Action</div>
    </div>
  );

  const Pagination = ({ page, setPage, totalPages, start, end, total }) => (
    <div className="mt-3 flex items-center justify-between">
      <div className="text-xs font-semibold text-black/70">
        {loading ? "Loading..." : `${start}-${end} of ${total}`}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="h-8 rounded-full border border-black/10 bg-white px-3 text-xs font-bold hover:bg-black/5 disabled:opacity-50"
        >
          Prev
        </button>
        <div className="text-xs font-semibold text-black/60">
          Page {page} / {totalPages}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="h-8 rounded-full border border-black/10 bg-white px-3 text-xs font-bold hover:bg-black/5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const statusStyles =
    editStatus.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : editStatus.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <HotelAdminShell
      title="Manage Accounts"
      subtitle="View, edit, activate, and deactivate registered hotel user accounts."
      activePage="accounts"
      maxWidth="max-w-6xl"
      actions={
        <button
          type="button"
          onClick={fetchAccounts}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button
            type="button"
            onClick={fetchAccounts}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white hover:bg-black/5"
            title="Refresh"
            aria-label="Refresh"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: GREEN_DARK }}
            >
              <path
                d="M20 12a8 8 0 1 1-2.34-5.66"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 4v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="relative w-full md:w-[320px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username here"
              className="h-9 w-full rounded-full border border-black/10 bg-white pl-4 pr-10 text-sm focus:outline-none focus:ring-2"
              style={{ color: GREEN_DARK }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold focus:outline-none"
            style={{ color: GREEN_DARK }}
          >
            <option>Recent</option>
            <option>A-Z</option>
            <option>Z-A</option>
          </select>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-extrabold" style={{ color: GREEN_DARK }}>
        Active Accounts
      </h2>

      <TableHeader />

      <div className="mt-2 space-y-3">
        {activePg.rows.length === 0 && !loading && (
          <div className="mt-4 text-sm text-black/60">No active accounts found.</div>
        )}

        {activePg.rows.map((u) => (
          <div
            key={u._id}
            className="grid grid-cols-12 items-center gap-3 rounded-xl border border-black/5 px-4 py-3 shadow-sm"
            style={{ backgroundColor: ROW_BG }}
          >
            <div className="col-span-4">
              <div className="text-sm font-semibold" style={{ color: GREEN_DARK }}>
                {u.username || "-"}
              </div>
              {(u.firstName || u.lastName) && (
                <div className="text-[11px] font-semibold text-black/45">
                  {`${u.firstName || ""} ${u.lastName || ""}`.trim()}
                </div>
              )}
            </div>
            <div className="col-span-4 truncate text-sm text-black/70">{u.email || "-"}</div>
            <div className="col-span-2 text-sm text-black/70">{u.phone || "-"}</div>

            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(u)}
                className="rounded-full bg-[#E6D889] px-4 py-1 text-xs font-bold text-[#2F5E3A] hover:opacity-90"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeactivate(u._id)}
                className="rounded-full bg-[#D79A8E] px-4 py-1 text-xs font-bold text-white hover:opacity-90"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={activePage}
        setPage={setActivePage}
        totalPages={activePg.totalPages}
        start={activePg.start}
        end={activePg.end}
        total={activePg.total}
      />

      <h2 className="mt-10 text-lg font-extrabold" style={{ color: GREEN_DARK }}>
        Deactivated Accounts
      </h2>

      <TableHeader />

      <div className="mt-2 space-y-3">
        {deactPg.rows.length === 0 && !loading && (
          <div className="mt-4 text-sm text-black/60">No deactivated accounts found.</div>
        )}

        {deactPg.rows.map((u) => (
          <div
            key={u._id}
            className="grid grid-cols-12 items-center gap-3 rounded-xl border border-black/5 px-4 py-3 shadow-sm"
            style={{ backgroundColor: ROW_BG }}
          >
            <div className="col-span-4">
              <div className="text-sm font-semibold" style={{ color: GREEN_DARK }}>
                {u.username || "-"}
              </div>
              <div className="text-[11px] font-semibold text-rose-700">Deactivated</div>
            </div>

            <div className="col-span-4 truncate text-sm text-black/70">{u.email || "-"}</div>
            <div className="col-span-2 text-sm text-black/70">{u.phone || "-"}</div>

            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(u)}
                className="rounded-full bg-[#E6D889] px-4 py-1 text-xs font-bold text-[#2F5E3A] hover:opacity-90"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleActivate(u._id)}
                className="rounded-full bg-[#2F5E3A] px-4 py-1 text-xs font-bold text-white hover:opacity-90"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDeactivated(u._id)}
                className="rounded-full bg-[#B42318] px-4 py-1 text-xs font-bold text-white hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={deactPage}
        setPage={setDeactPage}
        totalPages={deactPg.totalPages}
        start={deactPg.start}
        end={deactPg.end}
        total={deactPg.total}
      />

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-black/10 bg-white p-5 shadow-2xl md:p-7">
            <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-black/40">
                  Edit Account
                </p>
                <h3 className="mt-1 text-2xl font-extrabold" style={{ color: GREEN_DARK }}>
                  {editForm.username || "Hotel User"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-black/55">
                  Update account details without leaving Manage Accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={editSaving}
                className="h-10 rounded-2xl border border-black/10 bg-white px-5 text-xs font-extrabold text-black/60 hover:bg-black/5 disabled:opacity-60"
              >
                CLOSE
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-black/5 p-5 shadow-sm" style={{ backgroundColor: CARD_BG }}>
              {editStatus.message && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${statusStyles}`}>
                  {editStatus.message}
                </div>
              )}

              {editLoading ? (
                <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-black/60">
                  Loading account details...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Input
                      label="First Name"
                      value={editForm.firstName}
                      onChange={(v) => onEditChange("firstName", v)}
                      error={editErrors.firstName}
                      disabled={editSaving}
                    />
                    <Input
                      label="Last Name"
                      value={editForm.lastName}
                      onChange={(v) => onEditChange("lastName", v)}
                      error={editErrors.lastName}
                      disabled={editSaving}
                    />
                    <Input
                      label="Username"
                      value={editForm.username}
                      onChange={(v) => onEditChange("username", v)}
                      error={editErrors.username}
                      disabled={editSaving}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={editForm.email}
                      onChange={(v) => onEditChange("email", v)}
                      error={editErrors.email}
                      disabled={editSaving}
                    />
                    <Input
                      label="Phone"
                      value={editForm.phone}
                      onChange={(v) => onEditChange("phone", v)}
                      error={editErrors.phone}
                      disabled={editSaving}
                    />
                    <PasswordInput
                      label="New Password (optional)"
                      value={editForm.password}
                      onChange={(v) => onEditChange("password", v)}
                      error={editErrors.password}
                      disabled={editSaving}
                      show={showPassword}
                      toggle={() => setShowPassword((s) => !s)}
                    />
                    <PasswordInput
                      label="Confirm Password"
                      value={editForm.confirmPassword}
                      onChange={(v) => onEditChange("confirmPassword", v)}
                      error={editErrors.confirmPassword}
                      disabled={editSaving}
                      show={showConfirmPassword}
                      toggle={() => setShowConfirmPassword((s) => !s)}
                    />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-black/55">
                    Leave password blank if you do not want to change it.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      className="h-10 rounded-full px-6 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: GREEN_DARK }}
                    >
                      {editSaving ? "SAVING..." : "SAVE CHANGES"}
                    </button>

                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={editSaving}
                      className="h-10 rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-black/70 hover:bg-black/5 disabled:opacity-60"
                    >
                      CANCEL
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </HotelAdminShell>
  );
};

function Input({ label, value, onChange, error, disabled, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-black/60">{label}</label>
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-full border bg-white px-4 text-sm focus:outline-none focus:ring-2 ${
          error ? "border-rose-400" : "border-black/10"
        } disabled:opacity-60`}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

function PasswordInput({ label, value, onChange, error, disabled, show, toggle }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-black/60">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full rounded-full border bg-white px-4 pr-14 text-sm focus:outline-none focus:ring-2 ${
            error ? "border-rose-400" : "border-black/10"
          } disabled:opacity-60`}
        />
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-extrabold text-black/55 hover:bg-black/5 disabled:opacity-60"
        >
          {show ? "HIDE" : "SHOW"}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

export default AdminAccounts;

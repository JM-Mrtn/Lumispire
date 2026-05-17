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

  const GREEN_DARK = "#071f14";
  const ROW_BG = "rgba(255,255,255,.88)";
  const CARD_BG = "rgba(246,250,247,.88)";

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
    <div className="ltc-admin-table-head">
      <div className="col-span-4">Username</div>
      <div className="col-span-4">Email</div>
      <div className="col-span-2">Phone Number</div>
      <div className="col-span-2 text-right">Action</div>
    </div>
  );

  const Pagination = ({ page, setPage, totalPages, start, end, total }) => (
    <div className="ltc-admin-pagination">
      <div className="ltc-admin-page-count">
        {loading ? "Loading..." : `${start}-${end} of ${total}`}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="ltc-admin-page-btn"
        >
          Prev
        </button>
        <div className="ltc-admin-page-count">
          Page {page} / {totalPages}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="ltc-admin-page-btn"
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
          className="ltc-admin-refresh"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      <div className="ltc-admin-accounts">
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

          .ltc-admin-accounts {
            --green-950: #071f14;
            --green-900: #0e3321;
            --green-800: #174a30;
            --green-700: #235f3e;
            --green-600: #2f754c;
            --gold: #d7a84d;
            --gold-soft: #f4d484;
            --dark: #101828;
            --muted: #667085;
            --glass: rgba(255,255,255,.78);
            --shadow-md: 0 18px 45px rgba(8,39,25,.12);
            --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
            --radius: 24px;
            --ease: cubic-bezier(.22,1,.36,1);
            min-height: calc(100vh - 120px);
            margin: -8px;
            padding: clamp(18px, 2.2vw, 28px);
            border-radius: 30px;
            color: var(--dark);
            background:
              radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
              radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
              linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
            line-height: 1.65;
            letter-spacing: -.01em;
            overflow: hidden;
            font-family: "Inter", Arial, sans-serif;
          }

          .ltc-admin-accounts * { box-sizing: border-box; }

          .ltc-admin-refresh,
          .ltc-admin-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            border-radius: 999px;
            border: 0;
            color: #102418;
            background: linear-gradient(135deg,#f4d484,#d7a84d);
            box-shadow: 0 16px 35px rgba(215,168,77,.24);
            padding: 0 22px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: .28s var(--ease);
          }

          .ltc-admin-refresh:hover,
          .ltc-admin-btn:hover { transform: translateY(-3px); }
          .ltc-admin-refresh:disabled { cursor: not-allowed; opacity: .6; transform: none; }

          .ltc-admin-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 22px;
          }

          .ltc-admin-stat-card,
          .ltc-admin-panel,
          .ltc-admin-account-row,
          .ltc-admin-empty {
            position: relative;
            overflow: hidden;
            border-radius: var(--radius);
            background: var(--glass);
            border: 1px solid rgba(255,255,255,.76);
            box-shadow: var(--shadow-md);
            backdrop-filter: blur(18px);
            animation: ltcAppleReveal .7s var(--ease) both;
          }

          .ltc-admin-stat-card {
            padding: 24px;
            transition: .38s var(--ease);
          }

          .ltc-admin-stat-card::before,
          .ltc-admin-panel::before {
            content: "";
            position: absolute;
            inset: 0 0 auto;
            height: 6px;
            background: linear-gradient(90deg,var(--green-700),var(--gold));
          }

          .ltc-admin-stat-card::after {
            content: "";
            position: absolute;
            width: 170px;
            height: 170px;
            right: -80px;
            bottom: -80px;
            border-radius: 50%;
            background:
              radial-gradient(circle, rgba(215,168,77,.22), transparent 58%),
              radial-gradient(circle, rgba(47,117,76,.18), transparent 66%);
            opacity: .85;
            transition: transform .45s var(--ease), opacity .45s var(--ease);
          }

          .ltc-admin-stat-card:hover {
            transform: translateY(-10px) scale(1.01);
            box-shadow: 0 34px 85px rgba(8,39,25,.20);
            border-color: rgba(215,168,77,.54);
            background: rgba(255,255,255,.92);
          }

          .ltc-admin-stat-card:hover::after { transform: translate(-18px, -16px) scale(1.18); }

          .ltc-admin-stat-title {
            position: relative;
            z-index: 1;
            margin: 0;
            color: rgba(16,24,40,.46);
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .18em;
          }

          .ltc-admin-stat-value {
            position: relative;
            z-index: 1;
            margin: 12px 0 0;
            color: var(--green-800);
            font-size: 40px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.055em;
          }

          .ltc-admin-stat-note {
            position: relative;
            z-index: 1;
            margin: 10px 0 0;
            color: var(--muted);
            font-size: 13px;
            font-weight: 700;
          }

          .ltc-admin-panel {
            padding: 24px;
          }

          .ltc-admin-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 22px;
          }

          .ltc-admin-search-group,
          .ltc-admin-sort-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .ltc-admin-search-box { position: relative; width: min(100%, 340px); }

          .ltc-admin-icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 16px;
            border: 1px solid rgba(35,95,62,.14);
            background: rgba(255,255,255,.88);
            box-shadow: 0 10px 22px rgba(8,39,25,.08);
            transition: .25s var(--ease);
          }

          .ltc-admin-icon-btn:hover { transform: translateY(-2px); background: white; }

          .ltc-admin-input,
          .ltc-admin-select {
            min-height: 42px;
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.14);
            background: rgba(255,255,255,.88);
            color: var(--green-950);
            padding: 0 16px;
            font-size: 13px;
            font-weight: 800;
            outline: none;
            transition: .25s var(--ease);
          }

          .ltc-admin-input { width: 100%; min-width: 260px; }
          .ltc-admin-select { min-width: 130px; }

          .ltc-admin-input:focus,
          .ltc-admin-select:focus {
            border-color: rgba(215,168,77,.58);
            box-shadow: 0 0 0 4px rgba(215,168,77,.16);
            background: white;
          }

          .ltc-admin-section-heading {
            margin: 24px 0 0;
            color: var(--green-950) !important;
            font-size: clamp(24px, 3vw, 32px);
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: -.045em;
          }

          .ltc-admin-section-heading-spaced { margin-top: 34px; }

          .ltc-admin-table-head {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 12px;
            padding: 0 18px;
            color: rgba(16,24,40,.48);
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: .12em;
          }

          .ltc-admin-account-list {
            margin-top: 10px;
            display: grid;
            gap: 12px;
          }

          .ltc-admin-account-row {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            background: rgba(255,255,255,.88) !important;
            border: 1px solid rgba(35,95,62,.08) !important;
            box-shadow: 0 12px 26px rgba(8,39,25,.06) !important;
            transition: .25s var(--ease);
          }

          .ltc-admin-account-row:hover {
            transform: translateY(-3px);
            border-color: rgba(215,168,77,.42) !important;
            background: rgba(255,255,255,.96) !important;
          }

          .ltc-admin-account-name {
            color: var(--green-800) !important;
            font-size: 14px;
            font-weight: 900;
          }

          .ltc-admin-account-sub,
          .ltc-admin-account-info {
            color: rgba(16,24,40,.55);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-admin-actions-cell { flex-wrap: wrap; }

          .ltc-admin-action-btn,
          .ltc-admin-page-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 32px;
            border-radius: 999px;
            border: 1px solid transparent;
            padding: 0 14px;
            font-size: 11px;
            font-weight: 900;
            cursor: pointer;
            transition: .25s var(--ease);
          }

          .ltc-admin-action-btn:hover,
          .ltc-admin-page-btn:hover { transform: translateY(-2px); }

          .ltc-admin-action-edit { background: rgba(244,212,132,.78); color: var(--green-900); }
          .ltc-admin-action-success { background: var(--green-800); color: white; }
          .ltc-admin-action-danger { background: #fff1f2; color: #be123c; border-color: #fecdd3; }

          .ltc-admin-pagination {
            margin-top: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .ltc-admin-page-count {
            color: rgba(16,24,40,.56);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-admin-page-btn {
            background: rgba(255,255,255,.9);
            border-color: rgba(35,95,62,.12);
            color: var(--green-800);
          }

          .ltc-admin-page-btn:disabled { opacity: .48; cursor: not-allowed; transform: none; }

          .ltc-admin-empty {
            padding: 20px;
            text-align: center;
            border-style: dashed;
            color: var(--muted) !important;
            font-size: 13px;
            font-weight: 800;
          }

          @keyframes ltcAppleReveal {
            from { opacity: 0; transform: translateY(34px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (max-width: 1120px) {
            .ltc-admin-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }

          @media (max-width: 760px) {
            .ltc-admin-accounts { margin: -12px; padding: 14px; border-radius: 20px; }
            .ltc-admin-stats-grid { grid-template-columns: 1fr; }
            .ltc-admin-toolbar,
            .ltc-admin-search-group,
            .ltc-admin-sort-wrap { align-items: stretch; flex-direction: column; width: 100%; }
            .ltc-admin-search-box,
            .ltc-admin-input,
            .ltc-admin-select { width: 100%; min-width: 0; }
            .ltc-admin-table-head { display: none; }
            .ltc-admin-account-row { grid-template-columns: 1fr; gap: 8px; }
            .ltc-admin-account-row > div { grid-column: auto !important; }
            .ltc-admin-actions-cell { justify-content: flex-start !important; }
          }
        `}</style>

        <div className="ltc-admin-stats-grid">
          <div className="ltc-admin-stat-card">
            <p className="ltc-admin-stat-title">Total Accounts</p>
            <p className="ltc-admin-stat-value">{accounts.length}</p>
            <p className="ltc-admin-stat-note">Registered hotel users</p>
          </div>

          <div className="ltc-admin-stat-card">
            <p className="ltc-admin-stat-title">Active</p>
            <p className="ltc-admin-stat-value">{activeAccounts.length}</p>
            <p className="ltc-admin-stat-note">Currently enabled accounts</p>
          </div>

          <div className="ltc-admin-stat-card">
            <p className="ltc-admin-stat-title">Deactivated</p>
            <p className="ltc-admin-stat-value">{deactivatedAccounts.length}</p>
            <p className="ltc-admin-stat-note">Disabled guest accounts</p>
          </div>

          <div className="ltc-admin-stat-card">
            <p className="ltc-admin-stat-title">Search Results</p>
            <p className="ltc-admin-stat-value">{filtered.length}</p>
            <p className="ltc-admin-stat-note">Matching current filters</p>
          </div>
        </div>

        <section className="ltc-admin-panel">
      <div className="ltc-admin-toolbar">
        <div className="ltc-admin-search-group">
          <button
            type="button"
            onClick={fetchAccounts}
            className="ltc-admin-icon-btn"
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

          <div className="ltc-admin-search-box">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username here"
              className="ltc-admin-input"
              style={{ color: GREEN_DARK }}
            />
          </div>
        </div>

        <div className="ltc-admin-sort-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ltc-admin-select"
            style={{ color: GREEN_DARK }}
          >
            <option>Recent</option>
            <option>A-Z</option>
            <option>Z-A</option>
          </select>
        </div>
      </div>

      <h2 className="ltc-admin-section-heading" style={{ color: GREEN_DARK }}>
        Active Accounts
      </h2>

      <TableHeader />

      <div className="ltc-admin-account-list">
        {activePg.rows.length === 0 && !loading && (
          <div className="ltc-admin-empty">No active accounts found.</div>
        )}

        {activePg.rows.map((u) => (
          <div
            key={u._id}
            className="ltc-admin-account-row"
            style={{ backgroundColor: ROW_BG }}
          >
            <div className="col-span-4">
              <div className="ltc-admin-account-name" style={{ color: GREEN_DARK }}>
                {u.username || "-"}
              </div>
              {(u.firstName || u.lastName) && (
                <div className="ltc-admin-account-sub">
                  {`${u.firstName || ""} ${u.lastName || ""}`.trim()}
                </div>
              )}
            </div>
            <div className="col-span-4 truncate ltc-admin-account-info">{u.email || "-"}</div>
            <div className="col-span-2 ltc-admin-account-info">{u.phone || "-"}</div>

            <div className="col-span-2 flex justify-end gap-2 ltc-admin-actions-cell">
              <button
                type="button"
                onClick={() => openEditModal(u)}
                className="ltc-admin-action-btn ltc-admin-action-edit"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeactivate(u._id)}
                className="ltc-admin-action-btn ltc-admin-action-danger"
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

      <h2 className="ltc-admin-section-heading ltc-admin-section-heading-spaced" style={{ color: GREEN_DARK }}>
        Deactivated Accounts
      </h2>

      <TableHeader />

      <div className="ltc-admin-account-list">
        {deactPg.rows.length === 0 && !loading && (
          <div className="ltc-admin-empty">No deactivated accounts found.</div>
        )}

        {deactPg.rows.map((u) => (
          <div
            key={u._id}
            className="ltc-admin-account-row"
            style={{ backgroundColor: ROW_BG }}
          >
            <div className="col-span-4">
              <div className="ltc-admin-account-name" style={{ color: GREEN_DARK }}>
                {u.username || "-"}
              </div>
              <div className="text-[11px] font-semibold text-rose-700">Deactivated</div>
            </div>

            <div className="col-span-4 truncate ltc-admin-account-info">{u.email || "-"}</div>
            <div className="col-span-2 ltc-admin-account-info">{u.phone || "-"}</div>

            <div className="col-span-2 flex justify-end gap-2 ltc-admin-actions-cell">
              <button
                type="button"
                onClick={() => openEditModal(u)}
                className="ltc-admin-action-btn ltc-admin-action-edit"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleActivate(u._id)}
                className="ltc-admin-action-btn ltc-admin-action-success"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDeactivated(u._id)}
                className="ltc-admin-action-btn ltc-admin-action-danger"
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

        </section>

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
      </div>
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

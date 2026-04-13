"use client";

import React, { useEffect, useMemo, useState } from "react";

type UserRole =
  | "Receptionist"
  | "Technical Staff"
  | "Radiologist"
  | "Admin"
  | "Super Admin"
  | "Referrer";

type UserStatus = "Active" | "Locked" | "Deactivated";

type UserRecord = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  clinic: string;
  accessGroup: string;
  status: UserStatus;
  mfaEnabled: boolean;
  lastLogin: string;
  updatedAt: string;
};

type AuditItem = {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
};

const roles: UserRole[] = [
  "Receptionist",
  "Technical Staff",
  "Radiologist",
  "Admin",
  "Super Admin",
  "Referrer"
];

const clinics = ["Main Clinic", "North Branch", "South Branch", "Remote Access"];
const accessGroups = [
  "Scheduling",
  "Reporting",
  "Administration",
  "Referrer Portal",
  "Clinical Review"
];

const seedUsers: UserRecord[] = [
  {
    id: 1,
    fullName: "Susan Hall",
    email: "susan.hall@esyris.com",
    role: "Admin",
    clinic: "Main Clinic",
    accessGroup: "Administration",
    status: "Active",
    mfaEnabled: true,
    lastLogin: "Today 08:14",
    updatedAt: "2026-03-27 09:10"
  },
  {
    id: 2,
    fullName: "Robert Lang",
    email: "robert.lang@esyris.com",
    role: "Technical Staff",
    clinic: "North Branch",
    accessGroup: "Clinical Review",
    status: "Locked",
    mfaEnabled: true,
    lastLogin: "Yesterday 17:40",
    updatedAt: "2026-03-26 17:45"
  },
  {
    id: 3,
    fullName: "Amy Song",
    email: "amy.song@esyris.com",
    role: "Receptionist",
    clinic: "South Branch",
    accessGroup: "Scheduling",
    status: "Active",
    mfaEnabled: false,
    lastLogin: "Today 07:56",
    updatedAt: "2026-03-27 08:00"
  },
  {
    id: 4,
    fullName: "Helen Morris",
    email: "helen.morris@esyris.com",
    role: "Radiologist",
    clinic: "Main Clinic",
    accessGroup: "Reporting",
    status: "Active",
    mfaEnabled: true,
    lastLogin: "Today 06:50",
    updatedAt: "2026-03-27 07:02"
  },
  {
    id: 5,
    fullName: "David Patel",
    email: "david.patel@esyris.com",
    role: "Referrer",
    clinic: "Remote Access",
    accessGroup: "Referrer Portal",
    status: "Deactivated",
    mfaEnabled: false,
    lastLogin: "2026-03-20 10:12",
    updatedAt: "2026-03-21 14:15"
  }
];

const seedAudit: AuditItem[] = [
  {
    id: 1,
    timestamp: "2026-03-27 09:10",
    actor: "Admin Console",
    action: "Updated permissions",
    target: "Susan Hall"
  },
  {
    id: 2,
    timestamp: "2026-03-26 17:45",
    actor: "Security User",
    action: "Locked account",
    target: "Robert Lang"
  },
  {
    id: 3,
    timestamp: "2026-03-27 08:00",
    actor: "Admin Console",
    action: "Changed clinic mapping",
    target: "Amy Song"
  },
  {
    id: 4,
    timestamp: "2026-03-27 07:02",
    actor: "Admin Console",
    action: "Enabled MFA",
    target: "Helen Morris"
  }
];

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";

const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

export default function CompactUserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>(seedUsers);
  const [audit, setAudit] = useState<AuditItem[]>(seedAudit);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [message, setMessage] = useState("");

  const selectedUser =
    users.find((user) => user.id === selectedId) || users[0];

  const [form, setForm] = useState<UserRecord>(selectedUser);

  useEffect(() => {
    setForm(selectedUser);
    setMessage("");
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.clinic.toLowerCase().includes(q);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const activeCount = users.filter((u) => u.status === "Active").length;
  const lockedCount = users.filter((u) => u.status === "Locked").length;
  const deactivatedCount = users.filter((u) => u.status === "Deactivated").length;

  const updateForm = (field: keyof UserRecord, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const pushAudit = (action: string, target: string) => {
    setAudit((prev) => [
      {
        id: Date.now(),
        timestamp: "2026-03-27 09:30",
        actor: "Admin Console",
        action,
        target
      },
      ...prev
    ]);
  };

  const saveChanges = () => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === form.id
          ? { ...form, updatedAt: "2026-03-27 09:30" }
          : user
      )
    );
    pushAudit("Saved profile changes", form.fullName);
    setMessage("User updated successfully.");
  };

  const quickToggleLock = () => {
    const nextStatus: UserStatus =
      form.status === "Locked" ? "Active" : "Locked";

    const updated = {
      ...form,
      status: nextStatus,
      updatedAt: "2026-03-27 09:30"
    };

    setForm(updated);
    setUsers((prev) =>
      prev.map((user) => (user.id === form.id ? updated : user))
    );
    pushAudit(
      nextStatus === "Locked" ? "Locked account" : "Unlocked account",
      form.fullName
    );
    setMessage(`User status changed to ${nextStatus}.`);
  };

  const quickDeactivate = () => {
    const updated = {
      ...form,
      status: "Deactivated" as UserStatus,
      updatedAt: "2026-03-27 09:30"
    };

    setForm(updated);
    setUsers((prev) =>
      prev.map((user) => (user.id === form.id ? updated : user))
    );
    pushAudit("Deactivated account", form.fullName);
    setMessage("User deactivated.");
  };

  const quickResetPassword = () => {
    pushAudit("Triggered password reset", form.fullName);
    setMessage("Password reset link sent.");
  };

  const quickCreateUser = () => {
    const newUser: UserRecord = {
      id: Date.now(),
      fullName: "New User",
      email: `new.user${users.length + 1}@esyris.com`,
      role: "Receptionist",
      clinic: "Main Clinic",
      accessGroup: "Scheduling",
      status: "Active",
      mfaEnabled: false,
      lastLogin: "Never",
      updatedAt: "2026-03-27 09:30"
    };

    setUsers((prev) => [newUser, ...prev]);
    setSelectedId(newUser.id);
    pushAudit("Created new account", newUser.fullName);
    setMessage("New user created.");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          ADMIN • USER MANAGEMENT • ACTIVE {activeCount} • LOCKED {lockedCount} • DEACTIVATED {deactivatedCount}
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[13px] font-bold text-[#222]">
          v
        </button>
      </div>

      <div className="h-[calc(100vh-44px)] overflow-hidden p-2">
        <div className={`${panelClass} mb-2 flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="logo"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <div className="text-[11px] font-extrabold tracking-[2px] text-[#1da4ff]">
                USER ADMINISTRATION
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Access & Status Control
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={quickCreateUser}
              className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]"
            >
              + New User
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
            >
              Save
            </button>
          </div>
        </div>

        {message ? (
          <div className="mb-2 rounded-2xl border border-emerald-700/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-bold text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="grid h-[calc(100%-76px)] grid-cols-1 gap-2 xl:grid-cols-[1.02fr_1.18fr_0.78fr]">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">User Directory</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Fast search and one-click selection
                </div>
              </div>
              <div className="inline-flex h-7 items-center rounded-full bg-emerald-500/15 px-3 text-[11px] font-extrabold text-emerald-300">
                {filteredUsers.length} shown
              </div>
            </div>

            <div className="mb-2 grid grid-cols-[1.5fr_0.9fr_0.9fr] gap-2">
              <input
                className={inputClass}
                placeholder="Search name, email, clinic..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <select
                className={selectClass}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All</option>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>

              <select
                className={selectClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Locked</option>
                <option>Deactivated</option>
              </select>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedId(user.id)}
                  className={`flex w-full items-start justify-between rounded-[20px] border px-3 py-3 text-left ${
                    user.id === selectedId
                      ? "border-sky-500/45 bg-[#0b213f]"
                      : "border-[#143a5c] bg-[#071427]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-extrabold">
                      {user.fullName}
                    </div>
                    <div className="mt-1 text-[12px] text-white/62">
                      {user.email} • {user.clinic}
                    </div>
                  </div>

                  <div className="ml-3 flex flex-col items-end gap-2">
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        user.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : user.status === "Locked"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Selected User</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Compact edit form with inline actions
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Last login: {form.lastLogin}
                </span>
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Updated: {form.updatedAt}
                </span>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={quickToggleLock}
                className="h-9 rounded-2xl border border-sky-600/30 bg-[#0f2746] px-4 text-[13px] font-bold text-sky-300"
              >
                {form.status === "Locked" ? "Unlock" : "Lock"}
              </button>

              <button
                type="button"
                onClick={quickResetPassword}
                className="h-9 rounded-2xl border border-slate-700/40 bg-[#111b2f] px-4 text-[13px] font-bold text-white"
              >
                Reset Password
              </button>

              <button
                type="button"
                onClick={quickDeactivate}
                className="h-9 rounded-2xl border border-rose-700/30 bg-rose-500/15 px-4 text-[13px] font-bold text-rose-300"
              >
                Deactivate
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Role</label>
                  <select
                    className={selectClass}
                    value={form.role}
                    onChange={(e) => updateForm("role", e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Clinic</label>
                  <select
                    className={selectClass}
                    value={form.clinic}
                    onChange={(e) => updateForm("clinic", e.target.value)}
                  >
                    {clinics.map((clinic) => (
                      <option key={clinic}>{clinic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Access Group</label>
                  <select
                    className={selectClass}
                    value={form.accessGroup}
                    onChange={(e) => updateForm("accessGroup", e.target.value)}
                  >
                    {accessGroups.map((group) => (
                      <option key={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <option>Active</option>
                    <option>Locked</option>
                    <option>Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 xl:grid-cols-3">
                <div className="flex h-[52px] items-center justify-between rounded-[18px] border border-[#143a5c] bg-[#071427] px-3">
                  <span className="text-[13px] font-bold text-white/80">MFA</span>
                  <button
                    type="button"
                    onClick={() => updateForm("mfaEnabled", !form.mfaEnabled)}
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                      form.mfaEnabled
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-500/20 text-slate-200"
                    }`}
                  >
                    {form.mfaEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex h-[52px] items-center justify-between rounded-[18px] border border-[#143a5c] bg-[#071427] px-3">
                  <span className="text-[13px] font-bold text-white/80">Role-Based Access</span>
                  <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-extrabold text-sky-300">
                    Active
                  </span>
                </div>

                <div className="flex h-[52px] items-center justify-between rounded-[18px] border border-[#143a5c] bg-[#071427] px-3">
                  <span className="text-[13px] font-bold text-white/80">Status Control</span>
                  <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-extrabold text-sky-300">
                    {form.status}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Audit Visibility</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Recent admin actions
                </div>
              </div>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-500/15 text-[12px] font-extrabold text-emerald-300">
                {audit.length}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-0">
                {audit.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#143a5c] py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-bold">{item.action}</span>
                      <span className="text-[11px] text-white/50">{item.timestamp}</span>
                    </div>
                    <div className="mt-1 text-[12px] text-white/60">
                      {item.target} • {item.actor}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Quick Summary</div>

                {[
                  ["Selected", form.fullName],
                  ["Role", form.role],
                  ["Clinic", form.clinic],
                  ["MFA", form.mfaEnabled ? "Enabled" : "Disabled"]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-2 border-b border-[#143a5c] py-2 text-[13px] text-white/80"
                  >
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
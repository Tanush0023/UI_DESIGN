"use client";

import React, { useMemo, useState } from "react";

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

  React.useEffect(() => {
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
    pushAudit(nextStatus === "Locked" ? "Locked account" : "Unlocked account", form.fullName);
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
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          ADMIN • USER MANAGEMENT • ACTIVE {activeCount} • LOCKED {lockedCount} • DEACTIVATED {deactivatedCount}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>USER ADMINISTRATION</div>
              <div style={styles.title}>Compact Access & Status Control</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <button style={styles.ghostButton} onClick={quickCreateUser}>
              + New User
            </button>
            <button style={styles.primaryButton} onClick={saveChanges}>
              Save
            </button>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <section style={styles.leftPanel}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>User Directory</div>
                <div style={styles.panelSub}>Fast search and one-click selection</div>
              </div>
              <div style={styles.counterBadge}>{filteredUsers.length} shown</div>
            </div>

            <div style={styles.filterRow}>
              <input
                style={styles.input}
                placeholder="Search name, email, clinic..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                style={styles.select}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All</option>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Locked</option>
                <option>Deactivated</option>
              </select>
            </div>

            <div style={styles.userList}>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedId(user.id)}
                  style={
                    user.id === selectedId
                      ? styles.userRowActive
                      : styles.userRow
                  }
                >
                  <div style={styles.userRowMain}>
                    <div style={styles.userName}>{user.fullName}</div>
                    <div style={styles.userMeta}>
                      {user.email} • {user.clinic}
                    </div>
                  </div>

                  <div style={styles.userTags}>
                    <span style={styles.roleTag}>{user.role}</span>
                    <span
                      style={
                        user.status === "Active"
                          ? styles.statusActive
                          : user.status === "Locked"
                          ? styles.statusLocked
                          : styles.statusDeactivated
                      }
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.centerPanel}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Selected User</div>
                <div style={styles.panelSub}>Compact edit form with inline actions</div>
              </div>
              <div style={styles.inlineMetrics}>
                <span style={styles.metricChip}>Last login: {form.lastLogin}</span>
                <span style={styles.metricChip}>Updated: {form.updatedAt}</span>
              </div>
            </div>

            <div style={styles.quickActionRow}>
              <button style={styles.smallBlueButton} onClick={quickToggleLock}>
                {form.status === "Locked" ? "Unlock" : "Lock"}
              </button>
              <button style={styles.smallNeutralButton} onClick={quickResetPassword}>
                Reset Password
              </button>
              <button style={styles.smallRedButton} onClick={quickDeactivate}>
                Deactivate
              </button>
            </div>

            <div style={styles.compactFormGrid}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  value={form.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Clinic</label>
                <select
                  style={styles.select}
                  value={form.clinic}
                  onChange={(e) => updateForm("clinic", e.target.value)}
                >
                  {clinics.map((clinic) => (
                    <option key={clinic}>{clinic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Access Group</label>
                <select
                  style={styles.select}
                  value={form.accessGroup}
                  onChange={(e) => updateForm("accessGroup", e.target.value)}
                >
                  {accessGroups.map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Locked</option>
                  <option>Deactivated</option>
                </select>
              </div>
            </div>

            <div style={styles.inlineToggleRow}>
              <div style={styles.toggleCard}>
                <span style={styles.toggleLabel}>MFA</span>
                <button
                  style={form.mfaEnabled ? styles.toggleOn : styles.toggleOff}
                  onClick={() => updateForm("mfaEnabled", !form.mfaEnabled)}
                >
                  {form.mfaEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div style={styles.toggleCard}>
                <span style={styles.toggleLabel}>RBAC</span>
                <span style={styles.miniBadge}>Active</span>
              </div>

              <div style={styles.toggleCard}>
                <span style={styles.toggleLabel}>Status</span>
                <span style={styles.miniBadge}>{form.status}</span>
              </div>
            </div>

            {message ? <div style={styles.message}>{message}</div> : null}
          </section>

          <section style={styles.rightPanel}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Audit Visibility</div>
                <div style={styles.panelSub}>Recent admin actions</div>
              </div>
              <div style={styles.counterBadge}>{audit.length}</div>
            </div>

            <div style={styles.auditList}>
              {audit.slice(0, 8).map((item) => (
                <div key={item.id} style={styles.auditRow}>
                  <div style={styles.auditTop}>
                    <span style={styles.auditAction}>{item.action}</span>
                    <span style={styles.auditTime}>{item.timestamp}</span>
                  </div>
                  <div style={styles.auditMeta}>
                    {item.target} • {item.actor}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summaryPanel}>
              <div style={styles.summaryTitle}>Quick Summary</div>
              <div style={styles.summaryRow}>
                <span>Selected</span>
                <strong>{form.fullName}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Role</span>
                <strong>{form.role}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Clinic</span>
                <strong>{form.clinic}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>MFA</span>
                <strong>{form.mfaEnabled ? "Enabled" : "Disabled"}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#030a16",
    color: "#ffffff",
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    overflow: "hidden"
  },

  topStrip: {
    height: 28,
    background: "#8d0d46",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px"
  },

  topStripText: {
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },

  collapseButton: {
    height: 20,
    minWidth: 20,
    borderRadius: 999,
    border: "none",
    background: "#d9d9d9",
    color: "#222",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1
  },

  appShell: {
    padding: 8,
    height: "calc(100vh - 28px)",
    boxSizing: "border-box"
  },

  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(54,112,190,0.28)",
    borderRadius: 14,
    background: "#020d1f",
    padding: "8px 12px",
    marginBottom: 8
  },

  titleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  logo: {
    width: 24,
    height: 24,
    borderRadius: 5,
    objectFit: "cover"
  },

  eyebrow: {
    fontSize: 9,
    color: "#1da4ff",
    fontWeight: 800,
    letterSpacing: "1.2px"
  },

  title: {
    fontSize: 14,
    fontWeight: 800,
    marginTop: 1
  },

  titleActions: {
    display: "flex",
    gap: 6,
    alignItems: "center"
  },

  ghostButton: {
    height: 26,
    padding: "0 10px",
    borderRadius: 9,
    border: "1px solid rgba(54,112,190,0.32)",
    background: "#0d1d35",
    color: "#59b7ff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer"
  },

  primaryButton: {
    height: 26,
    padding: "0 12px",
    borderRadius: 9,
    border: "none",
    background: "#00a96e",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer"
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1.2fr 0.8fr",
    gap: 8,
    height: "calc(100% - 50px)"
  },

  leftPanel: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    minHeight: 0
  },

  centerPanel: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    minHeight: 0
  },

  rightPanel: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    minHeight: 0
  },

  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6
  },

  panelTitle: {
    fontSize: 11,
    fontWeight: 800
  },

  panelSub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.56)",
    marginTop: 1
  },

  counterBadge: {
    height: 18,
    padding: "0 7px",
    borderRadius: 999,
    background: "rgba(0,169,110,0.16)",
    color: "#00d18a",
    fontSize: 9,
    fontWeight: 800,
    display: "flex",
    alignItems: "center"
  },

  filterRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.9fr 0.9fr",
    gap: 5,
    marginBottom: 6
  },

  input: {
    width: "100%",
    height: 26,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "0 8px",
    fontSize: 11,
    outline: "none",
    boxSizing: "border-box"
  },

  select: {
    width: "100%",
    height: 26,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "0 8px",
    fontSize: 11,
    outline: "none",
    boxSizing: "border-box"
  },

  userList: {
    overflowY: "auto",
    minHeight: 0,
    paddingRight: 2
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    border: "1px solid rgba(54,112,190,0.18)",
    background: "#071427",
    borderRadius: 10,
    padding: "6px 8px",
    marginBottom: 5,
    cursor: "pointer"
  },

  userRowActive: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    border: "1px solid rgba(26,154,255,0.45)",
    background: "#0b213f",
    borderRadius: 10,
    padding: "6px 8px",
    marginBottom: 5,
    cursor: "pointer"
  },

  userRowMain: {
    minWidth: 0
  },

  userName: {
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.1
  },

  userMeta: {
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 220
  },

  userTags: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3
  },

  roleTag: {
    fontSize: 9,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(26,154,255,0.14)",
    color: "#59b7ff",
    fontWeight: 700
  },

  statusActive: {
    fontSize: 9,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(0,169,110,0.16)",
    color: "#00d18a",
    fontWeight: 700
  },

  statusLocked: {
    fontSize: 9,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(255,170,0,0.16)",
    color: "#ffb84d",
    fontWeight: 700
  },

  statusDeactivated: {
    fontSize: 9,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.16)",
    color: "#ff8b95",
    fontWeight: 700
  },

  inlineMetrics: {
    display: "flex",
    gap: 5,
    flexWrap: "wrap"
  },

  metricChip: {
    fontSize: 9,
    padding: "3px 7px",
    borderRadius: 999,
    background: "#0d1830",
    color: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(92,118,166,0.24)"
  },

  quickActionRow: {
    display: "flex",
    gap: 5,
    marginBottom: 6
  },

  smallBlueButton: {
    height: 24,
    padding: "0 8px",
    borderRadius: 8,
    border: "1px solid rgba(26,154,255,0.3)",
    background: "#0f2746",
    color: "#59b7ff",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer"
  },

  smallNeutralButton: {
    height: 24,
    padding: "0 8px",
    borderRadius: 8,
    border: "1px solid rgba(92,118,166,0.28)",
    background: "#111b2f",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer"
  },

  smallRedButton: {
    height: 24,
    padding: "0 8px",
    borderRadius: 8,
    border: "1px solid rgba(210,77,87,0.28)",
    background: "#32141b",
    color: "#ff8b95",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer"
  },

  compactFormGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6
  },

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
  },

  inlineToggleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 6,
    marginTop: 6
  },

  toggleCard: {
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(54,112,190,0.18)",
    background: "#071427",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px"
  },

  toggleLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(255,255,255,0.76)"
  },

  toggleOn: {
    height: 20,
    padding: "0 8px",
    borderRadius: 999,
    border: "none",
    background: "#00a96e",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer"
  },

  toggleOff: {
    height: 20,
    padding: "0 8px",
    borderRadius: 999,
    border: "none",
    background: "#4b5563",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer"
  },

  miniBadge: {
    fontSize: 9,
    padding: "3px 7px",
    borderRadius: 999,
    background: "#113254",
    color: "#59b7ff",
    fontWeight: 800
  },

  message: {
    marginTop: 6,
    fontSize: 10,
    color: "#00d18a",
    fontWeight: 700
  },

  auditList: {
    overflowY: "auto",
    minHeight: 0,
    marginBottom: 6
  },

  auditRow: {
    padding: "6px 0",
    borderBottom: "1px solid rgba(54,112,190,0.14)"
  },

  auditTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 6
  },

  auditAction: {
    fontSize: 10,
    fontWeight: 700
  },

  auditTime: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)"
  },

  auditMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.58)"
  },

  summaryPanel: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  summaryTitle: {
    fontSize: 10,
    fontWeight: 800,
    marginBottom: 4
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 0",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)"
  }
};
"use client";

import React, { useMemo, useState } from "react";

type UserStatus = "Active" | "Locked" | "Deactivated";
type UserRole =
  | "Receptionist"
  | "Technical Staff"
  | "Radiologist"
  | "Admin"
  | "Super Admin"
  | "Referrer";
type ClinicOption = "Main Clinic" | "North Branch" | "South Branch";

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  clinic: ClinicOption;
  lastUpdated: string;
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Susan Hall",
    email: "susan.hall@esyris.com",
    role: "Admin",
    status: "Active",
    clinic: "Main Clinic",
    lastUpdated: "2026-03-26 14:22",
  },
  {
    id: 2,
    name: "Robert Lang",
    email: "robert.lang@esyris.com",
    role: "Technical Staff",
    status: "Locked",
    clinic: "North Branch",
    lastUpdated: "2026-03-25 11:08",
  },
  {
    id: 3,
    name: "Amy Song",
    email: "amy.song@esyris.com",
    role: "Receptionist",
    status: "Active",
    clinic: "South Branch",
    lastUpdated: "2026-03-24 09:47",
  },
];

const roleOptions: UserRole[] = [
  "Receptionist",
  "Technical Staff",
  "Radiologist",
  "Admin",
  "Super Admin",
  "Referrer",
];

const clinicOptions: ClinicOption[] = [
  "Main Clinic",
  "North Branch",
  "South Branch",
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Receptionist");
  const [clinic, setClinic] = useState<ClinicOption>("Main Clinic");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number>(1);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.status.toLowerCase().includes(q) ||
        user.clinic.toLowerCase().includes(q)
    );
  }, [users, query]);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? users[0];

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const exists = users.some(
      (user) => user.email.toLowerCase() === trimmedEmail
    );

    if (exists) {
      setMessage("A user with this email already exists.");
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      role,
      clinic,
      status: "Active",
      lastUpdated: "2026-03-27 09:30",
    };

    setUsers((prev) => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    setName("");
    setEmail("");
    setRole("Receptionist");
    setClinic("Main Clinic");
    setMessage("User added successfully.");
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Locked" : "Active",
              lastUpdated: "2026-03-27 09:30",
            }
          : user
      )
    );
    setMessage("User status updated.");
  };

  const deactivateUser = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: "Deactivated",
              lastUpdated: "2026-03-27 09:30",
            }
          : user
      )
    );
    setMessage("User deactivated successfully.");
  };

  const promoteUser = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              role: user.role === "Admin" ? "Super Admin" : "Admin",
              lastUpdated: "2026-03-27 09:30",
            }
          : user
      )
    );
    setMessage("User role updated.");
  };

  const activeCount = users.filter((u) => u.status === "Active").length;
  const lockedCount = users.filter((u) => u.status === "Locked").length;
  const adminCount = users.filter(
    (u) => u.role === "Admin" || u.role === "Super Admin"
  ).length;

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>User Management</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topInfoPill}>View: User Management</div>
          <div style={styles.topInfoSuccess}>Active: {activeCount}</div>
          <div style={styles.topInfoDanger}>Locked: {lockedCount}</div>
          <div style={styles.topInfoPill}>Admins: {adminCount}</div>
          <div style={styles.userPill}>Admin Console</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>ADMIN CONSOLE</div>
            <div style={styles.sidebarSub}>Workspace control panel</div>
          </div>

          <div style={styles.navGroup}>
            <div style={styles.navItemActive}>User Management</div>
            <div style={styles.navItem}>Roles & Permissions</div>
            <div style={styles.navItem}>Audit Log</div>
            <div style={styles.navItem}>System Access</div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>Overview</div>

            <div style={styles.statusRow}>
              <span style={styles.statusDotGreen} />
              <span>{activeCount} Active Users</span>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.statusDotRed} />
              <span>{lockedCount} Locked Users</span>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.statusDotBlue} />
              <span>{adminCount} Admin Accounts</span>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>ACCESS CONTROL</div>
              <h1 style={styles.pageTitle}>User Administration Screens</h1>
              <p style={styles.pageSub}>
                Create, modify, lock, unlock, and deactivate users in a secure
                administration workspace.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button type="button" style={styles.secondaryButton}>
                Export
              </button>
              <button type="button" style={styles.primaryButton}>
                Authorise
              </button>
            </div>
          </div>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Total Users</div>
              <div style={styles.metricValue}>{users.length}</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Active</div>
              <div style={styles.metricValue}>{activeCount}</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Locked</div>
              <div style={styles.metricValue}>{lockedCount}</div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Admins</div>
              <div style={styles.metricValue}>{adminCount}</div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Create New User</div>
                  <div style={styles.panelSub}>
                    Create a new account with role and clinic assignment.
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddUser}>
                <div style={styles.formGrid}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                  />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    style={styles.select}
                  >
                    {roleOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value as ClinicOption)}
                    style={styles.select}
                  >
                    {clinicOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <button type="submit" style={styles.primaryButtonFull}>
                    Add User
                  </button>
                </div>
              </form>

              {message ? (
                <div
                  style={{
                    ...styles.message,
                    color: message.toLowerCase().includes("successfully")
                      ? "#53c27a"
                      : "rgba(255,255,255,0.72)",
                  }}
                >
                  {message}
                </div>
              ) : null}
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Selected User</div>
                  <div style={styles.panelSub}>
                    Quick user summary and status controls.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Name</span>
                  <strong>{selectedUser?.name || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Email</span>
                  <strong>{selectedUser?.email || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Role</span>
                  <strong>{selectedUser?.role || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Clinic</span>
                  <strong>{selectedUser?.clinic || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Status</span>
                  <strong>{selectedUser?.status || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Last Updated</span>
                  <strong>{selectedUser?.lastUpdated || "-"}</strong>
                </div>
              </div>
            </section>
          </div>

          <section style={{ ...styles.panel, marginTop: 18 }}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Directory Search</div>
                <div style={styles.panelSub}>
                  Filter users by name, role, clinic, status, or email.
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.input}
            />
          </section>

          <section
            style={{
              ...styles.panel,
              marginTop: 18,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div style={styles.tableHeaderBar}>
              <div>
                <div style={styles.panelTitle}>User List</div>
                <div style={styles.panelSub}>
                  {filteredUsers.length} record
                  {filteredUsers.length !== 1 ? "s" : ""} shown
                </div>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Clinic</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={styles.emptyCell}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        style={styles.tr}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td style={styles.td}>
                          <div style={styles.userName}>{user.name}</div>
                        </td>
                        <td style={styles.tdMuted}>{user.email}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              user.role === "Admin" ||
                              user.role === "Super Admin"
                                ? styles.roleAdmin
                                : styles.roleUser
                            }
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={styles.tdMuted}>{user.clinic}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              user.status === "Active"
                                ? styles.badgeActive
                                : user.status === "Locked"
                                ? styles.badgeLocked
                                : styles.badgeDeactivated
                            }
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(user.id);
                              }}
                              style={
                                user.status === "Active"
                                  ? styles.warningButton
                                  : styles.unlockButton
                              }
                            >
                              {user.status === "Active" ? "Lock" : "Unlock"}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                promoteUser(user.id);
                              }}
                              style={styles.secondaryButtonSmall}
                            >
                              Modify
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deactivateUser(user.id);
                              }}
                              style={styles.dangerButton}
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#111315",
    color: "#ffffff",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },

  topbar: {
    height: 52,
    background: "#1b1d20",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
  },

  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  headerLogo: {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 4,
  },

  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  topbarText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  topInfoPill: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "#1f2c3b",
    border: "1px solid rgba(86,168,255,0.18)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },

  topInfoSuccess: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(45,143,82,0.18)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },

  topInfoDanger: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(210,77,87,0.18)",
    border: "1px solid rgba(210,77,87,0.28)",
    color: "#f08b8b",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },

  userPill: {
    height: 34,
    padding: "0 14px",
    borderRadius: 6,
    background: "#2d8f52",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "calc(100vh - 52px)",
  },

  sidebar: {
    background: "#141618",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  sidebarHeader: {
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  sidebarTitle: {
    fontSize: 12,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "0.9px",
  },

  sidebarSub: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.56)",
  },

  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  navItemActive: {
    padding: "10px 12px",
    background: "#1b1e22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: 600,
  },

  navItem: {
    padding: "10px 12px",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    borderRadius: 6,
  },

  statusCard: {
    marginTop: "auto",
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14,
  },

  statusTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.84)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 10,
  },

  statusDotGreen: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block",
  },

  statusDotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block",
  },

  statusDotBlue: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block",
  },

  main: {
    padding: 20,
    background: "#111315",
  },

  headerPanel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  kicker: {
    fontSize: 11,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: 10,
  },

  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },

  pageSub: {
    margin: "8px 0 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 1.6,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  secondaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButtonSmall: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryButtonFull: {
    height: 42,
    width: "100%",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    gridColumn: "1 / span 4",
  },

  metricsRow: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  metricCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 16,
  },

  metricLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.8fr",
    gap: 18,
    marginTop: 18,
  },

  panel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18,
  },

  panelHeader: {
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  panelSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.4fr 1fr 1fr",
    gap: 12,
  },

  input: {
    width: "100%",
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "0 12px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
  },

  select: {
    width: "100%",
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "0 12px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
  },

  summaryBox: {
    marginTop: 16,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 14,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },

  message: {
    marginTop: 12,
    fontSize: 13,
  },

  tableHeaderBar: {
    padding: 18,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "#17191d",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
  },

  th: {
    textAlign: "left",
    padding: "14px 18px",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
    background: "#1b1e22",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
  },

  td: {
    padding: "16px 18px",
    fontSize: 14,
    color: "#ffffff",
    verticalAlign: "middle",
  },

  tdMuted: {
    padding: "16px 18px",
    fontSize: 14,
    color: "rgba(255,255,255,0.62)",
    verticalAlign: "middle",
  },

  emptyCell: {
    padding: 28,
    textAlign: "center" as const,
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
  },

  userName: {
    fontWeight: 600,
  },

  roleAdmin: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
  },

  roleUser: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: 700,
  },

  badgeActive: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 12,
    fontWeight: 700,
  },

  badgeLocked: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.18)",
    color: "#e06a6a",
    fontSize: 12,
    fontWeight: 700,
  },

  badgeDeactivated: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(120,120,120,0.18)",
    color: "#c2c2c2",
    fontSize: 12,
    fontWeight: 700,
  },

  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  warningButton: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    border: "none",
    background: "#8d6a1d",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  unlockButton: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  dangerButton: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    border: "none",
    background: "#b53d4a",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
};
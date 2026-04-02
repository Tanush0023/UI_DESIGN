"use client";

import React, { useEffect, useMemo, useState } from "react";

type PatientStatus = "Active" | "Inactive";
type Gender = "Female" | "Male" | "Other";
type MedicareStatus = "Verified" | "Pending" | "Failed";
type YesNo = "Yes" | "No";
type PreStudyFormStatus = "Completed" | "Pending" | "Not Sent";
type SmsNotification = "Enabled" | "Disabled";

type Patient = {
  id: number;
  mrn: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: PatientStatus;
  lastUpdated: string;
  medicareNumber: string;
  medicareExpiry: string;
  medicareStatus: MedicareStatus;
  referralLinked: YesNo;
  referralSource: string;
  preStudyFormStatus: PreStudyFormStatus;
  smsNotification: SmsNotification;
  notes: string;
};

type AuditEntry = {
  id: number;
  patientId: number;
  timestamp: string;
  user: string;
  action: string;
  field: string;
  before: string;
  after: string;
};

const patientsSeed: Patient[] = [
  {
    id: 1,
    mrn: "MRN-10248",
    patientId: "PT-000124",
    firstName: "Susan",
    lastName: "Hall",
    dob: "1960-04-12",
    gender: "Female",
    phone: "0412 555 901",
    email: "susan.hall@email.com",
    address: "43 Arpenter Drive, Baldivis WA 6171",
    emergencyContact: "David Hall",
    emergencyPhone: "0412 111 222",
    status: "Active",
    lastUpdated: "2026-03-26 14:22",
    medicareNumber: "2123 45678 1",
    medicareExpiry: "2027-08",
    medicareStatus: "Verified",
    referralLinked: "Yes",
    referralSource: "Dr Helen Morris",
    preStudyFormStatus: "Completed",
    smsNotification: "Enabled",
    notes: "Prefers morning appointments. Requires SMS reminder.",
  },
  {
    id: 2,
    mrn: "MRN-10491",
    patientId: "PT-000191",
    firstName: "Robert",
    lastName: "Lang",
    dob: "1981-08-09",
    gender: "Male",
    phone: "0400 100 200",
    email: "robert.lang@email.com",
    address: "9 Winton Street, Perth WA 6000",
    emergencyContact: "Nina Lang",
    emergencyPhone: "0400 200 300",
    status: "Active",
    lastUpdated: "2026-03-25 11:08",
    medicareNumber: "4456 90871 2",
    medicareExpiry: "2026-11",
    medicareStatus: "Pending",
    referralLinked: "Yes",
    referralSource: "Digital Referral",
    preStudyFormStatus: "Pending",
    smsNotification: "Enabled",
    notes: "Booked for follow-up imaging.",
  },
  {
    id: 3,
    mrn: "MRN-10877",
    patientId: "PT-000237",
    firstName: "Amy",
    lastName: "Song",
    dob: "1992-01-17",
    gender: "Female",
    phone: "0422 909 808",
    email: "amy.song@email.com",
    address: "72 Greenhill Ave, Fremantle WA 6160",
    emergencyContact: "J. Song",
    emergencyPhone: "0422 111 444",
    status: "Inactive",
    lastUpdated: "2026-03-24 09:47",
    medicareNumber: "7788 32019 4",
    medicareExpiry: "2025-12",
    medicareStatus: "Failed",
    referralLinked: "No",
    referralSource: "Not linked",
    preStudyFormStatus: "Not Sent",
    smsNotification: "Disabled",
    notes: "Insurance details pending.",
  },
];

const auditSeed: AuditEntry[] = [
  {
    id: 1,
    patientId: 1,
    timestamp: "2026-03-26 14:22",
    user: "Booking User",
    action: "Updated mobile number",
    field: "phone",
    before: "0412 555 900",
    after: "0412 555 901",
  },
  {
    id: 2,
    patientId: 1,
    timestamp: "2026-03-25 16:05",
    user: "Registration User",
    action: "Updated address",
    field: "address",
    before: "41 Arpenter Drive, Baldivis WA 6171",
    after: "43 Arpenter Drive, Baldivis WA 6171",
  },
  {
    id: 3,
    patientId: 1,
    timestamp: "2026-03-24 10:18",
    user: "System",
    action: "Profile created",
    field: "-",
    before: "-",
    after: "-",
  },
  {
    id: 4,
    patientId: 2,
    timestamp: "2026-03-25 11:08",
    user: "Booking User",
    action: "Updated patient notes",
    field: "notes",
    before: "Booked for imaging.",
    after: "Booked for follow-up imaging.",
  },
  {
    id: 5,
    patientId: 3,
    timestamp: "2026-03-24 09:47",
    user: "Registration User",
    action: "Changed status",
    field: "status",
    before: "Active",
    after: "Inactive",
  },
];

type EditablePatientField =
  | "firstName"
  | "lastName"
  | "dob"
  | "gender"
  | "phone"
  | "email"
  | "address"
  | "emergencyContact"
  | "emergencyPhone"
  | "status"
  | "medicareNumber"
  | "medicareExpiry"
  | "medicareStatus"
  | "referralLinked"
  | "referralSource"
  | "preStudyFormStatus"
  | "smsNotification"
  | "notes";

export default function PatientProfilePage() {
  const [patients, setPatients] = useState<Patient[]>(patientsSeed);
  const [audits, setAudits] = useState<AuditEntry[]>(auditSeed);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [message, setMessage] = useState("");

  const selectedPatient =
    patients.find((patient) => patient.id === selectedId) ?? patients[0];

  const [form, setForm] = useState<Patient>(selectedPatient);

  useEffect(() => {
    setForm(selectedPatient);
    setMessage("");
  }, [selectedPatient]);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((patient) => {
      const text =
        `${patient.firstName} ${patient.lastName} ${patient.mrn} ${patient.patientId} ${patient.phone} ${patient.email}`.toLowerCase();
      return text.includes(q);
    });
  }, [patients, search]);

  const patientAudits = useMemo(() => {
    return audits
      .filter((entry) => entry.patientId === selectedId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [audits, selectedId]);

  const handleChange = <K extends EditablePatientField>(
    field: K,
    value: Patient[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const oldPatient = patients.find((p) => p.id === selectedId);
    if (!oldPatient) return;

    const trackedFields: EditablePatientField[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "emergencyContact",
      "emergencyPhone",
      "status",
      "medicareNumber",
      "medicareExpiry",
      "medicareStatus",
      "referralLinked",
      "referralSource",
      "preStudyFormStatus",
      "smsNotification",
      "notes",
    ];

    const changedFields = trackedFields.filter(
      (field) => String(oldPatient[field] || "") !== String(form[field] || "")
    );

    const now = "2026-03-27 09:30";

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedId
          ? {
              ...form,
              lastUpdated: now,
            }
          : patient
      )
    );

    if (changedFields.length > 0) {
      const newAuditEntries: AuditEntry[] = changedFields.map((field, index) => ({
        id: Date.now() + index,
        patientId: selectedId,
        timestamp: now,
        user: "Registration User",
        action: `Updated ${field}`,
        field,
        before: String(oldPatient[field] || "-"),
        after: String(form[field] || "-"),
      }));

      setAudits((prev) => [...newAuditEntries, ...prev]);
      setMessage("Patient profile updated successfully.");
    } else {
      setMessage("No changes detected.");
    }
  };

  const activeCount = patients.filter((p) => p.status === "Active").length;
  const inactiveCount = patients.filter((p) => p.status === "Inactive").length;

  const medicareTone =
    selectedPatient.medicareStatus === "Verified"
      ? styles.topInfoSuccess
      : selectedPatient.medicareStatus === "Pending"
      ? styles.topInfoWarning
      : styles.topInfoDanger;

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>Patient Profile Management</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topInfoPill}>
            Patient ID: {selectedPatient.patientId}
          </div>
          <div style={medicareTone}>
            Medicare: {selectedPatient.medicareStatus}
          </div>
          <div style={styles.topInfoPill}>
            Referral: {selectedPatient.referralLinked}
          </div>
          <div style={styles.topInfoPill}>
            Form: {selectedPatient.preStudyFormStatus}
          </div>
          <div style={styles.userPill}>
            SMS: {selectedPatient.smsNotification}
          </div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>REGISTRATION</div>
            <div style={styles.sidebarSub}>
              Profile view, update, and audit visibility
            </div>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Patient Search</div>
            <input
              style={styles.input}
              placeholder="Search MRN, patient ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.patientList}>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedId(patient.id)}
                style={
                  selectedId === patient.id
                    ? styles.patientItemActive
                    : styles.patientItem
                }
              >
                <div style={styles.patientName}>
                  {patient.firstName} {patient.lastName}
                </div>
                <div style={styles.patientMeta}>{patient.patientId}</div>
                <div style={styles.patientMeta}>{patient.mrn}</div>
                <div style={styles.patientMeta}>{patient.phone}</div>
              </div>
            ))}
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>Overview</div>
            <div style={styles.statusRow}>
              <span style={styles.dotGreen} />
              <span>{activeCount} Active Patients</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotRed} />
              <span>{inactiveCount} Inactive Patients</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotBlue} />
              <span>{patientAudits.length} Audit Entries Visible</span>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>PATIENT REGISTRATION</div>
              <h1 style={styles.pageTitle}>Patient Profile Management</h1>
              <p style={styles.pageSub}>
                View and update patient profile information, referral linkage,
                Medicare details, onboarding status, and audit visibility.
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
              <div style={styles.metricLabel}>Selected MRN</div>
              <div style={styles.metricValueSmall}>{selectedPatient.mrn}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Status</div>
              <div style={styles.metricValueSmall}>{selectedPatient.status}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Last Updated</div>
              <div style={styles.metricValueSmall}>
                {selectedPatient.lastUpdated}
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Audit Count</div>
              <div style={styles.metricValue}>{patientAudits.length}</div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Patient Profile</div>
                  <div style={styles.panelSub}>
                    View and update demographic, referral, and registration
                    details.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={styles.formGrid}>
                  <input
                    style={styles.input}
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="First Name"
                  />
                  <input
                    style={styles.input}
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Last Name"
                  />
                  <input
                    style={styles.input}
                    value={form.patientId}
                    disabled
                    placeholder="Patient ID"
                  />
                  <input
                    style={styles.input}
                    value={form.mrn}
                    disabled
                    placeholder="MRN"
                  />
                  <input
                    style={styles.input}
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="DOB"
                  />
                  <select
                    style={styles.select}
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value as Gender)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Phone"
                  />
                  <input
                    style={styles.input}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Email"
                  />
                  <input
                    style={{ ...styles.input, gridColumn: "1 / span 2" }}
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Address"
                  />
                  <input
                    style={styles.input}
                    value={form.emergencyContact}
                    onChange={(e) =>
                      handleChange("emergencyContact", e.target.value)
                    }
                    placeholder="Emergency Contact"
                  />
                  <input
                    style={styles.input}
                    value={form.emergencyPhone}
                    onChange={(e) =>
                      handleChange("emergencyPhone", e.target.value)
                    }
                    placeholder="Emergency Phone"
                  />
                  <select
                    style={styles.select}
                    value={form.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value as PatientStatus)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <input
                    style={styles.input}
                    value={form.medicareNumber}
                    onChange={(e) =>
                      handleChange("medicareNumber", e.target.value)
                    }
                    placeholder="Medicare Number"
                  />
                  <input
                    style={styles.input}
                    value={form.medicareExpiry}
                    onChange={(e) =>
                      handleChange("medicareExpiry", e.target.value)
                    }
                    placeholder="Medicare Expiry"
                  />
                  <select
                    style={styles.select}
                    value={form.medicareStatus}
                    onChange={(e) =>
                      handleChange(
                        "medicareStatus",
                        e.target.value as MedicareStatus
                      )
                    }
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <select
                    style={styles.select}
                    value={form.referralLinked}
                    onChange={(e) =>
                      handleChange("referralLinked", e.target.value as YesNo)
                    }
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <input
                    style={styles.input}
                    value={form.referralSource}
                    onChange={(e) =>
                      handleChange("referralSource", e.target.value)
                    }
                    placeholder="Referral Source"
                  />
                  <select
                    style={styles.select}
                    value={form.preStudyFormStatus}
                    onChange={(e) =>
                      handleChange(
                        "preStudyFormStatus",
                        e.target.value as PreStudyFormStatus
                      )
                    }
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Not Sent">Not Sent</option>
                  </select>
                  <select
                    style={styles.select}
                    value={form.smsNotification}
                    onChange={(e) =>
                      handleChange(
                        "smsNotification",
                        e.target.value as SmsNotification
                      )
                    }
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                  </select>

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Patient notes"
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.secondaryButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Profile
                  </button>
                </div>
              </form>

              {message ? (
                <div
                  style={{
                    ...styles.message,
                    color: message.includes("successfully")
                      ? "#53c27a"
                      : "rgba(255,255,255,0.62)",
                  }}
                >
                  {message}
                </div>
              ) : null}
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Profile Summary</div>
                  <div style={styles.panelSub}>
                    Current visibility of patient identity and onboarding
                    status.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Full Name</span>
                  <strong>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Patient ID</span>
                  <strong>{selectedPatient.patientId}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>MRN</span>
                  <strong>{selectedPatient.mrn}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Date of Birth</span>
                  <strong>{selectedPatient.dob}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Gender</span>
                  <strong>{selectedPatient.gender}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Medicare</span>
                  <strong>{selectedPatient.medicareStatus}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Referral Linked</span>
                  <strong>{selectedPatient.referralLinked}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Pre-Study Form</span>
                  <strong>{selectedPatient.preStudyFormStatus}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>SMS Notification</span>
                  <strong>{selectedPatient.smsNotification}</strong>
                </div>
              </div>
            </section>
          </div>

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
                <div style={styles.panelTitle}>Audit Visibility</div>
                <div style={styles.panelSub}>
                  Full field-level update history for the selected patient.
                </div>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Field</th>
                    <th style={styles.th}>Before</th>
                    <th style={styles.th}>After</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAudits.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={styles.emptyCell}>
                        No audit entries available.
                      </td>
                    </tr>
                  ) : (
                    patientAudits.map((entry) => (
                      <tr key={entry.id} style={styles.tr}>
                        <td style={styles.tdMuted}>{entry.timestamp}</td>
                        <td style={styles.td}>{entry.user}</td>
                        <td style={styles.td}>{entry.action}</td>
                        <td style={styles.td}>
                          <span style={styles.badgeField}>{entry.field}</span>
                        </td>
                        <td style={styles.tdMuted}>{entry.before}</td>
                        <td style={styles.td}>{entry.after}</td>
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

  topInfoWarning: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(196,145,49,0.18)",
    border: "1px solid rgba(196,145,49,0.28)",
    color: "#f2cb74",
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
    gap: 18,
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

  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
  },

  patientList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },

  patientItem: {
    padding: "12px",
    background: "#17191d",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  patientItemActive: {
    padding: "12px",
    background: "#1b1e22",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(86,168,255,0.22)",
  },

  patientName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
  },

  patientMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.58)",
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

  textarea: {
    width: "100%",
    minHeight: 110,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "12px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
    resize: "vertical",
    fontFamily: "inherit",
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

  dotGreen: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block",
  },

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block",
  },

  dotBlue: {
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

  metricValueSmall: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
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
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },

  message: {
    marginTop: 14,
    fontSize: 13,
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
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
  },

  badgeField: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
  },
};
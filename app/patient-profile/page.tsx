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
    notes: "Prefers morning appointments. Requires SMS reminder."
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
    notes: "Booked for follow-up imaging."
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
    notes: "Insurance details pending."
  }
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
    after: "0412 555 901"
  },
  {
    id: 2,
    patientId: 1,
    timestamp: "2026-03-25 16:05",
    user: "Registration User",
    action: "Updated address",
    field: "address",
    before: "41 Arpenter Drive, Baldivis WA 6171",
    after: "43 Arpenter Drive, Baldivis WA 6171"
  },
  {
    id: 3,
    patientId: 1,
    timestamp: "2026-03-24 10:18",
    user: "System",
    action: "Profile created",
    field: "-",
    before: "-",
    after: "-"
  },
  {
    id: 4,
    patientId: 2,
    timestamp: "2026-03-25 11:08",
    user: "Booking User",
    action: "Updated patient notes",
    field: "notes",
    before: "Booked for imaging.",
    after: "Booked for follow-up imaging."
  },
  {
    id: 5,
    patientId: 3,
    timestamp: "2026-03-24 09:47",
    user: "Registration User",
    action: "Changed status",
    field: "status",
    before: "Active",
    after: "Inactive"
  }
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
      [field]: value
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
      "notes"
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
              lastUpdated: now
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
        after: String(form[field] || "-")
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
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          PATIENT PROFILE • ACTIVE {activeCount} • INACTIVE {inactiveCount} • AUDIT {patientAudits.length}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>PATIENT PROFILE</div>
              <div style={styles.title}>Compact Profile Management</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>ID: {selectedPatient.patientId}</div>
            <div style={medicareTone}>Medicare: {selectedPatient.medicareStatus}</div>
            <div style={styles.topInfoPill}>Referral: {selectedPatient.referralLinked}</div>
            <div style={styles.topInfoPill}>Form: {selectedPatient.preStudyFormStatus}</div>
            <button style={styles.ghostButton}>Export</button>
            <button style={styles.primaryButton}>Authorise</button>
          </div>
        </div>

        {message ? (
          <div
            style={{
              ...styles.messageBanner,
              background: message.includes("successfully")
                ? "rgba(45,143,82,0.14)"
                : "rgba(92,118,166,0.14)",
              color: message.includes("successfully") ? "#7fd19a" : "#d4d8de",
              border: message.includes("successfully")
                ? "1px solid rgba(45,143,82,0.28)"
                : "1px solid rgba(92,118,166,0.28)"
            }}
          >
            {message}
          </div>
        ) : null}

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>MRN</div>
            <div style={styles.metricValueSmall}>{selectedPatient.mrn}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Status</div>
            <div style={styles.metricValueSmall}>{selectedPatient.status}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Last Updated</div>
            <div style={styles.metricValueSmall}>{selectedPatient.lastUpdated}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Audit Count</div>
            <div style={styles.metricValueSmall}>{patientAudits.length}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <aside style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Patient Search</div>
                <div style={styles.panelSub}>Select profile quickly</div>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Search</div>
              <input
                style={styles.input}
                placeholder="MRN, patient ID, name..."
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
                <span>{patientAudits.length} Audit Entries</span>
              </div>
            </div>
          </aside>

          <section style={styles.centerArea}>
            <div style={styles.compactStack}>
              <form onSubmit={handleSave} style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Patient Profile</div>
                    <div style={styles.panelSub}>
                      Demographic, referral, Medicare, and onboarding details
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid4}>
                  <div>
                    <label style={styles.label}>First Name</label>
                    <input
                      style={styles.input}
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Last Name</label>
                    <input
                      style={styles.input}
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Patient ID</label>
                    <input style={styles.input} value={form.patientId} disabled />
                  </div>

                  <div>
                    <label style={styles.label}>MRN</label>
                    <input style={styles.input} value={form.mrn} disabled />
                  </div>

                  <div>
                    <label style={styles.label}>DOB</label>
                    <input
                      style={styles.input}
                      value={form.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Gender</label>
                    <select
                      style={styles.select}
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value as Gender)}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Phone</label>
                    <input
                      style={styles.input}
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Email</label>
                    <input
                      style={styles.input}
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Address</label>
                    <input
                      style={styles.input}
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Emergency Contact</label>
                    <input
                      style={styles.input}
                      value={form.emergencyContact}
                      onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Emergency Phone</label>
                    <input
                      style={styles.input}
                      value={form.emergencyPhone}
                      onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Status</label>
                    <select
                      style={styles.select}
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value as PatientStatus)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Medicare Number</label>
                    <input
                      style={styles.input}
                      value={form.medicareNumber}
                      onChange={(e) => handleChange("medicareNumber", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Medicare Expiry</label>
                    <input
                      style={styles.input}
                      value={form.medicareExpiry}
                      onChange={(e) => handleChange("medicareExpiry", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Medicare Status</label>
                    <select
                      style={styles.select}
                      value={form.medicareStatus}
                      onChange={(e) =>
                        handleChange("medicareStatus", e.target.value as MedicareStatus)
                      }
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Referral Linked</label>
                    <select
                      style={styles.select}
                      value={form.referralLinked}
                      onChange={(e) => handleChange("referralLinked", e.target.value as YesNo)}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Referral Source</label>
                    <input
                      style={styles.input}
                      value={form.referralSource}
                      onChange={(e) => handleChange("referralSource", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Pre-Study Form</label>
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
                  </div>

                  <div>
                    <label style={styles.label}>SMS Notification</label>
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
                  </div>

                  <div style={{ gridColumn: "span 4" }}>
                    <label style={styles.label}>Notes</label>
                    <textarea
                      style={styles.textarea}
                      value={form.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.ghostButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Profile
                  </button>
                </div>
              </form>

              <section style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Audit Visibility</div>
                    <div style={styles.panelSub}>
                      Field-level profile change history
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
            </div>
          </section>

          <aside style={styles.rightRail}>
            <section style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Profile Summary</div>
                  <div style={styles.panelSub}>
                    Current patient identity and onboarding visibility
                  </div>
                </div>
              </div>

              <div style={styles.summaryBoxCompact}>
                <div style={styles.summaryRowMini}>
                  <span>Full Name</span>
                  <strong>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Patient ID</span>
                  <strong>{selectedPatient.patientId}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>MRN</span>
                  <strong>{selectedPatient.mrn}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>DOB</span>
                  <strong>{selectedPatient.dob}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Gender</span>
                  <strong>{selectedPatient.gender}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Medicare</span>
                  <strong>{selectedPatient.medicareStatus}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Referral</span>
                  <strong>{selectedPatient.referralLinked}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Pre-Study Form</span>
                  <strong>{selectedPatient.preStudyFormStatus}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>SMS</span>
                  <strong>{selectedPatient.smsNotification}</strong>
                </div>
              </div>
            </section>
          </aside>
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
    overflowX: "hidden",
    overflowY: "auto"
  },

  topStrip: {
    height: 28,
    background: "#8d0d46",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    position: "sticky",
    top: 0,
    zIndex: 20
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
    marginBottom: 8,
    position: "sticky",
    top: 36,
    zIndex: 15
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
    alignItems: "center",
    flexWrap: "wrap"
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

  topInfoPill: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "#0d1d35",
    border: "1px solid rgba(54,112,190,0.28)",
    color: "#59b7ff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoSuccess: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.16)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoWarning: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(196,145,49,0.16)",
    border: "1px solid rgba(196,145,49,0.28)",
    color: "#f2cb74",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoDanger: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.16)",
    border: "1px solid rgba(210,77,87,0.28)",
    color: "#f08b8b",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  messageBanner: {
    marginBottom: 8,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700
  },

  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    marginBottom: 8
  },

  metricCard: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 12,
    background: "#020d1f",
    padding: "8px 10px"
  },

  metricLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 3
  },

  metricValueSmall: {
    fontSize: 12,
    fontWeight: 800
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "0.75fr 1.8fr 0.85fr",
    gap: 8,
    alignItems: "start"
  },

  leftRail: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignSelf: "start",
    position: "sticky",
    top: 88
  },

  centerArea: {
    minWidth: 0
  },

  rightRail: {
    minWidth: 0
  },

  compactStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  panelCompact: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8
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

  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  filterLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.72)"
  },

  patientList: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },

  patientItem: {
    padding: "7px 8px",
    background: "#071427",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(54,112,190,0.18)"
  },

  patientItemActive: {
    padding: "7px 8px",
    background: "#0b213f",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(26,154,255,0.45)"
  },

  patientName: {
    fontSize: 11,
    fontWeight: 800,
    color: "#ffffff"
  },

  patientMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.58)"
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

  textarea: {
    width: "100%",
    minHeight: 56,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "8px",
    fontSize: 11,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },

  formGrid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 6
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 8
  },

  statusCard: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  statusTitle: {
    fontSize: 10,
    fontWeight: 800,
    marginBottom: 4
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 7
  },

  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block"
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
  },

  summaryBoxCompact: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  summaryRowMini: {
    display: "flex",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 0",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)"
  },

  tableWrap: {
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760
  },

  th: {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(255,255,255,0.82)",
    background: "#071427",
    borderBottom: "1px solid rgba(54,112,190,0.18)"
  },

  tr: {
    borderBottom: "1px solid rgba(54,112,190,0.12)"
  },

  td: {
    padding: "8px 10px",
    fontSize: 10,
    color: "#ffffff",
    verticalAlign: "middle"
  },

  tdMuted: {
    padding: "8px 10px",
    fontSize: 10,
    color: "rgba(255,255,255,0.62)",
    verticalAlign: "middle"
  },

  emptyCell: {
    padding: 16,
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 10
  },

  badgeField: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 9,
    fontWeight: 700
  }
};
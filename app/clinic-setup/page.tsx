"use client";

import React, { useEffect, useMemo, useState } from "react";

type ClinicStatus = "Active" | "Inactive";

type Resource = {
  id: number;
  name: string;
  type: string;
  status: ClinicStatus;
};

type Hours = {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
};

type Clinic = {
  id: number;
  name: string;
  code: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  status: ClinicStatus;
  bookingEnabled: boolean;
  onlineVisible: boolean;
  notes: string;
  hours: Hours;
  resources: Resource[];
};

const clinicSeed: Clinic[] = [
  {
    id: 1,
    name: "Main Clinic",
    code: "MC-001",
    type: "Radiology",
    phone: "(08) 9123 4500",
    email: "mainclinic@esyris.com",
    address: "21 Central Avenue, Perth WA 6000",
    timezone: "Australia/Perth",
    status: "Active",
    bookingEnabled: true,
    onlineVisible: true,
    notes: "Primary metropolitan clinic with full imaging workflow.",
    hours: {
      mon: "08:00 - 17:00",
      tue: "08:00 - 17:00",
      wed: "08:00 - 17:00",
      thu: "08:00 - 17:00",
      fri: "08:00 - 17:00",
      sat: "09:00 - 13:00",
      sun: "Closed"
    },
    resources: [
      { id: 1, name: "Room 1", type: "Consult Room", status: "Active" },
      { id: 2, name: "CT Scanner", type: "Imaging", status: "Active" },
      { id: 3, name: "Ultrasound Bay", type: "Imaging", status: "Active" }
    ]
  },
  {
    id: 2,
    name: "North Branch",
    code: "NB-014",
    type: "Diagnostic",
    phone: "(08) 9345 7700",
    email: "northbranch@esyris.com",
    address: "89 Northview Drive, Joondalup WA 6027",
    timezone: "Australia/Perth",
    status: "Active",
    bookingEnabled: true,
    onlineVisible: false,
    notes: "Regional overflow clinic with appointment-only availability.",
    hours: {
      mon: "08:30 - 16:30",
      tue: "08:30 - 16:30",
      wed: "08:30 - 16:30",
      thu: "08:30 - 16:30",
      fri: "08:30 - 16:30",
      sat: "Closed",
      sun: "Closed"
    },
    resources: [
      { id: 1, name: "Room A", type: "Consult Room", status: "Active" },
      { id: 2, name: "Ultrasound", type: "Imaging", status: "Inactive" }
    ]
  },
  {
    id: 3,
    name: "South Branch",
    code: "SB-022",
    type: "Specialist",
    phone: "(08) 9555 2200",
    email: "southbranch@esyris.com",
    address: "12 Harbour Road, Fremantle WA 6160",
    timezone: "Australia/Perth",
    status: "Inactive",
    bookingEnabled: false,
    onlineVisible: false,
    notes: "Limited services while clinic fit-out is in progress.",
    hours: {
      mon: "Closed",
      tue: "Closed",
      wed: "10:00 - 15:00",
      thu: "10:00 - 15:00",
      fri: "10:00 - 15:00",
      sat: "Closed",
      sun: "Closed"
    },
    resources: [
      { id: 1, name: "Room S1", type: "Consult Room", status: "Inactive" }
    ]
  }
];

export default function ClinicSetupPage() {
  const [clinics, setClinics] = useState<Clinic[]>(clinicSeed);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const selectedClinic =
    clinics.find((clinic) => clinic.id === selectedId) ?? clinics[0];

  const [form, setForm] = useState<Clinic>(selectedClinic);

  useEffect(() => {
    setForm(JSON.parse(JSON.stringify(selectedClinic)) as Clinic);
    setMessage("");
  }, [selectedClinic]);

  const filteredClinics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clinics;

    return clinics.filter((clinic) => {
      const text =
        `${clinic.name} ${clinic.code} ${clinic.type} ${clinic.address} ${clinic.email}`.toLowerCase();
      return text.includes(q);
    });
  }, [clinics, search]);

  const activeCount = clinics.filter((c) => c.status === "Active").length;
  const inactiveCount = clinics.filter((c) => c.status === "Inactive").length;
  const visibleCount = clinics.filter((c) => c.onlineVisible).length;

  const handleFieldChange = <K extends keyof Clinic>(field: K, value: Clinic[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: keyof Hours, value: string) => {
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const toggleResourceStatus = (resourceId: number) => {
    setForm((prev) => ({
      ...prev,
      resources: prev.resources.map((resource) =>
        resource.id === resourceId
          ? {
              ...resource,
              status: resource.status === "Active" ? "Inactive" : "Active"
            }
          : resource
      )
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setClinics((prev) =>
      prev.map((clinic) => (clinic.id === selectedId ? form : clinic))
    );

    setMessage("Clinic setup updated successfully.");
  };

  const totalResources = form.resources.length;
  const activeResources = form.resources.filter(
    (r) => r.status === "Active"
  ).length;

  const statusStyle =
    selectedClinic.status === "Active"
      ? styles.topInfoSuccess
      : styles.topInfoDanger;

  return (
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          CLINIC SETUP • ACTIVE {activeCount} • INACTIVE {inactiveCount} • ONLINE {visibleCount}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>CLINIC CONFIGURATION</div>
              <div style={styles.title}>Compact Clinic Setup Admin</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>Clinic: {selectedClinic.code}</div>
            <div style={statusStyle}>Status: {selectedClinic.status}</div>
            <div style={styles.topInfoPill}>
              Booking: {selectedClinic.bookingEnabled ? "On" : "Off"}
            </div>
            <div style={styles.topInfoPill}>
              Online: {selectedClinic.onlineVisible ? "Visible" : "Hidden"}
            </div>
            <button style={styles.ghostButton}>Export</button>
            <button style={styles.primaryButton}>Save</button>
          </div>
        </div>

        {message ? <div style={styles.messageBanner}>{message}</div> : null}

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Selected Clinic</div>
            <div style={styles.metricValueSmall}>{selectedClinic.name}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Status</div>
            <div style={styles.metricValueSmall}>{selectedClinic.status}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Resources</div>
            <div style={styles.metricValueSmall}>{totalResources}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Resources</div>
            <div style={styles.metricValueSmall}>{activeResources}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <section style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Clinic Directory</div>
                <div style={styles.panelSub}>Search and switch clinics quickly</div>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Clinic Search</div>
              <input
                style={styles.input}
                placeholder="Search clinic name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={styles.clinicList}>
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => setSelectedId(clinic.id)}
                  style={
                    clinic.id === selectedId
                      ? styles.clinicItemActive
                      : styles.clinicItem
                  }
                >
                  <div style={styles.clinicName}>{clinic.name}</div>
                  <div style={styles.clinicMeta}>{clinic.code}</div>
                  <div style={styles.clinicMeta}>{clinic.type}</div>
                </div>
              ))}
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusTitle}>Overview</div>
              <div style={styles.statusRow}>
                <span style={styles.dotGreen} />
                <span>{activeCount} Active Clinics</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotRed} />
                <span>{inactiveCount} Inactive Clinics</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotBlue} />
                <span>{visibleCount} Online Visible</span>
              </div>
            </div>
          </section>

          <section style={styles.centerArea}>
            <div style={styles.compactStack}>
              <form onSubmit={handleSave} style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Clinic Details</div>
                    <div style={styles.panelSub}>
                      Identity, contact, visibility and operational controls
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid4}>
                  <div>
                    <label style={styles.label}>Clinic Name</label>
                    <input
                      style={styles.input}
                      value={form.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Clinic Code</label>
                    <input
                      style={styles.input}
                      value={form.code}
                      onChange={(e) => handleFieldChange("code", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Clinic Type</label>
                    <input
                      style={styles.input}
                      value={form.type}
                      onChange={(e) => handleFieldChange("type", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Status</label>
                    <select
                      style={styles.select}
                      value={form.status}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value as ClinicStatus)
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Phone</label>
                    <input
                      style={styles.input}
                      value={form.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Email</label>
                    <input
                      style={styles.input}
                      value={form.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Address</label>
                    <input
                      style={styles.input}
                      value={form.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Timezone</label>
                    <input
                      style={styles.input}
                      value={form.timezone}
                      onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    />
                  </div>

                  <div style={styles.toggleBox}>
                    <div style={styles.toggleLabel}>Booking Enabled</div>
                    <button
                      type="button"
                      onClick={() =>
                        handleFieldChange("bookingEnabled", !form.bookingEnabled)
                      }
                      style={
                        form.bookingEnabled
                          ? styles.toggleActive
                          : styles.toggleInactive
                      }
                    >
                      {form.bookingEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div style={styles.toggleBox}>
                    <div style={styles.toggleLabel}>Online Visible</div>
                    <button
                      type="button"
                      onClick={() =>
                        handleFieldChange("onlineVisible", !form.onlineVisible)
                      }
                      style={
                        form.onlineVisible
                          ? styles.toggleActive
                          : styles.toggleInactive
                      }
                    >
                      {form.onlineVisible ? "Visible" : "Hidden"}
                    </button>
                  </div>

                  <div style={{ gridColumn: "span 4" }}>
                    <label style={styles.label}>Notes</label>
                    <textarea
                      style={styles.textarea}
                      value={form.notes}
                      onChange={(e) => handleFieldChange("notes", e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.ghostButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Setup
                  </button>
                </div>
              </form>

              <div style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Operating Hours</div>
                    <div style={styles.panelSub}>
                      Configure clinic opening hours by day
                    </div>
                  </div>
                </div>

                <div style={styles.hoursGrid}>
                  {(Object.entries(form.hours) as [keyof Hours, string][]).map(
                    ([day, value]) => (
                      <React.Fragment key={day}>
                        <div style={styles.hoursLabel}>{day.toUpperCase()}</div>
                        <input
                          style={styles.input}
                          value={value}
                          onChange={(e) => handleHoursChange(day, e.target.value)}
                        />
                      </React.Fragment>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <section style={styles.rightRail}>
            <div style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Setup Summary</div>
                  <div style={styles.panelSub}>
                    Current operational and visibility configuration
                  </div>
                </div>
              </div>

              <div style={styles.summaryBoxCompact}>
                <div style={styles.summaryRowMini}>
                  <span>Clinic Name</span>
                  <strong>{selectedClinic.name}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Clinic Code</span>
                  <strong>{selectedClinic.code}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Status</span>
                  <strong>{selectedClinic.status}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Booking Enabled</span>
                  <strong>{selectedClinic.bookingEnabled ? "Yes" : "No"}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Online Visible</span>
                  <strong>{selectedClinic.onlineVisible ? "Yes" : "No"}</strong>
                </div>
                <div style={styles.summaryRowMini}>
                  <span>Timezone</span>
                  <strong>{selectedClinic.timezone}</strong>
                </div>
              </div>
            </div>

            <div style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Clinic Resources</div>
                  <div style={styles.panelSub}>
                    Manage room and equipment visibility
                  </div>
                </div>
              </div>

              <div style={styles.resourceList}>
                {form.resources.map((resource) => (
                  <div key={resource.id} style={styles.resourceRow}>
                    <div>
                      <div style={styles.resourceTitle}>{resource.name}</div>
                      <div style={styles.resourceMeta}>{resource.type}</div>
                    </div>

                    <div style={styles.resourceActions}>
                      <span
                        style={
                          resource.status === "Active"
                            ? styles.badgeActive
                            : styles.badgeInactive
                        }
                      >
                        {resource.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleResourceStatus(resource.id)}
                        style={
                          resource.status === "Active"
                            ? styles.warningButton
                            : styles.unlockButton
                        }
                      >
                        {resource.status === "Active" ? "Disable" : "Enable"}
                      </button>
                    </div>
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
    fontSize: 11,
    fontWeight: 700,
    background: "rgba(45,143,82,0.14)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a"
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
    gridTemplateColumns: "0.75fr 1.8fr 0.95fr",
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
    display: "flex",
    flexDirection: "column",
    gap: 8,
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

  clinicList: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },

  clinicItem: {
    padding: "7px 8px",
    background: "#071427",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(54,112,190,0.18)"
  },

  clinicItemActive: {
    padding: "7px 8px",
    background: "#0b213f",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(26,154,255,0.45)"
  },

  clinicName: {
    fontSize: 11,
    fontWeight: 800,
    color: "#ffffff"
  },

  clinicMeta: {
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
    minHeight: 52,
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

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
  },

  toggleBox: {
    height: 26,
    background: "#0d1830",
    border: "1px solid rgba(92,118,166,0.35)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px"
  },

  toggleLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)"
  },

  toggleActive: {
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

  toggleInactive: {
    height: 20,
    padding: "0 8px",
    borderRadius: 999,
    border: "none",
    background: "#b53d4a",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer"
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

  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "52px 1fr 52px 1fr",
    gap: 6,
    alignItems: "center"
  },

  hoursLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.78)"
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

  resourceList: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },

  resourceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "8px",
    borderRadius: 10,
    background: "#071427",
    border: "1px solid rgba(54,112,190,0.18)"
  },

  resourceTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: "#ffffff"
  },

  resourceMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.55)"
  },

  resourceActions: {
    display: "flex",
    alignItems: "center",
    gap: 6
  },

  badgeActive: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 9,
    fontWeight: 700
  },

  badgeInactive: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.18)",
    color: "#e06a6a",
    fontSize: 9,
    fontWeight: 700
  },

  warningButton: {
    height: 22,
    padding: "0 8px",
    borderRadius: 8,
    border: "none",
    background: "#8d6a1d",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    cursor: "pointer"
  },

  unlockButton: {
    height: 22,
    padding: "0 8px",
    borderRadius: 8,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    cursor: "pointer"
  }
};
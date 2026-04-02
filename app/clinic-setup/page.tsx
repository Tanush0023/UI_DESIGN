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
      sun: "Closed",
    },
    resources: [
      { id: 1, name: "Room 1", type: "Consult Room", status: "Active" },
      { id: 2, name: "CT Scanner", type: "Imaging", status: "Active" },
      { id: 3, name: "Ultrasound Bay", type: "Imaging", status: "Active" },
    ],
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
      sun: "Closed",
    },
    resources: [
      { id: 1, name: "Room A", type: "Consult Room", status: "Active" },
      { id: 2, name: "Ultrasound", type: "Imaging", status: "Inactive" },
    ],
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
      sun: "Closed",
    },
    resources: [
      { id: 1, name: "Room S1", type: "Consult Room", status: "Inactive" },
    ],
  },
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
      [field]: value,
    }));
  };

  const handleHoursChange = (day: keyof Hours, value: string) => {
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value,
      },
    }));
  };

  const toggleResourceStatus = (resourceId: number) => {
    setForm((prev) => ({
      ...prev,
      resources: prev.resources.map((resource) =>
        resource.id === resourceId
          ? {
              ...resource,
              status: resource.status === "Active" ? "Inactive" : "Active",
            }
          : resource
      ),
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
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>Clinic Setup Admin</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topInfoPill}>Clinic: {selectedClinic.code}</div>
          <div style={statusStyle}>Status: {selectedClinic.status}</div>
          <div style={styles.topInfoPill}>
            Booking: {selectedClinic.bookingEnabled ? "Enabled" : "Disabled"}
          </div>
          <div style={styles.topInfoPill}>
            Online: {selectedClinic.onlineVisible ? "Visible" : "Hidden"}
          </div>
          <div style={styles.userPill}>Admin Console</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>CLINIC SETUP</div>
            <div style={styles.sidebarSub}>Admin configuration screens</div>
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
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>ADMIN CONFIGURATION</div>
              <h1 style={styles.pageTitle}>Clinic Setup Admin Screens</h1>
              <p style={styles.pageSub}>
                Configure clinic identity, operational details, booking
                behaviour, and resource visibility within the EsyRIS admin
                workspace.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button style={styles.secondaryButton} type="button">
                Export
              </button>
              <button style={styles.primaryButton} type="button">
                Authorise
              </button>
            </div>
          </div>

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
              <div style={styles.metricValue}>{totalResources}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Active Resources</div>
              <div style={styles.metricValue}>{activeResources}</div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Clinic Details</div>
                  <div style={styles.panelSub}>
                    Manage clinic profile, operational details, and visibility
                    rules.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={styles.formGrid}>
                  <input
                    style={styles.input}
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Clinic Name"
                  />
                  <input
                    style={styles.input}
                    value={form.code}
                    onChange={(e) => handleFieldChange("code", e.target.value)}
                    placeholder="Clinic Code"
                  />
                  <input
                    style={styles.input}
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    placeholder="Clinic Type"
                  />
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
                  <input
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="Phone"
                  />
                  <input
                    style={styles.input}
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Email"
                  />
                  <input
                    style={{ ...styles.input, gridColumn: "1 / span 2" }}
                    value={form.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="Address"
                  />
                  <input
                    style={styles.input}
                    value={form.timezone}
                    onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    placeholder="Timezone"
                  />

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

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Clinic notes"
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.secondaryButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Setup
                  </button>
                </div>
              </form>

              {message ? <div style={styles.message}>{message}</div> : null}
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Setup Summary</div>
                  <div style={styles.panelSub}>
                    Current operational and visibility configuration.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Clinic Name</span>
                  <strong>{selectedClinic.name}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Clinic Code</span>
                  <strong>{selectedClinic.code}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Status</span>
                  <strong>{selectedClinic.status}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Booking Enabled</span>
                  <strong>{selectedClinic.bookingEnabled ? "Yes" : "No"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Online Visible</span>
                  <strong>{selectedClinic.onlineVisible ? "Yes" : "No"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Timezone</span>
                  <strong>{selectedClinic.timezone}</strong>
                </div>
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Operating Hours</div>
                  <div style={styles.panelSub}>
                    Configure clinic opening hours by day.
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
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Clinic Resources</div>
                  <div style={styles.panelSub}>
                    Review and manage room/resource visibility.
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
            </section>
          </div>
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

  clinicList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },

  clinicItem: {
    padding: "12px",
    background: "#17191d",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  clinicItemActive: {
    padding: "12px",
    background: "#1b1e22",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(86,168,255,0.22)",
  },

  clinicName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
  },

  clinicMeta: {
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

  bottomGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
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
    color: "#53c27a",
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

  toggleBox: {
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },

  toggleLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },

  toggleActive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#2d8f52",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  toggleInactive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#b53d4a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: 12,
    alignItems: "center",
  },

  hoursLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.78)",
  },

  resourceList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  resourceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px",
    borderRadius: 8,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  resourceTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
  },

  resourceMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },

  resourceActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
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

  badgeInactive: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.18)",
    color: "#e06a6a",
    fontSize: 12,
    fontWeight: 700,
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
};
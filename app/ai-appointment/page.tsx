"use client";

import React, { useMemo, useState } from "react";

type Clinic = "Main Clinic" | "North Branch" | "South Branch";
type Resource = "Room 1" | "Room 2" | "CT Scanner" | "Ultrasound";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";
type NotificationMethod = "SMS" | "Email" | "Both";

type Day = {
  key: DayKey;
  label: string;
};

type Appointment = {
  id: number;
  patient: string;
  clinic: Clinic;
  day: DayKey;
  time: string;
  resource: Resource;
  modality: string;
  staff: string;
  clinician: string;
};

type BlockedSlot = {
  clinic: Clinic;
  day: DayKey;
  time: string;
  resource: Resource;
};

type StaffRoster = {
  id: number;
  name: string;
  role: string;
  clinic: Clinic;
  assignedClinics: Clinic[];
  day: DayKey;
  shift: string;
  available: boolean;
  capabilities: string[];
};

type Recommendation = {
  id: number;
  clinic: Clinic;
  day: DayKey;
  dayLabel: string;
  time: string;
  resource: Resource;
  staff: string;
  clinician: string;
  score: number;
  reasons: string[];
};

const days: Day[] = [
  { key: "mon", label: "Mon 18" },
  { key: "tue", label: "Tue 19" },
  { key: "wed", label: "Wed 20" },
  { key: "thu", label: "Thu 21" },
  { key: "fri", label: "Fri 22" }
];

const clinics: Clinic[] = ["Main Clinic", "North Branch", "South Branch"];
const resources: Resource[] = ["Room 1", "Room 2", "CT Scanner", "Ultrasound"];
const modalities = ["Consult", "CT", "Ultrasound", "Review", "Follow-up"];
const notificationMethods: NotificationMethod[] = ["SMS", "Email", "Both"];

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30"
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "Susan Hall",
    clinic: "Main Clinic",
    day: "mon",
    time: "09:00",
    resource: "Room 1",
    modality: "Consult",
    staff: "Sarah Miles",
    clinician: "Dr Olivia Kent"
  },
  {
    id: 2,
    patient: "Amy Song",
    clinic: "Main Clinic",
    day: "mon",
    time: "10:30",
    resource: "CT Scanner",
    modality: "CT",
    staff: "Sarah Miles",
    clinician: "Dr Marcus Lee"
  },
  {
    id: 3,
    patient: "Robert Lang",
    clinic: "North Branch",
    day: "tue",
    time: "11:00",
    resource: "Ultrasound",
    modality: "Ultrasound",
    staff: "Nina Foster",
    clinician: "Nina Foster"
  },
  {
    id: 4,
    patient: "Jane Willis",
    clinic: "South Branch",
    day: "wed",
    time: "13:30",
    resource: "Room 2",
    modality: "Review",
    staff: "Ethan Cole",
    clinician: "Ethan Cole"
  }
];

const blockedSlots: BlockedSlot[] = [
  { clinic: "Main Clinic", day: "mon", time: "12:00", resource: "Room 1" },
  { clinic: "North Branch", day: "tue", time: "14:00", resource: "Ultrasound" },
  { clinic: "South Branch", day: "wed", time: "10:00", resource: "Room 2" },
  { clinic: "Main Clinic", day: "thu", time: "08:30", resource: "CT Scanner" }
];

const staffRoster: StaffRoster[] = [
  {
    id: 1,
    name: "Sarah Miles",
    role: "Receptionist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic", "North Branch"],
    day: "mon",
    shift: "08:00 - 16:00",
    available: true,
    capabilities: ["Consult", "Review", "Follow-up"]
  },
  {
    id: 2,
    name: "Dr Olivia Kent",
    role: "Radiologist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic"],
    day: "mon",
    shift: "08:00 - 17:00",
    available: true,
    capabilities: ["Consult", "Review", "Follow-up"]
  },
  {
    id: 3,
    name: "Dr Marcus Lee",
    role: "Radiologist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic"],
    day: "thu",
    shift: "09:00 - 16:00",
    available: true,
    capabilities: ["CT", "Review"]
  },
  {
    id: 4,
    name: "Nina Foster",
    role: "Technical Staff",
    clinic: "North Branch",
    assignedClinics: ["North Branch"],
    day: "tue",
    shift: "08:00 - 15:00",
    available: true,
    capabilities: ["Ultrasound"]
  },
  {
    id: 5,
    name: "Ethan Cole",
    role: "Technical Staff",
    clinic: "South Branch",
    assignedClinics: ["South Branch", "Main Clinic"],
    day: "wed",
    shift: "09:00 - 15:00",
    available: true,
    capabilities: ["Review", "Consult"]
  },
  {
    id: 6,
    name: "Lara White",
    role: "Receptionist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic", "South Branch"],
    day: "fri",
    shift: "08:30 - 16:30",
    available: true,
    capabilities: ["Consult", "Follow-up"]
  }
];

const modalityResourceMap: Record<string, Resource[]> = {
  Consult: ["Room 1", "Room 2"],
  Review: ["Room 2", "Room 1"],
  "Follow-up": ["Room 1", "Room 2"],
  CT: ["CT Scanner"],
  Ultrasound: ["Ultrasound"]
};

function getDayLabel(day: DayKey) {
  return days.find((d) => d.key === day)?.label || day;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function AIAttemptRecommendationPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [patientName, setPatientName] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic>("Main Clinic");
  const [selectedModality, setSelectedModality] = useState("Consult");
  const [preferredDay, setPreferredDay] = useState<DayKey | "Any">("Any");
  const [preferredTime, setPreferredTime] = useState("Any");
  const [notificationMethod, setNotificationMethod] =
    useState<NotificationMethod>("SMS");
  const [message, setMessage] = useState("");
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);

  const recommendations = useMemo(() => {
    const allowedResources = modalityResourceMap[selectedModality] || ["Room 1"];
    const list: Recommendation[] = [];

    days.forEach((day) => {
      if (preferredDay !== "Any" && day.key !== preferredDay) return;

      allowedResources.forEach((resource) => {
        timeSlots.forEach((time) => {
          const reasons: string[] = [];
          let score = 100;

          const isBlocked = blockedSlots.some(
            (slot) =>
              slot.clinic === selectedClinic &&
              slot.day === day.key &&
              slot.time === time &&
              slot.resource === resource
          );
          if (isBlocked) return;

          const resourceBusy = appointments.some(
            (a) =>
              a.clinic === selectedClinic &&
              a.day === day.key &&
              a.time === time &&
              a.resource === resource
          );
          if (resourceBusy) return;

          const possibleStaff = staffRoster.filter(
            (s) =>
              s.available &&
              (s.clinic === selectedClinic ||
                s.assignedClinics.includes(selectedClinic)) &&
              s.day === day.key &&
              s.capabilities.includes(selectedModality)
          );

          if (possibleStaff.length === 0) return;

          const staffChoice = possibleStaff[0];
          const clinicianChoice =
            possibleStaff.find((s) => s.role === "Radiologist")?.name ||
            staffChoice.name;

          const staffBusy = appointments.some(
            (a) =>
              a.day === day.key &&
              a.time === time &&
              a.staff === staffChoice.name
          );
          if (staffBusy) return;

          const clinicianBusy = appointments.some(
            (a) =>
              a.day === day.key &&
              a.time === time &&
              a.clinician === clinicianChoice
          );
          if (clinicianBusy) return;

          reasons.push("Resource is available");
          reasons.push("Staff and clinician available");

          if (preferredTime !== "Any") {
            const diff = Math.abs(
              timeToMinutes(time) - timeToMinutes(preferredTime)
            );
            if (diff === 0) {
              score += 15;
              reasons.push("Matches preferred time exactly");
            } else if (diff <= 60) {
              score += 6;
              reasons.push("Close to preferred time");
            } else {
              score -= 8;
            }
          }

          const dayItems = appointments
            .filter((a) => a.clinic === selectedClinic && a.day === day.key)
            .sort((a, b) => a.time.localeCompare(b.time));

          if (dayItems.length === 0) {
            score += 8;
            reasons.push("Good clinic capacity on this day");
          } else {
            const nearestGap = Math.min(
              ...dayItems.map((a) =>
                Math.abs(timeToMinutes(a.time) - timeToMinutes(time))
              )
            );

            if (nearestGap >= 60 && nearestGap <= 120) {
              score += 10;
              reasons.push("Efficient slot gap");
            } else if (nearestGap < 30) {
              score -= 10;
              reasons.push("Tight slot spacing");
            }
          }

          if (selectedModality === "CT" && resource === "CT Scanner") {
            score += 8;
            reasons.push("Best-fit machine for CT");
          }

          if (selectedModality === "Ultrasound" && resource === "Ultrasound") {
            score += 8;
            reasons.push("Best-fit room for ultrasound");
          }

          if (
            (selectedModality === "Consult" ||
              selectedModality === "Follow-up" ||
              selectedModality === "Review") &&
            (resource === "Room 1" || resource === "Room 2")
          ) {
            score += 5;
            reasons.push("Suitable consultation room");
          }

          list.push({
            id: Number(`${timeToMinutes(time)}${day.key.length}${resource.length}`),
            clinic: selectedClinic,
            day: day.key,
            dayLabel: day.label,
            time,
            resource,
            staff: staffChoice.name,
            clinician: clinicianChoice,
            score,
            reasons
          });
        });
      });
    });

    return list.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [appointments, preferredDay, preferredTime, selectedClinic, selectedModality]);

  const applyRecommendation = () => {
    const rec = recommendations.find((r) => r.id === selectedRecommendation);
    if (!rec) {
      setMessage("Please select a recommendation first.");
      return;
    }
    if (!patientName.trim()) {
      setMessage("Please enter patient name first.");
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      patient: patientName.trim(),
      clinic: rec.clinic,
      day: rec.day,
      time: rec.time,
      resource: rec.resource,
      modality: selectedModality,
      staff: rec.staff,
      clinician: rec.clinician
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setMessage(
      `Recommended slot applied. Booking created for ${patientName} on ${rec.dayLabel} at ${rec.time}. Notification method: ${notificationMethod}.`
    );
    setPatientName("");
    setSelectedRecommendation(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>AI Appointment Recommendation</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topInfoPill}>Clinic: {selectedClinic}</div>
          <div style={styles.topInfoPill}>Modality: {selectedModality}</div>
          <div style={styles.userPill}>AI Assist</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>AI SCHEDULING</div>
            <div style={styles.sidebarSub}>
              Recommendation engine for best appointment slots
            </div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>How It Scores</div>
            <div style={styles.statusRow}>
              <span style={styles.dotGreen} />
              <span>Resource availability</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotBlue} />
              <span>Staff / clinician availability</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotPurple} />
              <span>Efficient schedule gap</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotRed} />
              <span>Conflict avoidance</span>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>AI-ASSISTED BOOKING</div>
              <h1 style={styles.pageTitle}>AI Appointment Recommendation</h1>
              <p style={styles.pageSub}>
                Suggests the best appointment slots using exam type, clinic
                schedule, machine availability, and staff allocation.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button type="button" style={styles.secondaryButton}>
                Export
              </button>
              <button type="button" style={styles.primaryButton}>
                Review Recommendations
              </button>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Booking Inputs</div>
                  <div style={styles.panelSub}>
                    Enter booking preference details for AI-assisted slot selection.
                  </div>
                </div>
              </div>

              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />

                <select
                  style={styles.select}
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value as Clinic)}
                >
                  {clinics.map((clinic) => (
                    <option key={clinic} value={clinic}>
                      {clinic}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={selectedModality}
                  onChange={(e) => setSelectedModality(e.target.value)}
                >
                  {modalities.map((modality) => (
                    <option key={modality} value={modality}>
                      {modality}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={preferredDay}
                  onChange={(e) =>
                    setPreferredDay(e.target.value as DayKey | "Any")
                  }
                >
                  <option value="Any">Any Day</option>
                  {days.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="Any">Any Time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={notificationMethod}
                  onChange={(e) =>
                    setNotificationMethod(e.target.value as NotificationMethod)
                  }
                >
                  {notificationMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Recommendation Summary</div>
                  <div style={styles.panelSub}>
                    Top ranked AI suggestions based on availability and efficiency.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Total Suggestions</span>
                  <strong>{recommendations.length}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Preferred Day</span>
                  <strong>{preferredDay === "Any" ? "Any Day" : getDayLabel(preferredDay)}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Preferred Time</span>
                  <strong>{preferredTime}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Notification</span>
                  <strong>{notificationMethod}</strong>
                </div>
              </div>
            </section>
          </div>

          <section style={{ ...styles.panel, marginTop: 18 }}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Recommended Slots</div>
                <div style={styles.panelSub}>
                  Best appointment slots ranked by the recommendation engine.
                </div>
              </div>
            </div>

            <div style={styles.recommendationList}>
              {recommendations.length === 0 ? (
                <div style={styles.emptyState}>No suitable recommendations found.</div>
              ) : (
                recommendations.map((rec, index) => (
                  <div
                    key={`${rec.id}-${index}`}
                    style={
                      selectedRecommendation === rec.id
                        ? styles.recommendationItemActive
                        : styles.recommendationItem
                    }
                    onClick={() => setSelectedRecommendation(rec.id)}
                  >
                    <div style={styles.recommendationTop}>
                      <div>
                        <div style={styles.recommendationTitle}>
                          #{index + 1} • {rec.dayLabel} • {rec.time}
                        </div>
                        <div style={styles.recommendationMeta}>
                          {rec.clinic} • {rec.resource}
                        </div>
                        <div style={styles.recommendationMeta}>
                          Staff: {rec.staff} • Clinician: {rec.clinician}
                        </div>
                      </div>

                      <div style={styles.scoreBadge}>Score {rec.score}</div>
                    </div>

                    <div style={styles.reasonWrap}>
                      {rec.reasons.map((reason, i) => (
                        <span key={i} style={styles.reasonBadge}>
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.formActions}>
              <button type="button" style={styles.primaryButton} onClick={applyRecommendation}>
                Apply Recommended Slot
              </button>
            </div>

            {message ? <div style={styles.message}>{message}</div> : null}
          </section>

          <section style={{ ...styles.panel, marginTop: 18 }}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Existing Bookings</div>
                <div style={styles.panelSub}>
                  Current booked appointments used by the AI engine.
                </div>
              </div>
            </div>

            <div style={styles.bookingList}>
              {appointments.map((item) => (
                <div key={item.id} style={styles.bookingRow}>
                  <div>
                    <div style={styles.bookingTitle}>{item.patient}</div>
                    <div style={styles.bookingMeta}>
                      {getDayLabel(item.day)} • {item.time} • {item.modality}
                    </div>
                  </div>
                  <div style={styles.bookingBadge}>{item.resource}</div>
                </div>
              ))}
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
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
  },

  topbar: {
    height: 52,
    background: "#1b1d20",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px"
  },

  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  headerLogo: {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 4
  },

  brand: {
    fontSize: 18,
    fontWeight: 700
  },

  topbarText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)"
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8
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
    alignItems: "center"
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
    alignItems: "center"
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "calc(100vh - 52px)"
  },

  sidebar: {
    background: "#141618",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 18
  },

  sidebarHeader: {
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },

  sidebarTitle: {
    fontSize: 12,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "0.9px"
  },

  sidebarSub: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.56)"
  },

  statusCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14
  },

  statusTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.84)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.7px"
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 10
  },

  dotGreen: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block"
  },

  dotBlue: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotPurple: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  main: {
    padding: 20,
    background: "#111315"
  },

  headerPanel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20
  },

  kicker: {
    fontSize: 11,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: 10
  },

  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700
  },

  pageSub: {
    margin: "8px 0 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 1.6
  },

  headerActions: {
    display: "flex",
    gap: 10
  },

  secondaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  primaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 18,
    marginTop: 18
  },

  panel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18
  },

  panelHeader: {
    marginBottom: 16
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 700
  },

  panelSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)"
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
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
    fontSize: 14
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
    fontSize: 14
  },

  summaryBox: {
    marginTop: 16,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 14
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14
  },

  recommendationList: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  recommendationItem: {
    padding: 14,
    borderRadius: 8,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer"
  },

  recommendationItemActive: {
    padding: 14,
    borderRadius: 8,
    background: "#1b1e22",
    border: "1px solid rgba(86,168,255,0.25)",
    cursor: "pointer"
  },

  recommendationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12
  },

  recommendationTitle: {
    fontSize: 15,
    fontWeight: 700
  },

  recommendationMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.58)"
  },

  scoreBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
    height: "fit-content"
  },

  reasonWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },

  reasonBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 600
  },

  bookingList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },

  bookingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },

  bookingTitle: {
    fontSize: 14,
    fontWeight: 700
  },

  bookingMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.58)"
  },

  bookingBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700
  },

  emptyState: {
    padding: 18,
    borderRadius: 8,
    background: "#121417",
    color: "rgba(255,255,255,0.5)",
    fontSize: 14
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 16
  },

  message: {
    marginTop: 14,
    fontSize: 13,
    color: "#53c27a"
  }
};
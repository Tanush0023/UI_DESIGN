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

          reasons.push("Resource available");
          reasons.push("Staff and clinician available");

          if (preferredTime !== "Any") {
            const diff = Math.abs(
              timeToMinutes(time) - timeToMinutes(preferredTime)
            );
            if (diff === 0) {
              score += 15;
              reasons.push("Exact preferred time");
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
            reasons.push("Good capacity");
          } else {
            const nearestGap = Math.min(
              ...dayItems.map((a) =>
                Math.abs(timeToMinutes(a.time) - timeToMinutes(time))
              )
            );

            if (nearestGap >= 60 && nearestGap <= 120) {
              score += 10;
              reasons.push("Efficient gap");
            } else if (nearestGap < 30) {
              score -= 10;
              reasons.push("Tight spacing");
            }
          }

          if (selectedModality === "CT" && resource === "CT Scanner") {
            score += 8;
            reasons.push("Best CT machine");
          }

          if (selectedModality === "Ultrasound" && resource === "Ultrasound") {
            score += 8;
            reasons.push("Best ultrasound room");
          }

          if (
            (selectedModality === "Consult" ||
              selectedModality === "Follow-up" ||
              selectedModality === "Review") &&
            (resource === "Room 1" || resource === "Room 2")
          ) {
            score += 5;
            reasons.push("Suitable consult room");
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
      `Booking created for ${patientName} on ${rec.dayLabel} at ${rec.time}. Notification: ${notificationMethod}.`
    );
    setPatientName("");
    setSelectedRecommendation(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          AI APPOINTMENT • CLINIC {selectedClinic.toUpperCase()} • MODALITY {selectedModality.toUpperCase()} • SUGGESTIONS {recommendations.length}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>AI-ASSISTED BOOKING</div>
              <div style={styles.title}>Compact Appointment Recommendation</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>Clinic: {selectedClinic}</div>
            <div style={styles.topInfoPill}>Modality: {selectedModality}</div>
            <div style={styles.topInfoPill}>Notify: {notificationMethod}</div>
            <button style={styles.ghostButton}>Export</button>
            <button style={styles.primaryButton}>Review</button>
          </div>
        </div>

        {message ? <div style={styles.messageBanner}>{message}</div> : null}

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Suggestions</div>
            <div style={styles.metricValueSmall}>{recommendations.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Clinic</div>
            <div style={styles.metricValueSmall}>{selectedClinic}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Modality</div>
            <div style={styles.metricValueSmall}>{selectedModality}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Bookings</div>
            <div style={styles.metricValueSmall}>{appointments.length}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <aside style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Scoring Logic</div>
                <div style={styles.panelSub}>How recommendations are ranked</div>
              </div>
            </div>

            <div style={styles.statusCard}>
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
                <span>Efficient scheduling gap</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotRed} />
                <span>Conflict avoidance</span>
              </div>
            </div>

            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>Recommendation Goal</div>
              <div style={styles.infoText}>
                Suggest the best slot based on clinic schedule, modality fit,
                resource availability, and operational efficiency.
              </div>
            </div>
          </aside>

          <section style={styles.centerArea}>
            <div style={styles.compactStack}>
              <div style={styles.contentGrid}>
                <section style={styles.panelCompact}>
                  <div style={styles.panelHeaderRow}>
                    <div>
                      <div style={styles.panelTitle}>Booking Inputs</div>
                      <div style={styles.panelSub}>
                        Enter patient and preference details
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGrid3}>
                    <div>
                      <label style={styles.label}>Patient Name</label>
                      <input
                        style={styles.input}
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Patient Name"
                      />
                    </div>

                    <div>
                      <label style={styles.label}>Clinic</label>
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
                    </div>

                    <div>
                      <label style={styles.label}>Modality</label>
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
                    </div>

                    <div>
                      <label style={styles.label}>Preferred Day</label>
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
                    </div>

                    <div>
                      <label style={styles.label}>Preferred Time</label>
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
                    </div>

                    <div>
                      <label style={styles.label}>Notification</label>
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
                  </div>
                </section>

                <section style={styles.panelCompact}>
                  <div style={styles.panelHeaderRow}>
                    <div>
                      <div style={styles.panelTitle}>Recommendation Summary</div>
                      <div style={styles.panelSub}>Top-level suggestion overview</div>
                    </div>
                  </div>

                  <div style={styles.summaryBoxCompact}>
                    <div style={styles.summaryRowMini}>
                      <span>Total Suggestions</span>
                      <strong>{recommendations.length}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Preferred Day</span>
                      <strong>
                        {preferredDay === "Any" ? "Any Day" : getDayLabel(preferredDay)}
                      </strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Preferred Time</span>
                      <strong>{preferredTime}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Notification</span>
                      <strong>{notificationMethod}</strong>
                    </div>
                  </div>
                </section>
              </div>

              <section style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Recommended Slots</div>
                    <div style={styles.panelSub}>
                      Ranked suggestions from the recommendation engine
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
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={applyRecommendation}
                  >
                    Apply Recommended Slot
                  </button>
                </div>
              </section>

              <section style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Existing Bookings</div>
                    <div style={styles.panelSub}>
                      Current appointments used by the AI engine
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

  messageBanner: {
    marginBottom: 8,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 10,
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
    gridTemplateColumns: "0.75fr 2fr",
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

  compactStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
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

  formGrid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 6
  },

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
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

  statusCard: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
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

  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotPurple: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  infoBox: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  infoTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: "#59b7ff",
    marginBottom: 4
  },

  infoText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.4
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

  recommendationList: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },

  recommendationItem: {
    padding: 8,
    borderRadius: 10,
    background: "#071427",
    border: "1px solid rgba(54,112,190,0.18)",
    cursor: "pointer"
  },

  recommendationItemActive: {
    padding: 8,
    borderRadius: 10,
    background: "#0b213f",
    border: "1px solid rgba(26,154,255,0.45)",
    cursor: "pointer"
  },

  recommendationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8
  },

  recommendationTitle: {
    fontSize: 10,
    fontWeight: 800
  },

  recommendationMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.58)"
  },

  scoreBadge: {
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap",
    height: "fit-content"
  },

  reasonWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 6
  },

  reasonBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 9,
    fontWeight: 600
  },

  bookingList: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },

  bookingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid rgba(54,112,190,0.12)"
  },

  bookingTitle: {
    fontSize: 10,
    fontWeight: 800
  },

  bookingMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.58)"
  },

  bookingBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 9,
    fontWeight: 700
  },

  emptyState: {
    padding: 10,
    borderRadius: 10,
    background: "#071427",
    color: "rgba(255,255,255,0.5)",
    fontSize: 10
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8
  }
};
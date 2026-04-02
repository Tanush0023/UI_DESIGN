"use client";

import React, { useMemo, useState } from "react";

type Clinic = "Main Clinic" | "North Branch" | "South Branch";
type Resource = "Room 1" | "Room 2" | "CT Scanner" | "Ultrasound";
type Modality = "All" | "CT" | "Ultrasound" | "Consult" | "Review";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";

type Day = {
  key: DayKey;
  label: string;
};

type ResourceMapping = {
  clinic: Clinic;
  room: Resource;
  machine: string;
  modality: Exclude<Modality, "All">;
};

type Staff = {
  id: number;
  name: string;
  role: string;
  clinic: Clinic;
  assignedClinics: Clinic[];
  day: DayKey;
  shift: string;
  available: boolean;
};

type Appointment = {
  id: number;
  day: DayKey;
  time: string;
  clinic: Clinic;
  resource: Resource;
  patient: string;
  type: string;
  status: string;
  staff: string;
  clinician: string;
};

type BlockedSlot = {
  day: DayKey;
  time: string;
  clinic: Clinic;
  resource: Resource;
};

type SlotData =
  | { state: "booked"; data: Appointment }
  | { state: "blocked"; data: BlockedSlot }
  | { state: "available"; data: null };

const clinics: Clinic[] = ["Main Clinic", "North Branch", "South Branch"];
const resources: Resource[] = ["Room 1", "Room 2", "CT Scanner", "Ultrasound"];
const modalities: Modality[] = ["All", "CT", "Ultrasound", "Consult", "Review"];

const days: Day[] = [
  { key: "mon", label: "Mon 18" },
  { key: "tue", label: "Tue 19" },
  { key: "wed", label: "Wed 20" },
  { key: "thu", label: "Thu 21" },
  { key: "fri", label: "Fri 22" },
];

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
  "16:30",
];

const resourceMapping: ResourceMapping[] = [
  {
    clinic: "Main Clinic",
    room: "Room 1",
    machine: "Consult Setup A",
    modality: "Consult",
  },
  {
    clinic: "Main Clinic",
    room: "Room 2",
    machine: "Consult Setup B",
    modality: "Review",
  },
  {
    clinic: "Main Clinic",
    room: "CT Scanner",
    machine: "GE CT 128",
    modality: "CT",
  },
  {
    clinic: "Main Clinic",
    room: "Ultrasound",
    machine: "Philips US 7",
    modality: "Ultrasound",
  },
  {
    clinic: "North Branch",
    room: "Ultrasound",
    machine: "Siemens US 2",
    modality: "Ultrasound",
  },
  {
    clinic: "South Branch",
    room: "Room 2",
    machine: "Review Station",
    modality: "Review",
  },
];

const staffRoster: Staff[] = [
  {
    id: 1,
    name: "Sarah Miles",
    role: "Receptionist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic", "North Branch"],
    day: "mon",
    shift: "08:00 - 16:00",
    available: true,
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
  },
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    day: "mon",
    time: "09:00",
    clinic: "Main Clinic",
    resource: "Room 1",
    patient: "Susan Hall",
    type: "Consult",
    status: "Booked",
    staff: "Sarah Miles",
    clinician: "Dr Olivia Kent",
  },
  {
    id: 2,
    day: "mon",
    time: "10:30",
    clinic: "Main Clinic",
    resource: "CT Scanner",
    patient: "Amy Song",
    type: "CT",
    status: "Booked",
    staff: "Sarah Miles",
    clinician: "Dr Marcus Lee",
  },
  {
    id: 3,
    day: "tue",
    time: "11:00",
    clinic: "North Branch",
    resource: "Ultrasound",
    patient: "Robert Lang",
    type: "Ultrasound",
    status: "Booked",
    staff: "Nina Foster",
    clinician: "Nina Foster",
  },
  {
    id: 4,
    day: "wed",
    time: "13:30",
    clinic: "South Branch",
    resource: "Room 2",
    patient: "Jane Willis",
    type: "Review",
    status: "Booked",
    staff: "Ethan Cole",
    clinician: "Ethan Cole",
  },
  {
    id: 5,
    day: "thu",
    time: "15:00",
    clinic: "Main Clinic",
    resource: "Room 1",
    patient: "Chris Patel",
    type: "Follow-up",
    status: "Booked",
    staff: "Sarah Miles",
    clinician: "Dr Olivia Kent",
  },
];

const blockedSlots: BlockedSlot[] = [
  { day: "mon", time: "12:00", clinic: "Main Clinic", resource: "Room 1" },
  { day: "tue", time: "14:00", clinic: "North Branch", resource: "Ultrasound" },
  { day: "wed", time: "10:00", clinic: "South Branch", resource: "Room 2" },
  { day: "thu", time: "08:30", clinic: "Main Clinic", resource: "CT Scanner" },
  { day: "fri", time: "16:00", clinic: "Main Clinic", resource: "Room 1" },
];

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedClinic, setSelectedClinic] = useState<Clinic>("Main Clinic");
  const [selectedResource, setSelectedResource] = useState<Resource | "All">("All");
  const [selectedModality, setSelectedModality] = useState<Modality>("All");
  const [selectedDay, setSelectedDay] = useState<DayKey>("mon");
  const [search, setSearch] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number>(1);
  const [rescheduleDay, setRescheduleDay] = useState<DayKey>("thu");
  const [rescheduleTime, setRescheduleTime] = useState("14:00");
  const [rescheduleResource, setRescheduleResource] = useState<Resource>("Room 2");
  const [message, setMessage] = useState("");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const clinicMatch = item.clinic === selectedClinic;
      const resourceMatch =
        selectedResource === "All" || item.resource === selectedResource;
      const modalityMatch =
        selectedModality === "All" || item.type === selectedModality;
      const text =
        `${item.patient} ${item.type} ${item.resource} ${item.clinic} ${item.clinician} ${item.staff}`.toLowerCase();
      const searchMatch = text.includes(search.toLowerCase());
      return clinicMatch && resourceMatch && modalityMatch && searchMatch;
    });
  }, [appointments, selectedClinic, selectedResource, selectedModality, search]);

  const visibleBlockedSlots = useMemo(() => {
    return blockedSlots.filter((slot) => {
      const clinicMatch = slot.clinic === selectedClinic;
      const resourceMatch =
        selectedResource === "All" || slot.resource === selectedResource;
      return clinicMatch && resourceMatch;
    });
  }, [selectedClinic, selectedResource]);

  const dayAppointments = useMemo(() => {
    return filteredAppointments
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredAppointments, selectedDay]);

  const dayStats = useMemo(() => {
    const totalVisible = timeSlots.length;
    const booked = filteredAppointments.filter((a) => a.day === selectedDay).length;
    const blocked = visibleBlockedSlots.filter((b) => b.day === selectedDay).length;
    const available = totalVisible - booked - blocked;
    return { totalVisible, booked, blocked, available };
  }, [filteredAppointments, visibleBlockedSlots, selectedDay]);

  const selectedAppointment =
    appointments.find((item) => item.id === selectedAppointmentId) || appointments[0];

  const rosterForDay = useMemo(() => {
    return staffRoster.filter(
      (staff) =>
        staff.day === selectedDay &&
        (staff.clinic === selectedClinic ||
          staff.assignedClinics.includes(selectedClinic))
    );
  }, [selectedDay, selectedClinic]);

  const mappingForClinic = useMemo(() => {
    return resourceMapping.filter((item) => item.clinic === selectedClinic);
  }, [selectedClinic]);

  const getSlotData = (day: DayKey, time: string): SlotData => {
    const booked = filteredAppointments.find(
      (item) => item.day === day && item.time === time
    );
    if (booked) return { state: "booked", data: booked };

    const blocked = visibleBlockedSlots.find(
      (item) => item.day === day && item.time === time
    );
    if (blocked) return { state: "blocked", data: blocked };

    return { state: "available", data: null };
  };

  const detectedConflicts = useMemo(() => {
    const conflicts: string[] = [];

    appointments.forEach((appointment, index) => {
      appointments.slice(index + 1).forEach((other) => {
        if (
          appointment.day === other.day &&
          appointment.time === other.time &&
          appointment.clinic === other.clinic
        ) {
          if (appointment.resource === other.resource) {
            conflicts.push(
              `Room/Machine conflict: ${appointment.resource} is double-booked on ${appointment.day.toUpperCase()} at ${appointment.time}.`
            );
          }
          if (appointment.staff === other.staff) {
            conflicts.push(
              `Staff conflict: ${appointment.staff} is allocated to overlapping bookings on ${appointment.day.toUpperCase()} at ${appointment.time}.`
            );
          }
          if (appointment.clinician === other.clinician) {
            conflicts.push(
              `Clinician conflict: ${appointment.clinician} has overlapping bookings on ${appointment.day.toUpperCase()} at ${appointment.time}.`
            );
          }
        }
      });
    });

    return [...new Set(conflicts)];
  }, [appointments]);

  const intelligentAlerts = useMemo(() => {
    const alerts: string[] = [];

    days.forEach((day) => {
      const dayItems = appointments
        .filter((item) => item.day === day.key && item.clinic === selectedClinic)
        .sort((a, b) => a.time.localeCompare(b.time));

      for (let i = 1; i < dayItems.length; i++) {
        const prevIndex = timeSlots.indexOf(dayItems[i - 1].time);
        const currentIndex = timeSlots.indexOf(dayItems[i].time);
        if (currentIndex - prevIndex >= 4) {
          alerts.push(
            `Idle gap alert: ${selectedClinic} has a long scheduling gap on ${day.label} between ${dayItems[i - 1].time} and ${dayItems[i].time}.`
          );
        }
      }
    });

    if (rosterForDay.length <= 1 && dayAppointments.length > 2) {
      alerts.push(
        `Staff efficiency alert: Only ${rosterForDay.length} staff member is rostered for ${
          days.find((d) => d.key === selectedDay)?.label
        } with ${dayAppointments.length} appointments.`
      );
    }

    return alerts;
  }, [appointments, rosterForDay, dayAppointments.length, selectedClinic, selectedDay]);

  const canReschedule = useMemo(() => {
    if (!selectedAppointment) return false;

    const blocked = blockedSlots.some(
      (slot) =>
        slot.clinic === selectedClinic &&
        slot.day === rescheduleDay &&
        slot.time === rescheduleTime &&
        slot.resource === rescheduleResource
    );

    const resourceBusy = appointments.some(
      (item) =>
        item.id !== selectedAppointment.id &&
        item.clinic === selectedClinic &&
        item.day === rescheduleDay &&
        item.time === rescheduleTime &&
        item.resource === rescheduleResource
    );

    const clinicianBusy = appointments.some(
      (item) =>
        item.id !== selectedAppointment.id &&
        item.day === rescheduleDay &&
        item.time === rescheduleTime &&
        item.clinician === selectedAppointment.clinician
    );

    const staffBusy = appointments.some(
      (item) =>
        item.id !== selectedAppointment.id &&
        item.day === rescheduleDay &&
        item.time === rescheduleTime &&
        item.staff === selectedAppointment.staff
    );

    return !(blocked || resourceBusy || clinicianBusy || staffBusy);
  }, [
    selectedAppointment,
    rescheduleDay,
    rescheduleTime,
    rescheduleResource,
    appointments,
    selectedClinic,
  ]);

  const handleReschedule = () => {
    if (!selectedAppointment) return;

    if (!canReschedule) {
      setMessage("Reschedule blocked due to a resource or staff conflict.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              day: rescheduleDay,
              time: rescheduleTime,
              resource: rescheduleResource,
            }
          : item
      )
    );

    setMessage(
      `Appointment rescheduled to ${rescheduleDay.toUpperCase()} at ${rescheduleTime} in ${rescheduleResource}.`
    );
  };

  const handleToday = () => {
    setSelectedDay("mon");
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>Scheduler / Roster Module</div>
        </div>

        <div style={styles.topbarRight}>
          <button style={styles.topActionButton} onClick={handleToday}>
            Today
          </button>
          <button style={styles.topActionButton}>New Booking</button>
          <button style={styles.topActionButton}>Reschedule</button>
          <div style={styles.topInfoPill}>Clinic: {selectedClinic}</div>
          <div style={styles.topInfoPill}>Staff On Duty: {rosterForDay.length}</div>
          <div style={styles.userPill}>Scheduler</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>SCHEDULING</div>
            <div style={styles.sidebarSub}>
              Calendar, roster, mapping, and conflict management
            </div>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Clinic</div>
            {clinics.map((clinic) => (
              <div
                key={clinic}
                onClick={() => setSelectedClinic(clinic)}
                style={selectedClinic === clinic ? styles.navItemActive : styles.navItem}
              >
                {clinic}
              </div>
            ))}
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Room / Machine</div>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value as Resource | "All")}
              style={styles.select}
            >
              <option value="All">All Resources</option>
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Modality</div>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value as Modality)}
              style={styles.select}
            >
              {modalities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Search</div>
            <input
              style={styles.input}
              placeholder="Search patient, staff or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>Legend</div>

            <div style={styles.statusRow}>
              <span style={styles.dotGreen} />
              <span>Available Slot</span>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.dotBlue} />
              <span>Booked Appointment</span>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.dotRed} />
              <span>Blocked / Conflict</span>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.dotPurple} />
              <span>Roster / Mapping Info</span>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>SCHEDULING & RESOURCE MANAGEMENT</div>
              <h1 style={styles.pageTitle}>Appointment Calendar and Allocation</h1>
              <p style={styles.pageSub}>
                Calendar-based scheduling with appointment rescheduling,
                resource-aware booking, staff availability, clinic-room-machine
                mapping, conflict detection, and intelligent alerts.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button style={styles.secondaryButton}>Export</button>
              <button style={styles.primaryButton}>Quick Book</button>
            </div>
          </div>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Clinic</div>
              <div style={styles.metricValueSmall}>{selectedClinic}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Available</div>
              <div style={styles.metricValue}>{dayStats.available}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Booked</div>
              <div style={styles.metricValue}>{dayStats.booked}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Rostered Staff</div>
              <div style={styles.metricValue}>{rosterForDay.length}</div>
            </div>
          </div>

          {(detectedConflicts.length > 0 || intelligentAlerts.length > 0) && (
            <div style={styles.alertGrid}>
              <section style={styles.alertPanel}>
                <div style={styles.alertTitle}>Resource Conflict Detection</div>
                {detectedConflicts.length === 0 ? (
                  <div style={styles.alertOk}>No active conflicts detected.</div>
                ) : (
                  detectedConflicts.map((alert, index) => (
                    <div key={index} style={styles.alertError}>
                      {alert}
                    </div>
                  ))
                )}
              </section>

              <section style={styles.alertPanel}>
                <div style={styles.alertTitle}>Intelligent Scheduling Alerts</div>
                {intelligentAlerts.length === 0 ? (
                  <div style={styles.alertOk}>No inefficiency alerts detected.</div>
                ) : (
                  intelligentAlerts.map((alert, index) => (
                    <div key={index} style={styles.alertWarn}>
                      {alert}
                    </div>
                  ))
                )}
              </section>
            </div>
          )}

          <div style={styles.calendarPanel}>
            <div style={styles.calendarHeader}>
              <div>
                <div style={styles.panelTitle}>Appointment Calendar</div>
                <div style={styles.panelSub}>
                  Calendar visibility across clinics, rooms, machines, and modalities.
                </div>
              </div>
            </div>

            <div style={styles.dayTabs}>
              {days.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  style={selectedDay === day.key ? styles.dayTabActive : styles.dayTab}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div style={styles.calendarGridWrap}>
              <div style={styles.calendarGrid}>
                <div style={styles.gridHeaderTime}>Time</div>
                {days.map((day) => (
                  <div key={day.key} style={styles.gridHeaderDay}>
                    {day.label}
                  </div>
                ))}

                {timeSlots.map((time) => (
                  <React.Fragment key={time}>
                    <div style={styles.timeCell}>{time}</div>

                    {days.map((day) => {
                      const slot = getSlotData(day.key, time);

                      if (slot.state === "booked") {
                        return (
                          <div
                            key={`${day.key}-${time}`}
                            style={{
                              ...styles.slotCell,
                              ...styles.slotBooked,
                              ...(selectedDay === day.key ? styles.slotSelectedOutline : {}),
                            }}
                          >
                            <div style={styles.slotTitle}>{slot.data.patient}</div>
                            <div style={styles.slotMeta}>
                              {slot.data.type} • {slot.data.resource}
                            </div>
                            <div style={styles.slotMetaSmall}>{slot.data.clinician}</div>
                          </div>
                        );
                      }

                      if (slot.state === "blocked") {
                        return (
                          <div
                            key={`${day.key}-${time}`}
                            style={{
                              ...styles.slotCell,
                              ...styles.slotBlocked,
                              ...(selectedDay === day.key ? styles.slotSelectedOutline : {}),
                            }}
                          >
                            <div style={styles.slotTitle}>Blocked</div>
                            <div style={styles.slotMeta}>{slot.data.resource}</div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`${day.key}-${time}`}
                          style={{
                            ...styles.slotCell,
                            ...styles.slotAvailable,
                            ...(selectedDay === day.key ? styles.slotSelectedOutline : {}),
                          }}
                        >
                          <div style={styles.slotTitle}>Available</div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.bottomGrid}>
            <section style={styles.panel}>
              <div style={styles.panelTitle}>Appointment Rescheduling</div>
              <div style={styles.panelSub}>
                Reschedule while maintaining resource and staff availability.
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={styles.filterLabel}>Select Appointment</div>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => setSelectedAppointmentId(Number(e.target.value))}
                  style={styles.select}
                >
                  {appointments
                    .filter((item) => item.clinic === selectedClinic)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.patient} • {item.day.toUpperCase()} {item.time} • {item.resource}
                      </option>
                    ))}
                </select>
              </div>

              <div style={styles.rescheduleGrid}>
                <div>
                  <div style={styles.filterLabel}>New Day</div>
                  <select
                    value={rescheduleDay}
                    onChange={(e) => setRescheduleDay(e.target.value as DayKey)}
                    style={styles.select}
                  >
                    {days.map((day) => (
                      <option key={day.key} value={day.key}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={styles.filterLabel}>New Time</div>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={styles.select}
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={styles.filterLabel}>Resource</div>
                  <select
                    value={rescheduleResource}
                    onChange={(e) => setRescheduleResource(e.target.value as Resource)}
                    style={styles.select}
                  >
                    {resources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Selected Patient</span>
                  <strong>{selectedAppointment?.patient || "-"}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Current Slot</span>
                  <strong>
                    {selectedAppointment
                      ? `${selectedAppointment.day.toUpperCase()} ${selectedAppointment.time}`
                      : "-"}
                  </strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Conflict Check</span>
                  <strong>{canReschedule ? "Clear" : "Conflict Detected"}</strong>
                </div>
              </div>

              <div style={styles.formActions}>
                <button style={styles.secondaryButton}>Cancel</button>
                <button
                  style={canReschedule ? styles.primaryButton : styles.disabledButton}
                  onClick={handleReschedule}
                >
                  Confirm Reschedule
                </button>
              </div>

              {message ? <div style={styles.message}>{message}</div> : null}
            </section>

            <section style={styles.panel}>
              <div style={styles.panelTitle}>Staff Availability & Roster</div>
              <div style={styles.panelSub}>
                Staff assigned to the selected clinic/day with access visibility.
              </div>

              <div style={{ marginTop: 14 }}>
                {rosterForDay.length === 0 ? (
                  <div style={styles.emptyState}>No staff rostered for this day.</div>
                ) : (
                  rosterForDay.map((staff) => (
                    <div key={staff.id} style={styles.listRow}>
                      <div>
                        <div style={styles.listTitle}>{staff.name}</div>
                        <div style={styles.listMeta}>
                          {staff.role} • {staff.shift}
                        </div>
                        <div style={styles.slotMetaSmall}>
                          Access: {staff.assignedClinics.join(", ")}
                        </div>
                      </div>
                      <div style={styles.badgeBooked}>
                        {staff.available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section style={styles.panel}>
              <div style={styles.panelTitle}>Clinic-Room-Machine Mapping</div>
              <div style={styles.panelSub}>
                Mapping configuration used for scheduling logic.
              </div>

              <div style={{ marginTop: 14 }}>
                {mappingForClinic.map((mapItem, index) => (
                  <div key={index} style={styles.listRow}>
                    <div>
                      <div style={styles.listTitle}>{mapItem.room}</div>
                      <div style={styles.listMeta}>
                        {mapItem.machine} • {mapItem.modality}
                      </div>
                    </div>
                    <div style={styles.mappingBadge}>{mapItem.modality}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.panelTitle}>Selected Day Appointments</div>
              <div style={styles.panelSub}>
                {days.find((d) => d.key === selectedDay)?.label} • {selectedClinic}
              </div>

              <div style={{ marginTop: 14 }}>
                {dayAppointments.length === 0 ? (
                  <div style={styles.emptyState}>
                    No appointments for this selection.
                  </div>
                ) : (
                  dayAppointments.map((item) => (
                    <div key={item.id} style={styles.listRow}>
                      <div>
                        <div style={styles.listTitle}>{item.patient}</div>
                        <div style={styles.listMeta}>
                          {item.time} • {item.type} • {item.clinician}
                        </div>
                      </div>
                      <div style={styles.badgeBooked}>{item.resource}</div>
                    </div>
                  ))
                )}
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

  topActionButton: {
    height: 34,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
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

  navItemActive: {
    padding: "10px 12px",
    background: "#1b1e22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  navItem: {
    padding: "10px 12px",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    borderRadius: 6,
    cursor: "pointer",
    background: "#17191d",
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

  dotBlue: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block",
  },

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block",
  },

  dotPurple: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#9b6bff",
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

  disabledButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#1b3a27",
    color: "rgba(255,255,255,0.45)",
    fontWeight: 600,
    cursor: "not-allowed",
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
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
  },

  alertGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  alertPanel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
  },

  alertError: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(210,77,87,0.14)",
    color: "#f08b8b",
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 1.5,
  },

  alertWarn: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(196,145,49,0.14)",
    color: "#f2cb74",
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 1.5,
  },

  alertOk: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(45,143,82,0.14)",
    color: "#7fd19a",
    fontSize: 13,
  },

  calendarPanel: {
    marginTop: 18,
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },

  calendarHeader: {
    padding: 18,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
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

  dayTabs: {
    display: "flex",
    gap: 10,
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },

  dayTab: {
    height: 36,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontWeight: 600,
  },

  dayTabActive: {
    height: 36,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(86,168,255,0.25)",
    background: "#1f2c3b",
    color: "#56a8ff",
    cursor: "pointer",
    fontWeight: 700,
  },

  calendarGridWrap: {
    overflowX: "auto",
    padding: 14,
  },

  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "90px repeat(5, minmax(170px, 1fr))",
    minWidth: 960,
  },

  gridHeaderTime: {
    padding: "12px 10px",
    background: "#1b1e22",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
  },

  gridHeaderDay: {
    padding: "12px 10px",
    background: "#1b1e22",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
  },

  timeCell: {
    minHeight: 58,
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    color: "rgba(255,255,255,0.58)",
    background: "#17191d",
  },

  slotCell: {
    minHeight: 58,
    padding: "8px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    background: "#17191d",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  slotAvailable: {
    background: "rgba(45,143,82,0.08)",
  },

  slotBooked: {
    background: "rgba(86,168,255,0.12)",
  },

  slotBlocked: {
    background: "rgba(210,77,87,0.12)",
  },

  slotSelectedOutline: {
    boxShadow: "inset 2px 0 0 #56a8ff",
  },

  slotTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff",
  },

  slotMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 3,
  },

  slotMetaSmall: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    marginTop: 3,
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

  emptyState: {
    padding: 18,
    borderRadius: 8,
    background: "#121417",
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },

  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  listTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
  },

  listMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },

  badgeBooked: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  mappingBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(155,107,255,0.16)",
    color: "#c7a7ff",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
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

  rescheduleGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },

  formActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 16,
  },

  message: {
    marginTop: 14,
    fontSize: 13,
    color: "#53c27a",
  },
};
"use client";

import React, { useMemo, useState } from "react";

type Clinic = "Main Clinic" | "North Branch" | "South Branch";
type Resource = "Room 1" | "Room 2" | "CT Scanner" | "Ultrasound";
type Modality = "All" | "CT" | "Ultrasound" | "Consult" | "Review";
type SlotView = "All" | "Available" | "Booked" | "Blocked";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";
type StaffRole = "Receptionist" | "Technical Staff" | "Radiologist" | "Admin";
type AppointmentStatus = "Booked";

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

type StaffMember = {
  id: number;
  name: string;
  role: StaffRole;
  clinic: Clinic;
  assignedClinics: Clinic[];
  day: DayKey;
  shift: string;
  available: boolean;
  capabilities: string;
};

type Appointment = {
  id: number;
  day: DayKey;
  time: string;
  clinic: Clinic;
  resource: Resource;
  patient: string;
  type: string;
  status: AppointmentStatus;
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
const slotViewOptions: SlotView[] = ["All", "Available", "Booked", "Blocked"];

const days: Day[] = [
  { key: "mon", label: "Mon 18" },
  { key: "tue", label: "Tue 19" },
  { key: "wed", label: "Wed 20" },
  { key: "thu", label: "Thu 21" },
  { key: "fri", label: "Fri 22" }
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
  "16:30"
];

const resourceMapping: ResourceMapping[] = [
  {
    clinic: "Main Clinic",
    room: "Room 1",
    machine: "Consult Setup A",
    modality: "Consult"
  },
  {
    clinic: "Main Clinic",
    room: "Room 2",
    machine: "Consult Setup B",
    modality: "Review"
  },
  {
    clinic: "Main Clinic",
    room: "CT Scanner",
    machine: "GE CT 128",
    modality: "CT"
  },
  {
    clinic: "Main Clinic",
    room: "Ultrasound",
    machine: "Philips US 7",
    modality: "Ultrasound"
  },
  {
    clinic: "North Branch",
    room: "Ultrasound",
    machine: "Siemens US 2",
    modality: "Ultrasound"
  },
  {
    clinic: "South Branch",
    room: "Room 2",
    machine: "Review Station",
    modality: "Review"
  }
];

const initialStaffRoster: StaffMember[] = [
  {
    id: 1,
    name: "Sarah Miles",
    role: "Receptionist",
    clinic: "Main Clinic",
    assignedClinics: ["Main Clinic", "North Branch"],
    day: "mon",
    shift: "08:00 - 16:00",
    available: true,
    capabilities: "Booking, Registration"
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
    capabilities: "Consult, Review"
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
    capabilities: "CT, Review"
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
    capabilities: "Ultrasound"
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
    capabilities: "Review, Preparation"
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
    capabilities: "Reception, Scheduling"
  }
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
    clinician: "Dr Olivia Kent"
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
    clinician: "Dr Marcus Lee"
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
    clinician: "Nina Foster"
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
    clinician: "Ethan Cole"
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
    clinician: "Dr Olivia Kent"
  }
];

const blockedSlots: BlockedSlot[] = [
  { day: "mon", time: "12:00", clinic: "Main Clinic", resource: "Room 1" },
  { day: "tue", time: "14:00", clinic: "North Branch", resource: "Ultrasound" },
  { day: "wed", time: "10:00", clinic: "South Branch", resource: "Room 2" },
  { day: "thu", time: "08:30", clinic: "Main Clinic", resource: "CT Scanner" },
  { day: "fri", time: "16:00", clinic: "Main Clinic", resource: "Room 1" }
];

export default function SchedulerPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [staffRoster, setStaffRoster] =
    useState<StaffMember[]>(initialStaffRoster);

  const [selectedClinic, setSelectedClinic] =
    useState<Clinic>("Main Clinic");
  const [selectedResource, setSelectedResource] =
    useState<Resource | "All">("All");
  const [selectedModality, setSelectedModality] =
    useState<Modality>("All");
  const [selectedDay, setSelectedDay] = useState<DayKey>("mon");
  const [selectedSlotView, setSelectedSlotView] =
    useState<SlotView>("All");
  const [search, setSearch] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<number>(1);
  const [rescheduleDay, setRescheduleDay] = useState<DayKey>("thu");
  const [rescheduleTime, setRescheduleTime] = useState("14:00");
  const [rescheduleResource, setRescheduleResource] =
    useState<Resource>("Room 2");
  const [message, setMessage] = useState("");

  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("Receptionist");
  const [staffClinic, setStaffClinic] = useState<Clinic>("Main Clinic");
  const [staffDay, setStaffDay] = useState<DayKey>("mon");
  const [staffShift, setStaffShift] = useState("08:00 - 16:00");
  const [staffCapabilities, setStaffCapabilities] = useState("");
  const [staffMessage, setStaffMessage] = useState("");

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
  }, [
    appointments,
    selectedClinic,
    selectedResource,
    selectedModality,
    search
  ]);

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
    const booked = filteredAppointments.filter(
      (a) => a.day === selectedDay
    ).length;
    const blocked = visibleBlockedSlots.filter(
      (b) => b.day === selectedDay
    ).length;
    const available = totalVisible - booked - blocked;
    return { totalVisible, booked, blocked, available };
  }, [filteredAppointments, visibleBlockedSlots, selectedDay]);

  const selectedAppointment =
    appointments.find((item) => item.id === selectedAppointmentId) ??
    appointments[0];

  const rosterForDay = useMemo(() => {
    return staffRoster.filter(
      (staff) =>
        staff.day === selectedDay &&
        (staff.clinic === selectedClinic ||
          staff.assignedClinics.includes(selectedClinic))
    );
  }, [selectedDay, selectedClinic, staffRoster]);

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

  const shouldShowSlot = (state: SlotData["state"]) => {
    if (selectedSlotView === "All") return true;
    return selectedSlotView.toLowerCase() === state;
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
              `Room conflict: ${appointment.resource} double-booked on ${appointment.day.toUpperCase()} ${appointment.time}`
            );
          }
          if (appointment.staff === other.staff) {
            conflicts.push(
              `Staff conflict: ${appointment.staff} overlapping on ${appointment.day.toUpperCase()} ${appointment.time}`
            );
          }
          if (appointment.clinician === other.clinician) {
            conflicts.push(
              `Clinician conflict: ${appointment.clinician} overlapping on ${appointment.day.toUpperCase()} ${appointment.time}`
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
        .filter(
          (item) => item.day === day.key && item.clinic === selectedClinic
        )
        .sort((a, b) => a.time.localeCompare(b.time));

      for (let i = 1; i < dayItems.length; i++) {
        const prevIndex = timeSlots.indexOf(dayItems[i - 1].time);
        const currentIndex = timeSlots.indexOf(dayItems[i].time);
        if (currentIndex - prevIndex >= 4) {
          alerts.push(
            `Idle gap on ${day.label}: ${dayItems[i - 1].time} to ${dayItems[i].time}`
          );
        }
      }
    });

    if (rosterForDay.length <= 1 && dayAppointments.length > 2) {
      alerts.push(
        `Low roster cover for ${days.find((d) => d.key === selectedDay)?.label}`
      );
    }

    return alerts;
  }, [
    appointments,
    rosterForDay,
    dayAppointments.length,
    selectedClinic,
    selectedDay
  ]);

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
    selectedClinic
  ]);

  const handleReschedule = () => {
    if (!selectedAppointment) return;

    if (!canReschedule) {
      setMessage("Reschedule blocked due to a conflict.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              day: rescheduleDay,
              time: rescheduleTime,
              resource: rescheduleResource
            }
          : item
      )
    );

    setMessage(
      `Appointment moved to ${rescheduleDay.toUpperCase()} ${rescheduleTime} in ${rescheduleResource}.`
    );
  };

  const handleRegisterStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStaffMessage("");

    if (!staffName.trim() || !staffCapabilities.trim()) {
      setStaffMessage("Complete all required staff fields.");
      return;
    }

    const newStaff: StaffMember = {
      id: Date.now(),
      name: staffName.trim(),
      role: staffRole,
      clinic: staffClinic,
      assignedClinics: [staffClinic],
      day: staffDay,
      shift: staffShift,
      available: true,
      capabilities: staffCapabilities.trim()
    };

    setStaffRoster((prev) => [newStaff, ...prev]);
    setStaffName("");
    setStaffRole("Receptionist");
    setStaffClinic("Main Clinic");
    setStaffDay("mon");
    setStaffShift("08:00 - 16:00");
    setStaffCapabilities("");
    setStaffMessage("Staff profile registered.");
  };

  return (
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          SCHEDULER • CLINIC {selectedClinic.toUpperCase()} • AVAILABLE {dayStats.available} • BOOKED {dayStats.booked}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>SCHEDULER / ROSTER</div>
              <div style={styles.title}>Compact Appointment Calendar</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>Clinic: {selectedClinic}</div>
            <div style={styles.topInfoPill}>Open: {dayStats.available}</div>
            <button style={styles.ghostButton}>Today</button>
            <button style={styles.ghostButton}>New Booking</button>
            <button style={styles.primaryButton}>Quick Book</button>
          </div>
        </div>

        {(detectedConflicts.length > 0 || intelligentAlerts.length > 0) && (
          <div style={styles.alertGrid}>
            <div style={styles.alertPanel}>
              <div style={styles.alertTitle}>Conflicts</div>
              {detectedConflicts.length === 0 ? (
                <div style={styles.alertOk}>No active conflicts</div>
              ) : (
                detectedConflicts.map((alert, index) => (
                  <div key={index} style={styles.alertError}>
                    {alert}
                  </div>
                ))
              )}
            </div>

            <div style={styles.alertPanel}>
              <div style={styles.alertTitle}>Scheduling Alerts</div>
              {intelligentAlerts.length === 0 ? (
                <div style={styles.alertOk}>No inefficiency alerts</div>
              ) : (
                intelligentAlerts.map((alert, index) => (
                  <div key={index} style={styles.alertWarn}>
                    {alert}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Clinic</div>
            <div style={styles.metricValueSmall}>{selectedClinic}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Available</div>
            <div style={styles.metricValueSmall}>{dayStats.available}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Booked</div>
            <div style={styles.metricValueSmall}>{dayStats.booked}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Rostered</div>
            <div style={styles.metricValueSmall}>{rosterForDay.length}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <aside style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Filters</div>
                <div style={styles.panelSub}>Fast scheduling controls</div>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Clinic</div>
              {clinics.map((clinic) => (
                <div
                  key={clinic}
                  onClick={() => setSelectedClinic(clinic)}
                  style={
                    selectedClinic === clinic
                      ? styles.navItemActive
                      : styles.navItem
                  }
                >
                  {clinic}
                </div>
              ))}
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Resource</div>
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
              <div style={styles.filterLabel}>Slot View</div>
              <select
                value={selectedSlotView}
                onChange={(e) => setSelectedSlotView(e.target.value as SlotView)}
                style={styles.select}
              >
                {slotViewOptions.map((item) => (
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
                placeholder="Search patient, staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>Access Rule</div>
              <div style={styles.infoText}>
                Reception staff can access calendars across clinics while remaining assigned to at least one clinic.
              </div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusTitle}>Legend</div>
              <div style={styles.statusRow}>
                <span style={styles.dotGreen} />
                <span>Available</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotBlue} />
                <span>Booked</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotRed} />
                <span>Blocked</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotPurple} />
                <span>Mapping / Roster</span>
              </div>
            </div>
          </aside>

          <section style={styles.centerArea}>
            <div style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Appointment Calendar</div>
                  <div style={styles.panelSub}>
                    Compact calendar with slot visibility and filters
                  </div>
                </div>
              </div>

              <div style={styles.dayTabs}>
                {days.map((day) => (
                  <button
                    key={day.key}
                    type="button"
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

                        if (!shouldShowSlot(slot.state)) {
                          return (
                            <div key={`${day.key}-${time}`} style={styles.slotCellMuted}>
                              <div style={styles.slotMeta}>Filtered</div>
                            </div>
                          );
                        }

                        if (slot.state === "booked") {
                          return (
                            <div key={`${day.key}-${time}`} style={styles.slotCellBooked}>
                              <div style={styles.slotTitle}>{slot.data.patient}</div>
                              <div style={styles.slotMeta}>
                                {slot.data.type} • {slot.data.resource}
                              </div>
                              <div style={styles.slotMetaSmall}>
                                {slot.data.clinician}
                              </div>
                            </div>
                          );
                        }

                        if (slot.state === "blocked") {
                          return (
                            <div key={`${day.key}-${time}`} style={styles.slotCellBlocked}>
                              <div style={styles.slotTitle}>Blocked</div>
                              <div style={styles.slotMeta}>{slot.data.resource}</div>
                            </div>
                          );
                        }

                        return (
                          <div key={`${day.key}-${time}`} style={styles.slotCellAvailable}>
                            <div style={styles.slotTitle}>Available</div>
                            <div style={styles.slotMeta}>
                              {selectedResource === "All" ? "Open Slot" : selectedResource}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.bottomGrid}>
              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Reschedule</div>
                <div style={styles.panelSub}>Maintain resource and staff availability</div>

                <div style={{ marginTop: 8 }}>
                  <div style={styles.filterLabel}>Appointment</div>
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
                    <div style={styles.filterLabel}>Day</div>
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
                    <div style={styles.filterLabel}>Time</div>
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

                <div style={styles.summaryBoxCompact}>
                  <div style={styles.summaryRowMini}>
                    <span>Patient</span>
                    <strong>{selectedAppointment?.patient || "-"}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Current</span>
                    <strong>
                      {selectedAppointment
                        ? `${selectedAppointment.day.toUpperCase()} ${selectedAppointment.time}`
                        : "-"}
                    </strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Check</span>
                    <strong>{canReschedule ? "Clear" : "Conflict"}</strong>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.ghostButton}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={canReschedule ? styles.primaryButton : styles.disabledButton}
                    onClick={handleReschedule}
                  >
                    Confirm
                  </button>
                </div>

                {message ? <div style={styles.message}>{message}</div> : null}
              </section>

              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Staff Roster</div>
                <div style={styles.panelSub}>Assigned staff for selected clinic/day</div>

                <div style={{ marginTop: 8 }}>
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
              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Room / Machine Mapping</div>
                <div style={styles.panelSub}>Scheduling allocation rules</div>

                <div style={{ marginTop: 8 }}>
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

              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Selected Day Appointments</div>
                <div style={styles.panelSub}>
                  {days.find((d) => d.key === selectedDay)?.label} • {selectedClinic}
                </div>

                <div style={{ marginTop: 8 }}>
                  {dayAppointments.length === 0 ? (
                    <div style={styles.emptyState}>No appointments for this selection.</div>
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

            <div style={styles.bottomGrid}>
              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Staff Registration</div>
                <div style={styles.panelSub}>Add new staff capability records</div>

                <form onSubmit={handleRegisterStaff} style={{ marginTop: 8 }}>
                  <div style={styles.staffGrid}>
                    <input
                      style={styles.input}
                      placeholder="Staff Name"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                    />
                    <select
                      style={styles.select}
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                    >
                      <option value="Receptionist">Receptionist</option>
                      <option value="Technical Staff">Technical Staff</option>
                      <option value="Radiologist">Radiologist</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <select
                      style={styles.select}
                      value={staffClinic}
                      onChange={(e) => setStaffClinic(e.target.value as Clinic)}
                    >
                      {clinics.map((clinic) => (
                        <option key={clinic} value={clinic}>
                          {clinic}
                        </option>
                      ))}
                    </select>

                    <select
                      style={styles.select}
                      value={staffDay}
                      onChange={(e) => setStaffDay(e.target.value as DayKey)}
                    >
                      {days.map((day) => (
                        <option key={day.key} value={day.key}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      placeholder="Shift"
                      value={staffShift}
                      onChange={(e) => setStaffShift(e.target.value)}
                    />
                    <input
                      style={styles.input}
                      placeholder="Capabilities"
                      value={staffCapabilities}
                      onChange={(e) => setStaffCapabilities(e.target.value)}
                    />
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" style={styles.primaryButton}>
                      Register
                    </button>
                  </div>
                </form>

                {staffMessage ? <div style={styles.message}>{staffMessage}</div> : null}
              </section>

              <section style={styles.panelCompact}>
                <div style={styles.panelTitle}>Filter Summary</div>
                <div style={styles.panelSub}>Active scheduler filters</div>

                <div style={styles.summaryBoxCompact}>
                  <div style={styles.summaryRowMini}>
                    <span>Clinic</span>
                    <strong>{selectedClinic}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Resource</span>
                    <strong>{selectedResource}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Modality</span>
                    <strong>{selectedModality}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Day</span>
                    <strong>{days.find((d) => d.key === selectedDay)?.label}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Slot View</span>
                    <strong>{selectedSlotView}</strong>
                  </div>
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

  disabledButton: {
    height: 26,
    padding: "0 12px",
    borderRadius: 9,
    border: "none",
    background: "#314052",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 800,
    cursor: "not-allowed"
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

  alertGrid: {
    marginBottom: 8,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8
  },

  alertPanel: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 12,
    background: "#020d1f",
    padding: 8
  },

  alertTitle: {
    fontSize: 10,
    fontWeight: 800,
    marginBottom: 5
  },

  alertError: {
    padding: "6px 8px",
    borderRadius: 8,
    background: "rgba(210,77,87,0.14)",
    color: "#f08b8b",
    marginBottom: 5,
    fontSize: 10,
    lineHeight: 1.3
  },

  alertWarn: {
    padding: "6px 8px",
    borderRadius: 8,
    background: "rgba(196,145,49,0.14)",
    color: "#f2cb74",
    marginBottom: 5,
    fontSize: 10,
    lineHeight: 1.3
  },

  alertOk: {
    padding: "6px 8px",
    borderRadius: 8,
    background: "rgba(45,143,82,0.14)",
    color: "#7fd19a",
    fontSize: 10
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

  navItem: {
    padding: "7px 8px",
    background: "#071427",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(54,112,190,0.18)",
    fontSize: 10
  },

  navItemActive: {
    padding: "7px 8px",
    background: "#0b213f",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(26,154,255,0.45)",
    fontSize: 10,
    fontWeight: 700
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

  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  dotPurple: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  dayTabs: {
    display: "flex",
    gap: 5,
    paddingBottom: 8,
    flexWrap: "wrap"
  },

  dayTab: {
    height: 24,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#d3d8df",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 10
  },

  dayTabActive: {
    height: 24,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid rgba(26,154,255,0.45)",
    background: "#0b213f",
    color: "#59b7ff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 10
  },

  calendarGridWrap: {
    overflowX: "auto"
  },

  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "64px repeat(5, minmax(120px, 1fr))",
    minWidth: 720
  },

  gridHeaderTime: {
    padding: "8px 6px",
    background: "#071427",
    borderBottom: "1px solid rgba(54,112,190,0.18)",
    borderRight: "1px solid rgba(54,112,190,0.14)",
    fontSize: 10,
    fontWeight: 800
  },

  gridHeaderDay: {
    padding: "8px 6px",
    background: "#071427",
    borderBottom: "1px solid rgba(54,112,190,0.18)",
    borderRight: "1px solid rgba(54,112,190,0.14)",
    fontSize: 10,
    fontWeight: 800
  },

  timeCell: {
    minHeight: 44,
    padding: "8px 6px",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    borderRight: "1px solid rgba(54,112,190,0.12)",
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    background: "#071427"
  },

  slotCellAvailable: {
    minHeight: 44,
    padding: "6px",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    borderRight: "1px solid rgba(54,112,190,0.12)",
    background: "rgba(45,143,82,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  slotCellBooked: {
    minHeight: 44,
    padding: "6px",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    borderRight: "1px solid rgba(54,112,190,0.12)",
    background: "rgba(86,168,255,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  slotCellBlocked: {
    minHeight: 44,
    padding: "6px",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    borderRight: "1px solid rgba(54,112,190,0.12)",
    background: "rgba(210,77,87,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  slotCellMuted: {
    minHeight: 44,
    padding: "6px",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    borderRight: "1px solid rgba(54,112,190,0.12)",
    background: "#0a1120",
    opacity: 0.7,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  slotTitle: {
    fontSize: 10,
    fontWeight: 800
  },

  slotMeta: {
    fontSize: 9,
    color: "rgba(255,255,255,0.66)",
    marginTop: 2
  },

  slotMetaSmall: {
    fontSize: 8,
    color: "rgba(255,255,255,0.48)",
    marginTop: 2
  },

  bottomGrid: {
    marginTop: 8,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8
  },

  rescheduleGrid: {
    marginTop: 8,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 6
  },

  staffGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6
  },

  summaryBoxCompact: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8,
    marginTop: 6
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

  formActions: {
    display: "flex",
    gap: 6,
    justifyContent: "flex-end",
    marginTop: 8
  },

  message: {
    marginTop: 6,
    fontSize: 10,
    color: "#7fd19a",
    fontWeight: 700
  },

  emptyState: {
    padding: 10,
    borderRadius: 10,
    background: "#071427",
    color: "rgba(255,255,255,0.55)",
    fontSize: 10
  },

  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid rgba(54,112,190,0.12)"
  },

  listTitle: {
    fontSize: 10,
    fontWeight: 800
  },

  listMeta: {
    fontSize: 9,
    color: "rgba(255,255,255,0.58)",
    marginTop: 2
  },

  badgeBooked: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },

  mappingBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(155,107,255,0.16)",
    color: "#c7a7ff",
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap"
  }
};
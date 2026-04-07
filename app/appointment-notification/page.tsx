"use client";

import React, { useMemo, useState } from "react";

type Clinic = "Main Clinic" | "North Branch" | "South Branch";
type Resource = "Room 1" | "Room 2" | "CT Scanner" | "Ultrasound";
type Modality = "All" | "CT" | "Ultrasound" | "Consult" | "Review";
type SlotView = "All" | "Available" | "Booked" | "Blocked";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";
type StaffRole = "Receptionist" | "Technical Staff" | "Radiologist" | "Admin";
type AppointmentStatus = "Booked";
type NotificationMethod = "SMS" | "Email" | "Both";
type NotificationStatus = "Not Sent" | "Queued" | "Sent" | "Failed";

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

type AppointmentNotification = {
  method: NotificationMethod;
  confirmationEnabled: boolean;
  preparationEnabled: boolean;
  formLinkEnabled: boolean;
  status: NotificationStatus;
  lastSentAt: string;
  logRef: string;
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
  notification: AppointmentNotification;
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
const notificationMethods: NotificationMethod[] = ["SMS", "Email", "Both"];

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

const createNotification = (
  method: NotificationMethod,
  confirmationEnabled: boolean,
  preparationEnabled: boolean,
  formLinkEnabled: boolean,
  status: NotificationStatus,
  lastSentAt: string,
  logRef: string
): AppointmentNotification => ({
  method,
  confirmationEnabled,
  preparationEnabled,
  formLinkEnabled,
  status,
  lastSentAt,
  logRef
});

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
    notification: createNotification(
      "SMS",
      true,
      true,
      true,
      "Sent",
      "2026-03-26 14:05",
      "SMS-24031"
    )
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
    notification: createNotification(
      "Both",
      true,
      true,
      false,
      "Sent",
      "2026-03-26 14:14",
      "SMS-24032"
    )
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
    notification: createNotification(
      "SMS",
      true,
      true,
      true,
      "Queued",
      "2026-03-26 15:02",
      "SMS-24033"
    )
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
    notification: createNotification(
      "Email",
      true,
      false,
      false,
      "Sent",
      "2026-03-26 15:45",
      "MAIL-1054"
    )
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
    notification: createNotification(
      "SMS",
      true,
      true,
      true,
      "Not Sent",
      "-",
      "-"
    )
  }
];

const blockedSlots: BlockedSlot[] = [
  { day: "mon", time: "12:00", clinic: "Main Clinic", resource: "Room 1" },
  { day: "tue", time: "14:00", clinic: "North Branch", resource: "Ultrasound" },
  { day: "wed", time: "10:00", clinic: "South Branch", resource: "Room 2" },
  { day: "thu", time: "08:30", clinic: "Main Clinic", resource: "CT Scanner" },
  { day: "fri", time: "16:00", clinic: "Main Clinic", resource: "Room 1" }
];

export default function SchedulerBookingNotificationPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const [notificationMethod, setNotificationMethod] =
    useState<NotificationMethod>("SMS");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [sendPreparation, setSendPreparation] = useState(true);
  const [includeFormLink, setIncludeFormLink] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [newPatient, setNewPatient] = useState("");
  const [newStudyType, setNewStudyType] = useState("Consult");
  const [newClinic, setNewClinic] = useState<Clinic>("Main Clinic");
  const [newDay, setNewDay] = useState<DayKey>("mon");
  const [newTime, setNewTime] = useState("08:00");
  const [newResource, setNewResource] = useState<Resource>("Room 1");
  const [newStaff, setNewStaff] = useState("Sarah Miles");
  const [newClinician, setNewClinician] = useState("Dr Olivia Kent");
  const [bookingMessage, setBookingMessage] = useState("");

  const theme = {
    pageBg: isDarkMode ? "#111315" : "#f2f3f5",
    mainBg: isDarkMode ? "#111315" : "#f2f3f5",
    sidebarBg: isDarkMode ? "#141618" : "#f3f4f6",
    panelBg: isDarkMode ? "#17191d" : "#ffffff",
    topbarBg: isDarkMode ? "#1b1d20" : "#f8f9fb",
    headerBg: isDarkMode ? "#1b1e22" : "#ffffff",
    subBg: isDarkMode ? "#1b1e22" : "#dfe3e8",
    inputBg: isDarkMode ? "#101215" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#111111",
    textStrong: isDarkMode ? "#ffffff" : "#111111",
    textSoft: isDarkMode ? "rgba(255,255,255,0.82)" : "#374151",
    textMuted: isDarkMode ? "rgba(255,255,255,0.58)" : "#6b7280",
    textFaint: isDarkMode ? "rgba(255,255,255,0.45)" : "#9ca3af",
    border: isDarkMode ? "rgba(255,255,255,0.08)" : "#d1d5db",
    emptyBg: isDarkMode ? "#121417" : "#f8fafc",
    navBg: isDarkMode ? "#17191d" : "#e5e7eb",
    navText: isDarkMode ? "rgba(255,255,255,0.55)" : "#4b5563",
    navActiveBg: isDarkMode ? "#1b1e22" : "#111827",
    navActiveText: isDarkMode ? "#ffffff" : "#ffffff",
    secondaryBtnBg: isDarkMode ? "#252a31" : "#e5e7eb",
    secondaryBtnText: isDarkMode ? "#ffffff" : "#111111",
    pillBg: isDarkMode ? "#1f2c3b" : "#dbeafe",
    pillText: isDarkMode ? "#56a8ff" : "#1d4ed8",
    badgeBg: isDarkMode ? "rgba(86,168,255,0.14)" : "#dbeafe",
    badgeText: isDarkMode ? "#56a8ff" : "#1d4ed8",
    mappingBg: isDarkMode ? "rgba(155,107,255,0.16)" : "#ede9fe",
    mappingText: isDarkMode ? "#c7a7ff" : "#6d28d9",
    slotAvailableBg: isDarkMode ? "rgba(45,143,82,0.08)" : "#dfece6",
    slotBookedBg: isDarkMode ? "rgba(86,168,255,0.12)" : "#dbe4f0",
    slotBlockedBg: isDarkMode ? "rgba(210,77,87,0.12)" : "#eedddd",
    slotMutedBg: isDarkMode ? "#15171a" : "#eef2f7",
    tabBg: isDarkMode ? "#252a31" : "#e5e7eb",
    tabText: isDarkMode ? "rgba(255,255,255,0.75)" : "#374151",
    timeColBg: isDarkMode ? "#17191d" : "#ffffff",
    metricBg: isDarkMode ? "#17191d" : "#ffffff",
    calendarBg: isDarkMode ? "#17191d" : "#ffffff"
  };

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
        .filter(
          (item) => item.day === day.key && item.clinic === selectedClinic
        )
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
        `Staff efficiency alert: Only ${rosterForDay.length} staff member is rostered for ${days.find((d) => d.key === selectedDay)?.label} with ${dayAppointments.length} appointments.`
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

  const buildSentNotification = () => {
    const now = "2026-03-27 09:30";
    const prefix = notificationMethod === "Email" ? "MAIL" : "SMS";
    const logRef = `${prefix}-${Date.now().toString().slice(-5)}`;

    return createNotification(
      notificationMethod,
      sendConfirmation,
      sendPreparation,
      includeFormLink,
      "Sent",
      now,
      logRef
    );
  };

  const sendNotificationForAppointment = (
    appointmentId: number,
    reason: "booking" | "reschedule" | "manual"
  ) => {
    const notification = buildSentNotification();

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              notification
            }
          : item
      )
    );

    const prefix =
      reason === "booking"
        ? "Booking notification sent."
        : reason === "reschedule"
        ? "Reschedule notification sent."
        : "Appointment notification sent.";

    setNotificationMessage(
      `${prefix} ${notification.method} confirmation${
        notification.preparationEnabled ? " with preparation instructions" : ""
      }${notification.formLinkEnabled ? " and pre-study form link" : ""}.`
    );
  };

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
              resource: rescheduleResource
            }
          : item
      )
    );

    setMessage(
      `Appointment rescheduled to ${rescheduleDay.toUpperCase()} at ${rescheduleTime} in ${rescheduleResource}.`
    );

    sendNotificationForAppointment(selectedAppointment.id, "reschedule");
  };

  const handleToday = () => {
    setSelectedDay("mon");
  };

  const handleRegisterStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStaffMessage("");

    if (!staffName.trim() || !staffCapabilities.trim()) {
      setStaffMessage("Please complete all required staff fields.");
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
    setStaffMessage("Staff profile registered successfully.");
  };

  const handleSendSelectedNotification = () => {
    if (!selectedAppointment) return;
    sendNotificationForAppointment(selectedAppointment.id, "manual");
  };

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingMessage("");

    if (!newPatient.trim()) {
      setBookingMessage("Please enter patient name.");
      return;
    }

    const blocked = blockedSlots.some(
      (slot) =>
        slot.clinic === newClinic &&
        slot.day === newDay &&
        slot.time === newTime &&
        slot.resource === newResource
    );

    if (blocked) {
      setBookingMessage("Selected slot is blocked.");
      return;
    }

    const resourceBusy = appointments.some(
      (item) =>
        item.clinic === newClinic &&
        item.day === newDay &&
        item.time === newTime &&
        item.resource === newResource
    );

    if (resourceBusy) {
      setBookingMessage("Selected room or machine is already booked.");
      return;
    }

    const staffBusy = appointments.some(
      (item) =>
        item.day === newDay &&
        item.time === newTime &&
        item.staff === newStaff
    );

    if (staffBusy) {
      setBookingMessage("Selected staff member is already allocated.");
      return;
    }

    const clinicianBusy = appointments.some(
      (item) =>
        item.day === newDay &&
        item.time === newTime &&
        item.clinician === newClinician
    );

    if (clinicianBusy) {
      setBookingMessage("Selected clinician is already allocated.");
      return;
    }

    const notification = buildSentNotification();

    const newAppointment: Appointment = {
      id: Date.now(),
      day: newDay,
      time: newTime,
      clinic: newClinic,
      resource: newResource,
      patient: newPatient.trim(),
      type: newStudyType,
      status: "Booked",
      staff: newStaff,
      clinician: newClinician,
      notification
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setSelectedAppointmentId(newAppointment.id);
    setSelectedClinic(newClinic);
    setSelectedDay(newDay);

    setBookingMessage(
      `Appointment booked successfully for ${newPatient}. ${notification.method} notification sent.`
    );
    setNotificationMessage(
      `Booking notification sent. ${notification.method} confirmation${
        notification.preparationEnabled ? " with preparation instructions" : ""
      }${notification.formLinkEnabled ? " and pre-study form link" : ""}.`
    );

    setNewPatient("");
    setNewStudyType("Consult");
    setNewClinic("Main Clinic");
    setNewDay("mon");
    setNewTime("08:00");
    setNewResource("Room 1");
    setNewStaff("Sarah Miles");
    setNewClinician("Dr Olivia Kent");
  };

  const themedSecondaryButton: React.CSSProperties = {
    ...styles.secondaryButton,
    background: theme.secondaryBtnBg,
    color: theme.secondaryBtnText,
    border: `1px solid ${theme.border}`
  };

  return (
    <div
      style={{
        ...styles.page,
        background: theme.pageBg,
        color: theme.text
      }}
    >
      <div
        style={{
          ...styles.topbar,
          background: theme.topbarBg,
          borderBottom: `1px solid ${theme.border}`,
          color: theme.text
        }}
      >
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={{ ...styles.brand, color: theme.textStrong }}>EsyRIS</div>
          <div style={{ ...styles.topbarText, color: theme.textMuted }}>
            Scheduler / Roster Module
          </div>
        </div>

        <div style={styles.topbarRight}>
          <button type="button" style={themedSecondaryButton} onClick={handleToday}>
            Today
          </button>
          <button type="button" style={themedSecondaryButton}>
            New Booking
          </button>
          <button type="button" style={themedSecondaryButton}>
            Reschedule
          </button>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: isDarkMode ? "#252a31" : "#e5e7eb",
              color: isDarkMode ? "#ffffff" : "#111111",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {isDarkMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          <div
            style={{
              ...styles.topInfoPill,
              background: theme.pillBg,
              color: theme.pillText,
              border: `1px solid ${theme.border}`
            }}
          >
            Clinic: {selectedClinic}
          </div>
          <div
            style={{
              ...styles.topInfoPill,
              background: theme.pillBg,
              color: theme.pillText,
              border: `1px solid ${theme.border}`
            }}
          >
            Slots: {dayStats.available} Available
          </div>
          <div style={styles.userPill}>Scheduler</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside
          style={{
            ...styles.sidebar,
            background: theme.sidebarBg,
            borderRight: `1px solid ${theme.border}`
          }}
        >
          <div
            style={{
              ...styles.sidebarHeader,
              borderBottom: `1px solid ${theme.border}`
            }}
          >
            <div style={styles.sidebarTitle}>SCHEDULING</div>
            <div style={{ ...styles.sidebarSub, color: theme.textMuted }}>
              Calendar, roster, mapping, conflict management and notifications
            </div>
          </div>

          <div style={styles.filterSection}>
            <div style={{ ...styles.filterLabel, color: theme.textStrong }}>Clinic</div>
            {clinics.map((clinic) => (
              <div
                key={clinic}
                onClick={() => setSelectedClinic(clinic)}
                style={
                  selectedClinic === clinic
                    ? {
                        ...styles.navItemActive,
                        background: theme.navActiveBg,
                        color: theme.navActiveText,
                        border: `1px solid ${theme.border}`
                      }
                    : {
                        ...styles.navItem,
                        background: theme.navBg,
                        color: theme.navText
                      }
                }
              >
                {clinic}
              </div>
            ))}
          </div>

          <div style={styles.filterSection}>
            <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
              Room / Machine
            </div>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value as Resource | "All")}
              style={{
                ...styles.select,
                background: theme.inputBg,
                color: theme.textStrong,
                border: `1px solid ${theme.border}`
              }}
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
            <div style={{ ...styles.filterLabel, color: theme.textStrong }}>Modality</div>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value as Modality)}
              style={{
                ...styles.select,
                background: theme.inputBg,
                color: theme.textStrong,
                border: `1px solid ${theme.border}`
              }}
            >
              {modalities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterSection}>
            <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
              Slot Display
            </div>
            <select
              value={selectedSlotView}
              onChange={(e) => setSelectedSlotView(e.target.value as SlotView)}
              style={{
                ...styles.select,
                background: theme.inputBg,
                color: theme.textStrong,
                border: `1px solid ${theme.border}`
              }}
            >
              {slotViewOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterSection}>
            <div style={{ ...styles.filterLabel, color: theme.textStrong }}>Search</div>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                color: theme.textStrong,
                border: `1px solid ${theme.border}`
              }}
              placeholder="Search patient, staff or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div
            style={{
              ...styles.infoBox,
              background: theme.panelBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div style={styles.infoTitle}>Access Rule</div>
            <div style={{ ...styles.infoText, color: theme.textMuted }}>
              Reception staff can access calendars across clinics while
              remaining assigned to at least one clinic.
            </div>
          </div>

          <div
            style={{
              ...styles.statusCard,
              background: theme.panelBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div style={{ ...styles.statusTitle, color: theme.textSoft }}>Legend</div>

            <div style={{ ...styles.statusRow, color: theme.textMuted }}>
              <span style={styles.dotGreen} />
              <span>Available Slot</span>
            </div>

            <div style={{ ...styles.statusRow, color: theme.textMuted }}>
              <span style={styles.dotBlue} />
              <span>Booked Appointment</span>
            </div>

            <div style={{ ...styles.statusRow, color: theme.textMuted }}>
              <span style={styles.dotRed} />
              <span>Blocked / Conflict</span>
            </div>

            <div style={{ ...styles.statusRow, color: theme.textMuted }}>
              <span style={styles.dotPurple} />
              <span>Roster / Mapping Info</span>
            </div>
          </div>
        </aside>

        <main
          style={{
            ...styles.main,
            background: theme.mainBg,
            color: theme.text
          }}
        >
          <div
            style={{
              ...styles.headerPanel,
              background: theme.headerBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div>
              <div style={styles.kicker}>SCHEDULING & RESOURCE MANAGEMENT</div>
              <h1 style={{ ...styles.pageTitle, color: theme.textStrong }}>
                Appointment Calendar, Booking and Notifications
              </h1>
              <p style={{ ...styles.pageSub, color: theme.textMuted }}>
                New booking, appointment calendar visibility, rescheduling,
                resource-aware scheduling, staff allocation, and automated patient
                notification workflow.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button type="button" style={themedSecondaryButton}>
                Export
              </button>
              <button type="button" style={styles.primaryButton}>
                Quick Book
              </button>
            </div>
          </div>

          <div style={styles.metricsRow}>
            {[
              { label: "Clinic", value: selectedClinic, small: true },
              { label: "Available", value: String(dayStats.available) },
              { label: "Booked", value: String(dayStats.booked) },
              { label: "Rostered Staff", value: String(rosterForDay.length) }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.metricCard,
                  background: theme.metricBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ ...styles.metricLabel, color: theme.textMuted }}>
                  {item.label}
                </div>
                <div
                  style={
                    item.small
                      ? { ...styles.metricValueSmall, color: theme.textStrong }
                      : { ...styles.metricValue, color: theme.textStrong }
                  }
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {(detectedConflicts.length > 0 || intelligentAlerts.length > 0) && (
            <div style={styles.alertGrid}>
              <section
                style={{
                  ...styles.alertPanel,
                  background: theme.panelBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ ...styles.alertTitle, color: theme.textStrong }}>
                  Resource Conflict Detection
                </div>
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

              <section
                style={{
                  ...styles.alertPanel,
                  background: theme.panelBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ ...styles.alertTitle, color: theme.textStrong }}>
                  Intelligent Scheduling Alerts
                </div>
                {intelligentAlerts.length === 0 ? (
                  <div style={styles.alertOk}>
                    No inefficiency alerts detected.
                  </div>
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

          <div style={styles.bottomGrid}>
            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                New Booking Panel
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Create a new appointment and trigger appointment notification on success.
              </div>

              <form onSubmit={handleCreateBooking} style={{ marginTop: 14 }}>
                <div style={styles.bookingGrid}>
                  <input
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Patient Name"
                    value={newPatient}
                    onChange={(e) => setNewPatient(e.target.value)}
                  />

                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={newStudyType}
                    onChange={(e) => setNewStudyType(e.target.value)}
                  >
                    <option>Consult</option>
                    <option>CT</option>
                    <option>Ultrasound</option>
                    <option>Review</option>
                    <option>Follow-up</option>
                  </select>

                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value as Clinic)}
                  >
                    {clinics.map((clinic) => (
                      <option key={clinic} value={clinic}>
                        {clinic}
                      </option>
                    ))}
                  </select>

                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayKey)}
                  >
                    {days.map((day) => (
                      <option key={day.key} value={day.key}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>

                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value as Resource)}
                  >
                    {resources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>

                  <input
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Assigned Staff"
                    value={newStaff}
                    onChange={(e) => setNewStaff(e.target.value)}
                  />

                  <input
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Clinician"
                    value={newClinician}
                    onChange={(e) => setNewClinician(e.target.value)}
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.primaryButton}>
                    Confirm Booking
                  </button>
                </div>
              </form>

              {bookingMessage ? <div style={styles.message}>{bookingMessage}</div> : null}
            </section>

            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Appointment Notification
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Trigger confirmation, preparation instructions and pre-study form links.
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={styles.notificationGrid}>
                  <div>
                    <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
                      Notification Method
                    </div>
                    <select
                      value={notificationMethod}
                      onChange={(e) =>
                        setNotificationMethod(e.target.value as NotificationMethod)
                      }
                      style={{
                        ...styles.select,
                        background: theme.inputBg,
                        color: theme.textStrong,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      {notificationMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.toggleColumn}>
                    <label style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={sendConfirmation}
                        onChange={(e) => setSendConfirmation(e.target.checked)}
                      />
                      <span style={{ color: theme.textStrong }}>Send Confirmation</span>
                    </label>

                    <label style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={sendPreparation}
                        onChange={(e) => setSendPreparation(e.target.checked)}
                      />
                      <span style={{ color: theme.textStrong }}>
                        Send Preparation Instructions
                      </span>
                    </label>

                    <label style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={includeFormLink}
                        onChange={(e) => setIncludeFormLink(e.target.checked)}
                      />
                      <span style={{ color: theme.textStrong }}>
                        Include Pre-Study Form Link
                      </span>
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.summaryBox,
                    background: theme.emptyBg,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                    <span>Selected Patient</span>
                    <strong>{selectedAppointment?.patient || "-"}</strong>
                  </div>
                  <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                    <span>Current Method</span>
                    <strong>{selectedAppointment?.notification.method || "-"}</strong>
                  </div>
                  <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                    <span>Delivery Status</span>
                    <strong>{selectedAppointment?.notification.status || "-"}</strong>
                  </div>
                  <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                    <span>Last Sent</span>
                    <strong>{selectedAppointment?.notification.lastSentAt || "-"}</strong>
                  </div>
                  <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                    <span>Gateway Log</span>
                    <strong>{selectedAppointment?.notification.logRef || "-"}</strong>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={handleSendSelectedNotification}
                  >
                    Send Notification
                  </button>
                </div>

                {notificationMessage ? (
                  <div style={styles.message}>{notificationMessage}</div>
                ) : null}
              </div>
            </section>
          </div>

          <div
            style={{
              ...styles.calendarPanel,
              background: theme.calendarBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div
              style={{
                ...styles.calendarHeader,
                borderBottom: `1px solid ${theme.border}`
              }}
            >
              <div>
                <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                  Appointment Calendar
                </div>
                <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                  Calendar visibility across clinics, modalities, rooms, and
                  slot states with filters.
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.dayTabs,
                borderBottom: `1px solid ${theme.border}`
              }}
            >
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDay(day.key)}
                  style={
                    selectedDay === day.key
                      ? styles.dayTabActive
                      : {
                          ...styles.dayTab,
                          background: theme.tabBg,
                          color: theme.tabText,
                          border: `1px solid ${theme.border}`
                        }
                  }
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div style={styles.calendarGridWrap}>
              <div style={styles.calendarGrid}>
                <div
                  style={{
                    ...styles.gridHeaderTime,
                    background: theme.subBg,
                    borderBottom: `1px solid ${theme.border}`,
                    borderRight: `1px solid ${theme.border}`,
                    color: theme.textSoft
                  }}
                >
                  Time
                </div>
                {days.map((day) => (
                  <div
                    key={day.key}
                    style={{
                      ...styles.gridHeaderDay,
                      background: theme.subBg,
                      borderBottom: `1px solid ${theme.border}`,
                      borderRight: `1px solid ${theme.border}`,
                      color: theme.textSoft
                    }}
                  >
                    {day.label}
                  </div>
                ))}

                {timeSlots.map((time) => (
                  <React.Fragment key={time}>
                    <div
                      style={{
                        ...styles.timeCell,
                        background: theme.timeColBg,
                        borderBottom: `1px solid ${theme.border}`,
                        borderRight: `1px solid ${theme.border}`,
                        color: theme.textMuted
                      }}
                    >
                      {time}
                    </div>

                    {days.map((day) => {
                      const slot = getSlotData(day.key, time);

                      if (!shouldShowSlot(slot.state)) {
                        return (
                          <div
                            key={`${day.key}-${time}`}
                            style={{
                              ...styles.slotCell,
                              background: theme.slotMutedBg,
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight: `1px solid ${theme.border}`,
                              opacity: 0.7
                            }}
                          >
                            <div
                              style={{
                                ...styles.slotMeta,
                                color: theme.textFaint
                              }}
                            >
                              Filtered
                            </div>
                          </div>
                        );
                      }

                      if (slot.state === "booked") {
                        return (
                          <div
                            key={`${day.key}-${time}`}
                            style={{
                              ...styles.slotCell,
                              background: theme.slotBookedBg,
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight: `1px solid ${theme.border}`,
                              ...(selectedDay === day.key
                                ? styles.slotSelectedOutline
                                : {})
                            }}
                          >
                            <div
                              style={{
                                ...styles.slotTitle,
                                color: theme.textStrong
                              }}
                            >
                              {slot.data.patient}
                            </div>
                            <div
                              style={{
                                ...styles.slotMeta,
                                color: theme.textMuted
                              }}
                            >
                              {slot.data.type} • {slot.data.resource}
                            </div>
                            <div
                              style={{
                                ...styles.slotMetaSmall,
                                color: theme.textFaint
                              }}
                            >
                              {slot.data.clinician}
                            </div>
                          </div>
                        );
                      }

                      if (slot.state === "blocked") {
                        return (
                          <div
                            key={`${day.key}-${time}`}
                            style={{
                              ...styles.slotCell,
                              background: theme.slotBlockedBg,
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight: `1px solid ${theme.border}`,
                              ...(selectedDay === day.key
                                ? styles.slotSelectedOutline
                                : {})
                            }}
                          >
                            <div
                              style={{
                                ...styles.slotTitle,
                                color: theme.textStrong
                              }}
                            >
                              Blocked
                            </div>
                            <div
                              style={{
                                ...styles.slotMeta,
                                color: theme.textMuted
                              }}
                            >
                              {slot.data.resource}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`${day.key}-${time}`}
                          style={{
                            ...styles.slotCell,
                            background: theme.slotAvailableBg,
                            borderBottom: `1px solid ${theme.border}`,
                            borderRight: `1px solid ${theme.border}`,
                            ...(selectedDay === day.key
                              ? styles.slotSelectedOutline
                              : {})
                          }}
                        >
                          <div
                            style={{
                              ...styles.slotTitle,
                              color: theme.textStrong
                            }}
                          >
                            Available
                          </div>
                          <div
                            style={{
                              ...styles.slotMeta,
                              color: theme.textMuted
                            }}
                          >
                            {selectedResource === "All"
                              ? "Open Slot"
                              : selectedResource}
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
            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Appointment Rescheduling
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Reschedule while maintaining resource and staff availability.
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
                  Select Appointment
                </div>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) =>
                    setSelectedAppointmentId(Number(e.target.value))
                  }
                  style={{
                    ...styles.select,
                    background: theme.inputBg,
                    color: theme.textStrong,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  {appointments
                    .filter((item) => item.clinic === selectedClinic)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.patient} • {item.day.toUpperCase()} {item.time} •{" "}
                        {item.resource}
                      </option>
                    ))}
                </select>
              </div>

              <div style={styles.rescheduleGrid}>
                <div>
                  <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
                    New Day
                  </div>
                  <select
                    value={rescheduleDay}
                    onChange={(e) => setRescheduleDay(e.target.value as DayKey)}
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    {days.map((day) => (
                      <option key={day.key} value={day.key}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
                    New Time
                  </div>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ ...styles.filterLabel, color: theme.textStrong }}>
                    Resource
                  </div>
                  <select
                    value={rescheduleResource}
                    onChange={(e) =>
                      setRescheduleResource(e.target.value as Resource)
                    }
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    {resources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  ...styles.summaryBox,
                  background: theme.emptyBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Selected Patient</span>
                  <strong>{selectedAppointment?.patient || "-"}</strong>
                </div>
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Current Slot</span>
                  <strong>
                    {selectedAppointment
                      ? `${selectedAppointment.day.toUpperCase()} ${selectedAppointment.time}`
                      : "-"}
                  </strong>
                </div>
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Conflict Check</span>
                  <strong>
                    {canReschedule ? "Clear" : "Conflict Detected"}
                  </strong>
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={themedSecondaryButton}>
                  Cancel
                </button>
                <button
                  type="button"
                  style={
                    canReschedule ? styles.primaryButton : styles.disabledButton
                  }
                  onClick={handleReschedule}
                >
                  Confirm Reschedule
                </button>
              </div>

              {message ? <div style={styles.message}>{message}</div> : null}
            </section>

            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Staff Availability & Roster
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Staff assigned to the selected clinic/day with access visibility.
              </div>

              <div style={{ marginTop: 14 }}>
                {rosterForDay.length === 0 ? (
                  <div
                    style={{
                      ...styles.emptyState,
                      background: theme.emptyBg,
                      color: theme.textMuted
                    }}
                  >
                    No staff rostered for this day.
                  </div>
                ) : (
                  rosterForDay.map((staff) => (
                    <div
                      key={staff.id}
                      style={{
                        ...styles.listRow,
                        borderBottom: `1px solid ${theme.border}`
                      }}
                    >
                      <div>
                        <div
                          style={{ ...styles.listTitle, color: theme.textStrong }}
                        >
                          {staff.name}
                        </div>
                        <div style={{ ...styles.listMeta, color: theme.textMuted }}>
                          {staff.role} • {staff.shift}
                        </div>
                        <div
                          style={{
                            ...styles.slotMetaSmall,
                            color: theme.textFaint
                          }}
                        >
                          Access: {staff.assignedClinics.join(", ")}
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.badgeBooked,
                          background: theme.badgeBg,
                          color: theme.badgeText
                        }}
                      >
                        {staff.available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Clinic-Room-Machine Mapping
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Mapping configuration used for scheduling logic.
              </div>

              <div style={{ marginTop: 14 }}>
                {mappingForClinic.map((mapItem, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.listRow,
                      borderBottom: `1px solid ${theme.border}`
                    }}
                  >
                    <div>
                      <div
                        style={{ ...styles.listTitle, color: theme.textStrong }}
                      >
                        {mapItem.room}
                      </div>
                      <div style={{ ...styles.listMeta, color: theme.textMuted }}>
                        {mapItem.machine} • {mapItem.modality}
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.mappingBadge,
                        background: theme.mappingBg,
                        color: theme.mappingText
                      }}
                    >
                      {mapItem.modality}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Selected Day Appointments
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                {days.find((d) => d.key === selectedDay)?.label} •{" "}
                {selectedClinic}
              </div>

              <div style={{ marginTop: 14 }}>
                {dayAppointments.length === 0 ? (
                  <div
                    style={{
                      ...styles.emptyState,
                      background: theme.emptyBg,
                      color: theme.textMuted
                    }}
                  >
                    No appointments for this selection.
                  </div>
                ) : (
                  dayAppointments.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.listRow,
                        borderBottom: `1px solid ${theme.border}`
                      }}
                    >
                      <div>
                        <div
                          style={{ ...styles.listTitle, color: theme.textStrong }}
                        >
                          {item.patient}
                        </div>
                        <div style={{ ...styles.listMeta, color: theme.textMuted }}>
                          {item.time} • {item.type} • {item.clinician}
                        </div>
                        <div
                          style={{
                            ...styles.slotMetaSmall,
                            color: theme.textFaint
                          }}
                        >
                          Notification: {item.notification.status} • {item.notification.method}
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.badgeBooked,
                          background: theme.badgeBg,
                          color: theme.badgeText
                        }}
                      >
                        {item.resource}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                Staff Registration
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Register staff profiles with role, location, day, and
                capabilities.
              </div>

              <form onSubmit={handleRegisterStaff} style={{ marginTop: 14 }}>
                <div style={styles.staffGrid}>
                  <input
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Staff Name"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                  />
                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                  >
                    <option value="Receptionist">Receptionist</option>
                    <option value="Technical Staff">Technical Staff</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <select
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
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
                    style={{
                      ...styles.select,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
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
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Shift"
                    value={staffShift}
                    onChange={(e) => setStaffShift(e.target.value)}
                  />
                  <input
                    style={{
                      ...styles.input,
                      background: theme.inputBg,
                      color: theme.textStrong,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Capabilities"
                    value={staffCapabilities}
                    onChange={(e) => setStaffCapabilities(e.target.value)}
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.primaryButton}>
                    Register Staff
                  </button>
                </div>
              </form>

              {staffMessage ? (
                <div style={styles.message}>{staffMessage}</div>
              ) : null}
            </section>

            <section
              style={{
                ...styles.panel,
                background: theme.panelBg,
                border: `1px solid ${theme.border}`
              }}
            >
              <div style={{ ...styles.panelTitle, color: theme.textStrong }}>
                SMS Gateway Log Summary
              </div>
              <div style={{ ...styles.panelSub, color: theme.textMuted }}>
                Evidence-style visibility for booking notification activity.
              </div>

              <div
                style={{
                  ...styles.summaryBox,
                  background: theme.emptyBg,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Selected Patient</span>
                  <strong>{selectedAppointment?.patient || "-"}</strong>
                </div>
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Notification Method</span>
                  <strong>{selectedAppointment?.notification.method || "-"}</strong>
                </div>
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Status</span>
                  <strong>{selectedAppointment?.notification.status || "-"}</strong>
                </div>
                <div style={{ ...styles.summaryRow, color: theme.textStrong }}>
                  <span>Log Reference</span>
                  <strong>{selectedAppointment?.notification.logRef || "-"}</strong>
                </div>
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
    fontWeight: 700,
    color: "#ffffff"
  },

  topbarText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)"
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end"
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

  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)"
  },

  navItemActive: {
    padding: "10px 12px",
    background: "#1b1e22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  navItem: {
    padding: "10px 12px",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    borderRadius: 6,
    cursor: "pointer",
    background: "#17191d"
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

  infoBox: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 12
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#56a8ff",
    marginBottom: 8
  },

  infoText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.62)"
  },

  statusCard: {
    marginTop: "auto",
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

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  dotPurple: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#9b6bff",
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
    gap: 10,
    alignItems: "center"
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

  disabledButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#1b3a27",
    color: "rgba(255,255,255,0.45)",
    fontWeight: 600,
    cursor: "not-allowed"
  },

  metricsRow: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14
  },

  metricCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 16
  },

  metricLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 8
  },

  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff"
  },

  metricValueSmall: {
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff"
  },

  alertGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18
  },

  alertPanel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12
  },

  alertError: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(210,77,87,0.14)",
    color: "#f08b8b",
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 1.5
  },

  alertWarn: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(196,145,49,0.14)",
    color: "#f2cb74",
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 1.5
  },

  alertOk: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(45,143,82,0.14)",
    color: "#7fd19a",
    fontSize: 13
  },

  calendarPanel: {
    marginTop: 18,
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    overflow: "hidden"
  },

  calendarHeader: {
    padding: 18,
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff"
  },

  panelSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)"
  },

  dayTabs: {
    display: "flex",
    gap: 10,
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap"
  },

  dayTab: {
    height: 36,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontWeight: 600
  },

  dayTabActive: {
    height: 36,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(86,168,255,0.25)",
    background: "#1f2c3b",
    color: "#56a8ff",
    cursor: "pointer",
    fontWeight: 700
  },

  calendarGridWrap: {
    overflowX: "auto",
    padding: 14
  },

  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "90px repeat(5, minmax(170px, 1fr))",
    minWidth: 960
  },

  gridHeaderTime: {
    padding: "12px 10px",
    background: "#1b1e22",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)"
  },

  gridHeaderDay: {
    padding: "12px 10px",
    background: "#1b1e22",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)"
  },

  timeCell: {
    minHeight: 58,
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    fontSize: 12,
    color: "rgba(255,255,255,0.58)",
    background: "#17191d"
  },

  slotCell: {
    minHeight: 58,
    padding: "8px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    background: "#17191d",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  slotSelectedOutline: {
    boxShadow: "inset 2px 0 0 #56a8ff"
  },

  slotTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff"
  },

  slotMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 3
  },

  slotMetaSmall: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    marginTop: 3
  },

  bottomGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18
  },

  panel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18
  },

  emptyState: {
    padding: 18,
    borderRadius: 8,
    background: "#121417",
    color: "rgba(255,255,255,0.5)",
    fontSize: 14
  },

  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },

  listTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff"
  },

  listMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4
  },

  badgeBooked: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },

  mappingBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(155,107,255,0.16)",
    color: "#c7a7ff",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap"
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

  rescheduleGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12
  },

  staffGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },

  bookingGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },

  notificationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start"
  },

  toggleColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingTop: 26
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13
  },

  formActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 16
  },

  message: {
    marginTop: 14,
    fontSize: 13,
    color: "#53c27a"
  }
};
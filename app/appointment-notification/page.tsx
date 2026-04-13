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

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";
const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";
const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

function SectionHeader({
  title,
  sub,
  right
}: {
  title: string;
  sub: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="text-[15px] font-extrabold text-white">{title}</div>
        <div className="mt-0.5 text-[12px] text-white/55">{sub}</div>
      </div>
      {right}
    </div>
  );
}

export default function SchedulerBookingNotificationPage() {
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

  const badgeStatusClass = (status: NotificationStatus) => {
    if (status === "Sent") return "bg-emerald-500/15 text-emerald-300";
    if (status === "Queued") return "bg-amber-500/15 text-amber-300";
    if (status === "Failed") return "bg-rose-500/15 text-rose-300";
    return "bg-slate-500/20 text-slate-200";
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          APPOINTMENT NOTIFICATION • CLINIC {selectedClinic.toUpperCase()} • AVAILABLE {dayStats.available} • BOOKED {dayStats.booked}
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-neutral-900">
          ⌄
        </button>
      </div>

      <div className="h-[calc(100vh-44px)] overflow-hidden p-2">
        <div className="flex h-full min-h-0 flex-col gap-2">
          <div className={`${panelClass} px-4 py-3`}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="EsyRIS logo"
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold tracking-[2px] text-[#1da4ff]">
                    APPOINTMENT NOTIFICATION
                  </div>
                  <div className="truncate text-[16px] font-extrabold">
                    Compact Booking & Notification Console
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                  Clinic: {selectedClinic}
                </div>
                <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                  Method: {notificationMethod}
                </div>
                <button className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                  Export
                </button>
                <button className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold">
                  Save
                </button>
              </div>
            </div>
          </div>

          {(message || bookingMessage || notificationMessage || staffMessage) && (
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              {message ? (
                <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-semibold text-emerald-300">
                  {message}
                </div>
              ) : null}
              {bookingMessage ? (
                <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-semibold text-emerald-300">
                  {bookingMessage}
                </div>
              ) : null}
              {notificationMessage ? (
                <div className="rounded-xl border border-sky-700/30 bg-sky-500/15 px-4 py-2 text-[13px] font-semibold text-sky-300">
                  {notificationMessage}
                </div>
              ) : null}
              {staffMessage ? (
                <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-semibold text-emerald-300">
                  {staffMessage}
                </div>
              ) : null}
            </div>
          )}

          {(detectedConflicts.length > 0 || intelligentAlerts.length > 0) && (
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              <div className={`${panelClass} p-3`}>
                <div className="mb-2 text-[13px] font-extrabold">
                  Resource Conflict Detection
                </div>
                {detectedConflicts.length === 0 ? (
                  <div className="rounded-xl bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-300">
                    No active conflicts detected.
                  </div>
                ) : (
                  detectedConflicts.map((alert, index) => (
                    <div
                      key={index}
                      className="mb-2 rounded-xl bg-rose-500/15 px-3 py-2 text-[12px] text-rose-300"
                    >
                      {alert}
                    </div>
                  ))
                )}
              </div>

              <div className={`${panelClass} p-3`}>
                <div className="mb-2 text-[13px] font-extrabold">
                  Intelligent Scheduling Alerts
                </div>
                {intelligentAlerts.length === 0 ? (
                  <div className="rounded-xl bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-300">
                    No inefficiency alerts detected.
                  </div>
                ) : (
                  intelligentAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="mb-2 rounded-xl bg-amber-500/15 px-3 py-2 text-[12px] text-amber-300"
                    >
                      {alert}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[0.8fr_1.32fr_0.88fr]">
            <aside className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Filters"
                sub="Clinic, modality and slot visibility"
                right={
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    {dayStats.available} open
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col gap-3 overflow-y-auto pr-1">
                <div>
                  <label className={labelClass}>Clinic</label>
                  <div className="space-y-2">
                    {clinics.map((clinic) => (
                      <button
                        key={clinic}
                        type="button"
                        onClick={() => setSelectedClinic(clinic)}
                        className={`w-full rounded-[18px] border px-3 py-2 text-left text-[13px] ${
                          selectedClinic === clinic
                            ? "border-sky-500/45 bg-[#0b213f] font-bold text-sky-300"
                            : "border-[#143a5c] bg-[#071427] text-white"
                        }`}
                      >
                        {clinic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Room / Machine</label>
                  <select
                    value={selectedResource}
                    onChange={(e) =>
                      setSelectedResource(e.target.value as Resource | "All")
                    }
                    className={selectClass}
                  >
                    <option value="All">All Resources</option>
                    {resources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Modality</label>
                  <select
                    value={selectedModality}
                    onChange={(e) => setSelectedModality(e.target.value as Modality)}
                    className={selectClass}
                  >
                    {modalities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Slot Display</label>
                  <select
                    value={selectedSlotView}
                    onChange={(e) => setSelectedSlotView(e.target.value as SlotView)}
                    className={selectClass}
                  >
                    {slotViewOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Search</label>
                  <input
                    className={inputClass}
                    placeholder="Search patient, staff or resource..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
                  <div className="mb-1 text-[13px] font-extrabold text-[#59b7ff]">
                    Access Rule
                  </div>
                  <div className="text-[12px] leading-6 text-white/72">
                    Reception staff can access calendars across clinics while remaining assigned to at least one clinic.
                  </div>
                </div>
              </div>
            </aside>

            <section className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Calendar & Booking"
                sub="Appointment visibility, quick booking and notification-ready slots"
                right={
                  <div className="inline-flex h-8 items-center rounded-full bg-sky-500/15 px-3 text-[12px] font-bold text-sky-300">
                    {dayStats.booked} booked
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col gap-3 overflow-hidden">
                <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedDay(day.key)}
                        className={`h-9 rounded-2xl px-4 text-[13px] font-bold ${
                          selectedDay === day.key
                            ? "border border-sky-500/45 bg-[#0b213f] text-sky-300"
                            : "border border-[#284a73] bg-[#0d1830] text-white/80"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  <div className="h-[420px] min-h-0 overflow-auto rounded-[16px] border border-[#143a5c] bg-[#081321]">
                    <div className="grid min-w-[760px] grid-cols-[72px_repeat(5,minmax(120px,1fr))]">
                      <div className="sticky top-0 z-20 border-b border-r border-[#143a5c] bg-[#091427] px-2 py-2 text-[11px] font-extrabold">
                        Time
                      </div>
                      {days.map((day) => (
                        <div
                          key={day.key}
                          className="sticky top-0 z-20 border-b border-r border-[#143a5c] bg-[#091427] px-2 py-2 text-[11px] font-extrabold"
                        >
                          {day.label}
                        </div>
                      ))}

                      {timeSlots.map((time) => (
                        <React.Fragment key={time}>
                          <div className="min-h-[46px] border-b border-r border-[#143a5c] bg-[#071427] px-2 py-2 text-[11px] text-white/65">
                            {time}
                          </div>

                          {days.map((day) => {
                            const slot = getSlotData(day.key, time);

                            if (!shouldShowSlot(slot.state)) {
                              return (
                                <div
                                  key={`${day.key}-${time}`}
                                  className="flex min-h-[46px] flex-col justify-center border-b border-r border-[#143a5c] bg-[#0a1120] px-2 py-2 opacity-70"
                                >
                                  <div className="text-[10px] text-white/40">Filtered</div>
                                </div>
                              );
                            }

                            if (slot.state === "booked") {
                              return (
                                <div
                                  key={`${day.key}-${time}`}
                                  className="flex min-h-[46px] flex-col justify-center border-b border-r border-[#143a5c] bg-sky-500/10 px-2 py-2"
                                >
                                  <div className="text-[11px] font-extrabold">
                                    {slot.data.patient}
                                  </div>
                                  <div className="mt-1 text-[10px] text-white/65">
                                    {slot.data.type} • {slot.data.resource}
                                  </div>
                                  <div className="mt-1 text-[9px] text-white/45">
                                    {slot.data.clinician}
                                  </div>
                                </div>
                              );
                            }

                            if (slot.state === "blocked") {
                              return (
                                <div
                                  key={`${day.key}-${time}`}
                                  className="flex min-h-[46px] flex-col justify-center border-b border-r border-[#143a5c] bg-rose-500/10 px-2 py-2"
                                >
                                  <div className="text-[11px] font-extrabold">
                                    Blocked
                                  </div>
                                  <div className="mt-1 text-[10px] text-white/65">
                                    {slot.data.resource}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={`${day.key}-${time}`}
                                className="flex min-h-[46px] flex-col justify-center border-b border-r border-[#143a5c] bg-emerald-500/10 px-2 py-2"
                              >
                                <div className="text-[11px] font-extrabold">
                                  Available
                                </div>
                                <div className="mt-1 text-[10px] text-white/65">
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

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                    <div className="mb-2 text-[14px] font-extrabold">
                      New Booking Panel
                    </div>
                    <form onSubmit={handleCreateBooking}>
                      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Patient Name"
                          value={newPatient}
                          onChange={(e) => setNewPatient(e.target.value)}
                        />

                        <select
                          className={selectClass}
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
                          className={selectClass}
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
                          className={selectClass}
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
                          className={selectClass}
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
                          className={selectClass}
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
                          className={inputClass}
                          placeholder="Assigned Staff"
                          value={newStaff}
                          onChange={(e) => setNewStaff(e.target.value)}
                        />

                        <input
                          className={inputClass}
                          placeholder="Clinician"
                          value={newClinician}
                          onChange={(e) => setNewClinician(e.target.value)}
                        />
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>

            <aside className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Notification Console"
                sub="Trigger confirmations, preparation and form links"
                right={
                  <div className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-bold ${badgeStatusClass(selectedAppointment?.notification.status || "Not Sent")}`}>
                    {selectedAppointment?.notification.status || "Not Sent"}
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col gap-3 overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                    <div className="mb-2 text-[14px] font-extrabold">
                      Appointment Notification
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Notification Method</label>
                        <select
                          value={notificationMethod}
                          onChange={(e) =>
                            setNotificationMethod(e.target.value as NotificationMethod)
                          }
                          className={selectClass}
                        >
                          {notificationMethods.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-3 text-[13px] text-white/82">
                        <input
                          type="checkbox"
                          checked={sendConfirmation}
                          onChange={(e) => setSendConfirmation(e.target.checked)}
                        />
                        <span>Send Confirmation</span>
                      </label>

                      <label className="flex items-center gap-3 text-[13px] text-white/82">
                        <input
                          type="checkbox"
                          checked={sendPreparation}
                          onChange={(e) => setSendPreparation(e.target.checked)}
                        />
                        <span>Send Preparation Instructions</span>
                      </label>

                      <label className="flex items-center gap-3 text-[13px] text-white/82">
                        <input
                          type="checkbox"
                          checked={includeFormLink}
                          onChange={(e) => setIncludeFormLink(e.target.checked)}
                        />
                        <span>Include Pre-Study Form Link</span>
                      </label>
                    </div>

                    <div className="mt-3 rounded-[18px] border border-[#143a5c] bg-[#081321] p-3">
                      {[
                        ["Selected Patient", selectedAppointment?.patient || "-"],
                        ["Current Method", selectedAppointment?.notification.method || "-"],
                        ["Delivery Status", selectedAppointment?.notification.status || "-"],
                        ["Last Sent", selectedAppointment?.notification.lastSentAt || "-"],
                        ["Gateway Log", selectedAppointment?.notification.logRef || "-"]
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between gap-2 border-b border-[#143a5c] py-2 text-[13px] text-white/80"
                        >
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSendSelectedNotification}
                        className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
                      >
                        Send Notification
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                    <div className="mb-2 text-[14px] font-extrabold">
                      Appointment Rescheduling
                    </div>

                    <div className="mb-3">
                      <label className={labelClass}>Select Appointment</label>
                      <select
                        value={selectedAppointmentId}
                        onChange={(e) =>
                          setSelectedAppointmentId(Number(e.target.value))
                        }
                        className={selectClass}
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

                    <div className="grid grid-cols-1 gap-3">
                      <select
                        value={rescheduleDay}
                        onChange={(e) => setRescheduleDay(e.target.value as DayKey)}
                        className={selectClass}
                      >
                        {days.map((day) => (
                          <option key={day.key} value={day.key}>
                            {day.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className={selectClass}
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rescheduleResource}
                        onChange={(e) =>
                          setRescheduleResource(e.target.value as Resource)
                        }
                        className={selectClass}
                      >
                        {resources.map((resource) => (
                          <option key={resource} value={resource}>
                            {resource}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 rounded-[18px] border border-[#143a5c] bg-[#081321] p-3">
                      {[
                        ["Selected Patient", selectedAppointment?.patient || "-"],
                        [
                          "Current Slot",
                          selectedAppointment
                            ? `${selectedAppointment.day.toUpperCase()} ${selectedAppointment.time}`
                            : "-"
                        ],
                        ["Conflict Check", canReschedule ? "Clear" : "Conflict Detected"]
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between gap-2 border-b border-[#143a5c] py-2 text-[13px] text-white/80"
                        >
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReschedule}
                        className={`h-9 rounded-2xl px-5 text-[14px] font-extrabold ${
                          canReschedule
                            ? "bg-[#00a96e] text-white"
                            : "cursor-not-allowed bg-[#314052] text-white/50"
                        }`}
                      >
                        Confirm Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
            <section className={`${panelClass} p-3`}>
              <div className="mb-2 text-[14px] font-extrabold">
                Staff Availability & Roster
              </div>
              {rosterForDay.length === 0 ? (
                <div className="rounded-xl bg-[#081321] px-3 py-3 text-[12px] text-white/55">
                  No staff rostered for this day.
                </div>
              ) : (
                rosterForDay.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between gap-2 border-b border-[#143a5c] py-3"
                  >
                    <div>
                      <div className="text-[12px] font-extrabold">{staff.name}</div>
                      <div className="mt-1 text-[11px] text-white/58">
                        {staff.role} • {staff.shift}
                      </div>
                      <div className="mt-1 text-[10px] text-white/42">
                        Access: {staff.assignedClinics.join(", ")}
                      </div>
                    </div>
                    <div className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                      {staff.available ? "Available" : "Unavailable"}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className={`${panelClass} p-3`}>
              <div className="mb-2 text-[14px] font-extrabold">
                Clinic-Room-Machine Mapping
              </div>
              {mappingForClinic.map((mapItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 border-b border-[#143a5c] py-3"
                >
                  <div>
                    <div className="text-[12px] font-extrabold">{mapItem.room}</div>
                    <div className="mt-1 text-[11px] text-white/58">
                      {mapItem.machine} • {mapItem.modality}
                    </div>
                  </div>
                  <div className="rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-bold text-violet-300">
                    {mapItem.modality}
                  </div>
                </div>
              ))}
            </section>

            <section className={`${panelClass} p-3`}>
              <div className="mb-2 text-[14px] font-extrabold">
                Selected Day Appointments
              </div>
              {dayAppointments.length === 0 ? (
                <div className="rounded-xl bg-[#081321] px-3 py-3 text-[12px] text-white/55">
                  No appointments for this selection.
                </div>
              ) : (
                dayAppointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 border-b border-[#143a5c] py-3"
                  >
                    <div>
                      <div className="text-[12px] font-extrabold">{item.patient}</div>
                      <div className="mt-1 text-[11px] text-white/58">
                        {item.time} • {item.type} • {item.clinician}
                      </div>
                      <div className="mt-1 text-[10px] text-white/42">
                        Notification: {item.notification.status} • {item.notification.method}
                      </div>
                    </div>
                    <div className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                      {item.resource}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className={`${panelClass} p-3`}>
            <div className="mb-2 text-[14px] font-extrabold">Staff Registration</div>
            <form onSubmit={handleRegisterStaff}>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-6">
                <input
                  className={inputClass}
                  placeholder="Staff Name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
                <select
                  className={selectClass}
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Technical Staff">Technical Staff</option>
                  <option value="Radiologist">Radiologist</option>
                  <option value="Admin">Admin</option>
                </select>
                <select
                  className={selectClass}
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
                  className={selectClass}
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
                  className={inputClass}
                  placeholder="Shift"
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Capabilities"
                  value={staffCapabilities}
                  onChange={(e) => setStaffCapabilities(e.target.value)}
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
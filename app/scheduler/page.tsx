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

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";
const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";
const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

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
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          SCHEDULER • CLINIC {selectedClinic.toUpperCase()} • AVAILABLE {dayStats.available} • BOOKED {dayStats.booked}
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[13px] font-bold text-[#222]">
          v
        </button>
      </div>

      <div className="h-[calc(100vh-44px)] overflow-hidden p-2">
        <div className={`${panelClass} mb-2 flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="logo"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <div className="text-[11px] font-extrabold tracking-[2px] text-[#1da4ff]">
                SCHEDULER / ROSTER
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Appointment Calendar
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Clinic: {selectedClinic}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Open: {dayStats.available}
            </div>
            <button className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Today
            </button>
            <button className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              New Booking
            </button>
            <button className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold">
              Quick Book
            </button>
          </div>
        </div>

        {(detectedConflicts.length > 0 || intelligentAlerts.length > 0) && (
          <div className="mb-2 grid grid-cols-1 gap-2 xl:grid-cols-2">
            <div className={`${panelClass} p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">Conflicts</div>
              {detectedConflicts.length === 0 ? (
                <div className="rounded-xl bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-300">
                  No active conflicts
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
              <div className="mb-2 text-[13px] font-extrabold">Scheduling Alerts</div>
              {intelligentAlerts.length === 0 ? (
                <div className="rounded-xl bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-300">
                  No inefficiency alerts
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

        <div className="grid h-[calc(100%-76px)] grid-cols-1 gap-2 xl:grid-cols-[0.82fr_1.35fr_0.83fr]">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2">
              <div className="text-[15px] font-extrabold">Filters</div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Fast scheduling controls
              </div>
            </div>

            <div className="mb-3">
              <div className="mb-1 text-[11px] font-semibold text-white/78">Clinic</div>
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

            <div className="mb-3">
              <label className={labelClass}>Resource</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value as Resource | "All")}
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

            <div className="mb-3">
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

            <div className="mb-3">
              <label className={labelClass}>Slot View</label>
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

            <div className="mb-3">
              <label className={labelClass}>Search</label>
              <input
                className={inputClass}
                placeholder="Search patient, staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mb-3 rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-1 text-[13px] font-extrabold text-[#59b7ff]">
                Access Rule
              </div>
              <div className="text-[12px] leading-6 text-white/72">
                Reception staff can access calendars across clinics while remaining assigned to at least one clinic.
              </div>
            </div>

            <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-2 text-[14px] font-extrabold">Legend</div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d8f52]" />
                <span>Available</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#56a8ff]" />
                <span>Booked</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d24d57]" />
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9b6bff]" />
                <span>Mapping / Roster</span>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2">
              <div className="text-[15px] font-extrabold">Appointment Calendar</div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Compact calendar with slot visibility and filters
              </div>
            </div>

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

            <div className="min-h-0 flex-1 overflow-auto rounded-[18px] border border-[#143a5c] bg-[#071427]">
              <div className="grid min-w-[760px] grid-cols-[72px_repeat(5,minmax(120px,1fr))]">
                <div className="border-b border-r border-[#143a5c] bg-[#091427] px-2 py-2 text-[11px] font-extrabold">
                  Time
                </div>
                {days.map((day) => (
                  <div
                    key={day.key}
                    className="border-b border-r border-[#143a5c] bg-[#091427] px-2 py-2 text-[11px] font-extrabold"
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
                            <div className="text-[11px] font-extrabold">{slot.data.patient}</div>
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
                            <div className="text-[11px] font-extrabold">Blocked</div>
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
                          <div className="text-[11px] font-extrabold">Available</div>
                          <div className="mt-1 text-[10px] text-white/65">
                            {selectedResource === "All" ? "Open Slot" : selectedResource}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] px-3 py-2">
                <div className="text-[11px] text-white/55">Available</div>
                <div className="mt-1 text-[15px] font-extrabold">{dayStats.available}</div>
              </div>
              <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] px-3 py-2">
                <div className="text-[11px] text-white/55">Booked</div>
                <div className="mt-1 text-[15px] font-extrabold">{dayStats.booked}</div>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2">
              <div className="text-[15px] font-extrabold">Actions & Summary</div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Reschedule, roster, mapping and registration
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Reschedule</div>

                <div className="mb-3">
                  <div className={labelClass}>Appointment</div>
                  <select
                    value={selectedAppointmentId}
                    onChange={(e) => setSelectedAppointmentId(Number(e.target.value))}
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

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                  <div>
                    <div className={labelClass}>Day</div>
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
                  </div>

                  <div>
                    <div className={labelClass}>Time</div>
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
                  </div>

                  <div>
                    <div className={labelClass}>Resource</div>
                    <select
                      value={rescheduleResource}
                      onChange={(e) => setRescheduleResource(e.target.value as Resource)}
                      className={selectClass}
                    >
                      {resources.map((resource) => (
                        <option key={resource} value={resource}>
                          {resource}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 rounded-[18px] border border-[#143a5c] bg-[#081321] p-3">
                  {[
                    ["Patient", selectedAppointment?.patient || "-"],
                    [
                      "Current",
                      selectedAppointment
                        ? `${selectedAppointment.day.toUpperCase()} ${selectedAppointment.time}`
                        : "-"
                    ],
                    ["Check", canReschedule ? "Clear" : "Conflict"]
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
                    className={`h-9 rounded-2xl px-5 text-[14px] font-extrabold ${
                      canReschedule
                        ? "bg-[#00a96e] text-white"
                        : "cursor-not-allowed bg-[#314052] text-white/50"
                    }`}
                    onClick={handleReschedule}
                  >
                    Confirm
                  </button>
                </div>

                {message ? (
                  <div className="mt-2 text-[12px] font-bold text-emerald-300">
                    {message}
                  </div>
                ) : null}
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Staff Roster</div>
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
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Room / Machine Mapping</div>
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
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Selected Day Appointments</div>
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
                      </div>
                      <div className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                        {item.resource}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Staff Registration</div>
                <form onSubmit={handleRegisterStaff}>
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
                      Register
                    </button>
                  </div>
                </form>

                {staffMessage ? (
                  <div className="mt-2 text-[12px] font-bold text-emerald-300">
                    {staffMessage}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Filter Summary</div>
                {[
                  ["Clinic", selectedClinic],
                  ["Resource", selectedResource],
                  ["Modality", selectedModality],
                  ["Day", days.find((d) => d.key === selectedDay)?.label || "-"],
                  ["Slot View", selectedSlotView]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-2 border-b border-[#143a5c] py-2 text-[13px] text-white/80"
                  >
                    <span>{label}</span>
                    <strong>{String(value)}</strong>
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
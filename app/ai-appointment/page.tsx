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
              (s.clinic === selectedClinic || s.assignedClinics.includes(selectedClinic)) &&
              s.day === day.key &&
              s.capabilities.includes(selectedModality)
          );
          if (possibleStaff.length === 0) return;

          const staffChoice = possibleStaff[0];
          const clinicianChoice =
            possibleStaff.find((s) => s.role === "Radiologist")?.name || staffChoice.name;

          const staffBusy = appointments.some(
            (a) => a.day === day.key && a.time === time && a.staff === staffChoice.name
          );
          if (staffBusy) return;

          const clinicianBusy = appointments.some(
            (a) => a.day === day.key && a.time === time && a.clinician === clinicianChoice
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

    return list.sort((a, b) => b.score - a.score).slice(0, 8);
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
      `Booking created for ${patientName.trim()} on ${rec.dayLabel} at ${rec.time}. Notification: ${notificationMethod}.`
    );
    setPatientName("");
    setSelectedRecommendation(null);
  };

  const summaryRows = [
    ["Suggestions", recommendations.length],
    ["Bookings", appointments.length],
    ["Preferred Day", preferredDay === "Any" ? "Any Day" : getDayLabel(preferredDay)],
    ["Preferred Time", preferredTime],
    ["Notification", notificationMethod]
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          ADMIN • AI APPOINTMENT • CLINIC {selectedClinic.toUpperCase()} • MODALITY {selectedModality.toUpperCase()} • ACTIVE {appointments.length}
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
                    AI APPOINTMENT
                  </div>
                  <div className="truncate text-[16px] font-extrabold">
                    Compact Appointment Recommendation
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                  Clinic: {selectedClinic}
                </div>
                <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
                  Modality: {selectedModality}
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

          {message ? (
            <div className="rounded-xl border border-[rgba(45,143,82,0.28)] bg-[rgba(45,143,82,0.14)] px-4 py-2 text-[13px] font-semibold text-[#7fd19a]">
              {message}
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[320px_minmax(0,1.3fr)_360px]">
            <aside className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Booking Inputs"
                sub="Compact patient and scheduling preferences"
                right={
                  <div className="rounded-full bg-[rgba(0,169,110,0.16)] px-3 py-1 text-xs font-bold text-[#44d08c]">
                    {recommendations.length} shown
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col gap-3 overflow-y-auto pr-1">
                <div className="grid gap-3">
                  <div>
                    <label className={labelClass}>Patient Name</label>
                    <input
                      className={inputClass}
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Search or enter patient"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Clinic</label>
                      <select
                        className={selectClass}
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
                      <label className={labelClass}>Modality</label>
                      <select
                        className={selectClass}
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Preferred Day</label>
                      <select
                        className={selectClass}
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
                      <label className={labelClass}>Preferred Time</label>
                      <select
                        className={selectClass}
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
                  </div>

                  <div>
                    <label className={labelClass}>Notification</label>
                    <select
                      className={selectClass}
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

                <div className="rounded-xl border border-[rgba(54,112,190,0.18)] bg-[#071427] p-3">
                  <div className="mb-2 text-[12px] font-extrabold text-white">
                    Engine Logic
                  </div>
                  <div className="space-y-2 text-[12px] text-white/72">
                    {[
                      ["#2d8f52", "Resource availability"],
                      ["#56a8ff", "Staff / clinician availability"],
                      ["#9b6bff", "Efficient scheduling gap"],
                      ["#d24d57", "Conflict avoidance"]
                    ].map(([color, text]) => (
                      <div key={text} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(54,112,190,0.18)] bg-[#071427] p-3">
                  <div className="mb-2 text-[12px] font-extrabold text-[#59b7ff]">
                    Quick Summary
                  </div>
                  <div className="space-y-2">
                    {summaryRows.map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="flex items-center justify-between gap-3 border-b border-[rgba(54,112,190,0.12)] pb-2 text-[12px] text-white/78 last:border-b-0 last:pb-0"
                      >
                        <span>{label}</span>
                        <strong className="text-white">{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Recommended Slots"
                sub="Dense ranked list with sticky action bar"
                right={
                  <div className="inline-flex h-8 items-center rounded-full bg-[rgba(41,120,255,0.18)] px-3 text-[12px] font-bold text-[#56a8ff]">
                    AI Ranked
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {recommendations.length === 0 ? (
                      <div className="rounded-xl border border-[rgba(54,112,190,0.18)] bg-[#071427] p-4 text-[13px] text-white/55">
                        No suitable recommendations found.
                      </div>
                    ) : (
                      recommendations.map((rec, index) => {
                        const active = selectedRecommendation === rec.id;

                        return (
                          <button
                            key={`${rec.id}-${index}`}
                            type="button"
                            onClick={() => setSelectedRecommendation(rec.id)}
                            className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-[rgba(26,154,255,0.45)] bg-[#0b213f]"
                                : "border-[rgba(54,112,190,0.18)] bg-[#071427] hover:bg-[#0b1d36]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[14px] font-extrabold">
                                  #{index + 1} • {rec.dayLabel} • {rec.time}
                                </div>
                                <div className="mt-1 text-[12px] text-white/60">
                                  {rec.clinic} • {rec.resource}
                                </div>
                                <div className="mt-1 text-[12px] text-white/60">
                                  Staff: {rec.staff} • Clinician: {rec.clinician}
                                </div>
                              </div>
                              <div className="rounded-full bg-[rgba(45,143,82,0.18)] px-3 py-1 text-[12px] font-bold text-[#53c27a]">
                                Score {rec.score}
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {rec.reasons.map((reason, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-[rgba(86,168,255,0.14)] px-3 py-1 text-[11px] font-semibold text-[#56a8ff]"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[rgba(54,112,190,0.12)] pt-3">
                  <div className="text-[12px] text-white/55">
                    Select a slot to create booking
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center rounded-xl bg-[#00a96e] px-4 text-[14px] font-extrabold text-white transition hover:bg-[#00b97a]"
                    onClick={applyRecommendation}
                  >
                    Apply Recommended Slot
                  </button>
                </div>
              </div>
            </section>

            <aside className={`${panelClass} min-h-0 overflow-hidden p-3`}>
              <SectionHeader
                title="Audit Visibility"
                sub="Recommendations, occupancy and active bookings"
                right={
                  <div className="inline-flex h-8 items-center rounded-full bg-[rgba(45,143,82,0.18)] px-3 text-[12px] font-bold text-[#53c27a]">
                    {appointments.length}
                  </div>
                }
              />

              <div className="flex h-[calc(100%-44px)] min-h-0 flex-col gap-3 overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-[rgba(54,112,190,0.18)] bg-[#071427] p-3">
                  <div className="mb-2 text-[12px] font-extrabold text-white">
                    Existing Bookings
                  </div>
                  <div className="space-y-2">
                    {appointments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 border-b border-[rgba(54,112,190,0.12)] pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-extrabold">
                            {item.patient}
                          </div>
                          <div className="mt-1 text-[12px] text-white/58">
                            {getDayLabel(item.day)} • {item.time} • {item.modality}
                          </div>
                          <div className="mt-1 text-[12px] text-white/50">
                            {item.staff} • {item.clinician}
                          </div>
                        </div>
                        <div className="rounded-full bg-[rgba(86,168,255,0.14)] px-3 py-1 text-[11px] font-bold text-[#56a8ff]">
                          {item.resource}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(54,112,190,0.18)] bg-[#071427] p-3">
                  <div className="mb-3 text-[12px] font-extrabold text-white">
                    Status Overview
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[rgba(54,112,190,0.12)] bg-[#0a1830] p-3">
                      <div className="text-[11px] text-white/55">Clinic</div>
                      <div className="mt-1 text-[14px] font-extrabold">{selectedClinic}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(54,112,190,0.12)] bg-[#0a1830] p-3">
                      <div className="text-[11px] text-white/55">Modality</div>
                      <div className="mt-1 text-[14px] font-extrabold">{selectedModality}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(54,112,190,0.12)] bg-[#0a1830] p-3">
                      <div className="text-[11px] text-white/55">Notify</div>
                      <div className="mt-1 text-[14px] font-extrabold">{notificationMethod}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(54,112,190,0.12)] bg-[#0a1830] p-3">
                      <div className="text-[11px] text-white/55">Selected</div>
                      <div className="mt-1 text-[14px] font-extrabold">
                        {selectedRecommendation ? "Ready" : "None"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 items-center rounded-full bg-[rgba(41,120,255,0.18)] px-3 text-[12px] font-bold text-[#56a8ff]">
                    Role-Based Active
                  </div>
                  <div className="inline-flex h-8 items-center rounded-full bg-[rgba(210,77,87,0.16)] px-3 text-[12px] font-bold text-[#ff8a94]">
                    Conflicts Blocked
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
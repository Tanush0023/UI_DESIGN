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
    resources: [{ id: 1, name: "Room S1", type: "Consult Room", status: "Inactive" }]
  }
];

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";

const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";

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
    setForm((prev) => ({ ...prev, [field]: value }));
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
  const activeResources = form.resources.filter((r) => r.status === "Active").length;

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          CLINIC SETUP • ACTIVE {activeCount} • INACTIVE {inactiveCount} • ONLINE {visibleCount}
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
              alt="EsyRIS logo"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <div className="text-[11px] font-extrabold tracking-[2px] text-[#1da4ff]">
                CLINIC CONFIGURATION
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Clinic Setup Admin
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Clinic: {selectedClinic.code}
            </div>
            <div
              className={`inline-flex h-9 items-center rounded-2xl px-4 text-[13px] font-bold ${
                selectedClinic.status === "Active"
                  ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                  : "border border-rose-700/30 bg-rose-500/15 text-rose-300"
              }`}
            >
              Status: {selectedClinic.status}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Booking: {selectedClinic.bookingEnabled ? "On" : "Off"}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Online: {selectedClinic.onlineVisible ? "Visible" : "Hidden"}
            </div>
            <button className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Export
            </button>
            <button
              form="clinic-form"
              type="submit"
              className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
            >
              Save
            </button>
          </div>
        </div>

        {message ? (
          <div className="mb-2 rounded-2xl border border-emerald-700/30 bg-emerald-500/15 px-4 py-2 text-[13px] font-bold text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="grid h-[calc(100%-76px)] grid-cols-1 gap-2 xl:grid-cols-[1.02fr_1.18fr_0.78fr]">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Clinic Directory</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Fast search and one-click selection
                </div>
              </div>
              <div className="inline-flex h-7 items-center rounded-full bg-emerald-500/15 px-3 text-[11px] font-extrabold text-emerald-300">
                {filteredClinics.length} shown
              </div>
            </div>

            <div className="mb-2">
              <input
                className={inputClass}
                placeholder="Search clinic name, email, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredClinics.map((clinic) => (
                <button
                  key={clinic.id}
                  type="button"
                  onClick={() => setSelectedId(clinic.id)}
                  className={`flex w-full items-start justify-between rounded-[20px] border px-3 py-3 text-left ${
                    clinic.id === selectedId
                      ? "border-sky-500/45 bg-[#0b213f]"
                      : "border-[#143a5c] bg-[#071427]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-extrabold">
                      {clinic.name}
                    </div>
                    <div className="mt-1 text-[12px] text-white/62">
                      {clinic.code} • {clinic.type}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-white/55">
                      {clinic.email}
                    </div>
                  </div>

                  <div className="ml-3 flex flex-col items-end gap-2">
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                      {clinic.code}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        clinic.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {clinic.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Selected Clinic</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Compact edit form with inline actions
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Timezone: {form.timezone}
                </span>
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Resources: {totalResources}
                </span>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFieldChange("bookingEnabled", !form.bookingEnabled)}
                className={`h-9 rounded-2xl px-4 text-[13px] font-bold ${
                  form.bookingEnabled
                    ? "border border-sky-600/30 bg-[#0f2746] text-sky-300"
                    : "border border-slate-700/40 bg-[#111b2f] text-white"
                }`}
              >
                {form.bookingEnabled ? "Booking On" : "Booking Off"}
              </button>

              <button
                type="button"
                onClick={() => handleFieldChange("onlineVisible", !form.onlineVisible)}
                className={`h-9 rounded-2xl px-4 text-[13px] font-bold ${
                  form.onlineVisible
                    ? "border border-sky-600/30 bg-[#0f2746] text-sky-300"
                    : "border border-slate-700/40 bg-[#111b2f] text-white"
                }`}
              >
                {form.onlineVisible ? "Online Visible" : "Online Hidden"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFieldChange(
                    "status",
                    form.status === "Active" ? "Inactive" : "Active"
                  )
                }
                className={`h-9 rounded-2xl px-4 text-[13px] font-bold ${
                  form.status === "Active"
                    ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                    : "border border-rose-700/30 bg-rose-500/15 text-rose-300"
                }`}
              >
                {form.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>

            <form id="clinic-form" onSubmit={handleSave} className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>Clinic Name</label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Clinic Code</label>
                  <input
                    className={inputClass}
                    value={form.code}
                    onChange={(e) => handleFieldChange("code", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Clinic Type</label>
                  <input
                    className={inputClass}
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
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
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Operating Hours</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(Object.entries(form.hours) as [keyof Hours, string][]).map(
                    ([day, value]) => (
                      <div key={day}>
                        <label className={labelClass}>{day.toUpperCase()}</label>
                        <input
                          className={inputClass}
                          value={value}
                          onChange={(e) => handleHoursChange(day, e.target.value)}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className={labelClass}>Notes</label>
                <textarea
                  className="min-h-[84px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[14px] text-white outline-none"
                  value={form.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                />
              </div>
            </form>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Clinic Summary</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Current setup and visibility
                </div>
              </div>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-500/15 text-[12px] font-extrabold text-emerald-300">
                {activeResources}
              </div>
            </div>

            <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
              {[
                ["Selected", selectedClinic.name],
                ["Code", selectedClinic.code],
                ["Type", selectedClinic.type],
                ["Status", selectedClinic.status],
                ["Booking", selectedClinic.bookingEnabled ? "Enabled" : "Disabled"],
                ["Online", selectedClinic.onlineVisible ? "Visible" : "Hidden"]
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

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-2 text-[14px] font-extrabold">Resources</div>
              <div className="space-y-2">
                {form.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-extrabold">
                          {resource.name}
                        </div>
                        <div className="mt-1 text-[12px] text-white/55">
                          {resource.type}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleResourceStatus(resource.id)}
                        className={`h-8 rounded-xl px-3 text-[11px] font-bold text-white ${
                          resource.status === "Active"
                            ? "bg-[#8d6a1d]"
                            : "bg-[#2d8f52]"
                        }`}
                      >
                        {resource.status === "Active" ? "Disable" : "Enable"}
                      </button>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          resource.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {resource.status}
                      </span>
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
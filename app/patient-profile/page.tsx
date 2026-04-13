"use client";

import React, { useEffect, useMemo, useState } from "react";

type PatientStatus = "Active" | "Inactive";
type Gender = "Female" | "Male" | "Other";
type MedicareStatus = "Verified" | "Pending" | "Failed";
type YesNo = "Yes" | "No";
type PreStudyFormStatus = "Completed" | "Pending" | "Not Sent";
type SmsNotification = "Enabled" | "Disabled";

type Patient = {
  id: number;
  mrn: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: PatientStatus;
  lastUpdated: string;
  medicareNumber: string;
  medicareExpiry: string;
  medicareStatus: MedicareStatus;
  referralLinked: YesNo;
  referralSource: string;
  preStudyFormStatus: PreStudyFormStatus;
  smsNotification: SmsNotification;
  notes: string;
};

type AuditEntry = {
  id: number;
  patientId: number;
  timestamp: string;
  user: string;
  action: string;
  field: string;
  before: string;
  after: string;
};

const patientsSeed: Patient[] = [
  {
    id: 1,
    mrn: "MRN-10248",
    patientId: "PT-000124",
    firstName: "Susan",
    lastName: "Hall",
    dob: "1960-04-12",
    gender: "Female",
    phone: "0412 555 901",
    email: "susan.hall@email.com",
    address: "43 Arpenter Drive, Baldivis WA 6171",
    emergencyContact: "David Hall",
    emergencyPhone: "0412 111 222",
    status: "Active",
    lastUpdated: "2026-03-26 14:22",
    medicareNumber: "2123 45678 1",
    medicareExpiry: "2027-08",
    medicareStatus: "Verified",
    referralLinked: "Yes",
    referralSource: "Dr Helen Morris",
    preStudyFormStatus: "Completed",
    smsNotification: "Enabled",
    notes: "Prefers morning appointments. Requires SMS reminder."
  },
  {
    id: 2,
    mrn: "MRN-10491",
    patientId: "PT-000191",
    firstName: "Robert",
    lastName: "Lang",
    dob: "1981-08-09",
    gender: "Male",
    phone: "0400 100 200",
    email: "robert.lang@email.com",
    address: "9 Winton Street, Perth WA 6000",
    emergencyContact: "Nina Lang",
    emergencyPhone: "0400 200 300",
    status: "Active",
    lastUpdated: "2026-03-25 11:08",
    medicareNumber: "4456 90871 2",
    medicareExpiry: "2026-11",
    medicareStatus: "Pending",
    referralLinked: "Yes",
    referralSource: "Digital Referral",
    preStudyFormStatus: "Pending",
    smsNotification: "Enabled",
    notes: "Booked for follow-up imaging."
  },
  {
    id: 3,
    mrn: "MRN-10877",
    patientId: "PT-000237",
    firstName: "Amy",
    lastName: "Song",
    dob: "1992-01-17",
    gender: "Female",
    phone: "0422 909 808",
    email: "amy.song@email.com",
    address: "72 Greenhill Ave, Fremantle WA 6160",
    emergencyContact: "J. Song",
    emergencyPhone: "0422 111 444",
    status: "Inactive",
    lastUpdated: "2026-03-24 09:47",
    medicareNumber: "7788 32019 4",
    medicareExpiry: "2025-12",
    medicareStatus: "Failed",
    referralLinked: "No",
    referralSource: "Not linked",
    preStudyFormStatus: "Not Sent",
    smsNotification: "Disabled",
    notes: "Insurance details pending."
  }
];

const auditSeed: AuditEntry[] = [
  {
    id: 1,
    patientId: 1,
    timestamp: "2026-03-26 14:22",
    user: "Booking User",
    action: "Updated mobile number",
    field: "phone",
    before: "0412 555 900",
    after: "0412 555 901"
  },
  {
    id: 2,
    patientId: 1,
    timestamp: "2026-03-25 16:05",
    user: "Registration User",
    action: "Updated address",
    field: "address",
    before: "41 Arpenter Drive, Baldivis WA 6171",
    after: "43 Arpenter Drive, Baldivis WA 6171"
  },
  {
    id: 3,
    patientId: 1,
    timestamp: "2026-03-24 10:18",
    user: "System",
    action: "Profile created",
    field: "-",
    before: "-",
    after: "-"
  },
  {
    id: 4,
    patientId: 2,
    timestamp: "2026-03-25 11:08",
    user: "Booking User",
    action: "Updated patient notes",
    field: "notes",
    before: "Booked for imaging.",
    after: "Booked for follow-up imaging."
  },
  {
    id: 5,
    patientId: 3,
    timestamp: "2026-03-24 09:47",
    user: "Registration User",
    action: "Changed status",
    field: "status",
    before: "Active",
    after: "Inactive"
  }
];

type EditablePatientField =
  | "firstName"
  | "lastName"
  | "dob"
  | "gender"
  | "phone"
  | "email"
  | "address"
  | "emergencyContact"
  | "emergencyPhone"
  | "status"
  | "medicareNumber"
  | "medicareExpiry"
  | "medicareStatus"
  | "referralLinked"
  | "referralSource"
  | "preStudyFormStatus"
  | "smsNotification"
  | "notes";

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";

const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

export default function PatientProfilePage() {
  const [patients, setPatients] = useState<Patient[]>(patientsSeed);
  const [audits, setAudits] = useState<AuditEntry[]>(auditSeed);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [message, setMessage] = useState("");

  const selectedPatient =
    patients.find((patient) => patient.id === selectedId) ?? patients[0];

  const [form, setForm] = useState<Patient>(selectedPatient);

  useEffect(() => {
    setForm(selectedPatient);
    setMessage("");
  }, [selectedPatient]);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((patient) => {
      const text =
        `${patient.firstName} ${patient.lastName} ${patient.mrn} ${patient.patientId} ${patient.phone} ${patient.email}`.toLowerCase();
      return text.includes(q);
    });
  }, [patients, search]);

  const patientAudits = useMemo(() => {
    return audits
      .filter((entry) => entry.patientId === selectedId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [audits, selectedId]);

  const handleChange = <K extends EditablePatientField>(
    field: K,
    value: Patient[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const oldPatient = patients.find((p) => p.id === selectedId);
    if (!oldPatient) return;

    const trackedFields: EditablePatientField[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "emergencyContact",
      "emergencyPhone",
      "status",
      "medicareNumber",
      "medicareExpiry",
      "medicareStatus",
      "referralLinked",
      "referralSource",
      "preStudyFormStatus",
      "smsNotification",
      "notes"
    ];

    const changedFields = trackedFields.filter(
      (field) => String(oldPatient[field] || "") !== String(form[field] || "")
    );

    const now = "2026-03-27 09:30";

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === selectedId
          ? {
              ...form,
              lastUpdated: now
            }
          : patient
      )
    );

    if (changedFields.length > 0) {
      const newAuditEntries: AuditEntry[] = changedFields.map((field, index) => ({
        id: Date.now() + index,
        patientId: selectedId,
        timestamp: now,
        user: "Registration User",
        action: `Updated ${field}`,
        field,
        before: String(oldPatient[field] || "-"),
        after: String(form[field] || "-")
      }));

      setAudits((prev) => [...newAuditEntries, ...prev]);
      setMessage("Patient profile updated successfully.");
    } else {
      setMessage("No changes detected.");
    }
  };

  const activeCount = patients.filter((p) => p.status === "Active").length;
  const inactiveCount = patients.filter((p) => p.status === "Inactive").length;

  const medicareClass =
    selectedPatient.medicareStatus === "Verified"
      ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
      : selectedPatient.medicareStatus === "Pending"
      ? "border border-amber-700/30 bg-amber-500/15 text-amber-300"
      : "border border-rose-700/30 bg-rose-500/15 text-rose-300";

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          PATIENT PROFILE • ACTIVE {activeCount} • INACTIVE {inactiveCount} • AUDIT {patientAudits.length}
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
                PATIENT PROFILE
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Profile Management
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              ID: {selectedPatient.patientId}
            </div>
            <div className={`inline-flex h-9 items-center rounded-2xl px-4 text-[13px] font-bold ${medicareClass}`}>
              Medicare: {selectedPatient.medicareStatus}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Referral: {selectedPatient.referralLinked}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Form: {selectedPatient.preStudyFormStatus}
            </div>
            <button
              type="button"
              className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]"
            >
              Export
            </button>
            <button
              type="submit"
              form="patient-profile-form"
              className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
            >
              Save
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`mb-2 rounded-2xl px-4 py-2 text-[13px] font-bold ${
              message.includes("successfully")
                ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                : "border border-slate-700/30 bg-slate-500/10 text-slate-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid h-[calc(100%-76px)] grid-cols-1 gap-2 xl:grid-cols-[1.02fr_1.18fr_0.78fr]">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Patient Search</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Select profile quickly
                </div>
              </div>
              <div className="inline-flex h-7 items-center rounded-full bg-emerald-500/15 px-3 text-[11px] font-extrabold text-emerald-300">
                {filteredPatients.length} shown
              </div>
            </div>

            <div className="mb-2">
              <input
                className={inputClass}
                placeholder="MRN, patient ID, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedId(patient.id)}
                  className={`w-full rounded-[20px] border px-3 py-3 text-left ${
                    selectedId === patient.id
                      ? "border-sky-500/45 bg-[#0b213f]"
                      : "border-[#143a5c] bg-[#071427]"
                  }`}
                >
                  <div className="text-[14px] font-extrabold">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="mt-1 text-[12px] text-white/62">{patient.patientId}</div>
                  <div className="mt-0.5 text-[12px] text-white/55">{patient.mrn}</div>
                  <div className="mt-0.5 text-[12px] text-white/55">{patient.phone}</div>
                </button>
              ))}
            </div>

            <div className="mt-2 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-2 text-[14px] font-extrabold">Overview</div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d8f52]" />
                <span>{activeCount} Active Patients</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d24d57]" />
                <span>{inactiveCount} Inactive Patients</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#56a8ff]" />
                <span>{patientAudits.length} Audit Entries</span>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Selected Patient</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Demographics, referral, Medicare, and onboarding details
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  MRN: {selectedPatient.mrn}
                </span>
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Updated: {selectedPatient.lastUpdated}
                </span>
              </div>
            </div>

            <form
              id="patient-profile-form"
              onSubmit={handleSave}
              className="min-h-0 flex-1 overflow-y-auto pr-1"
            >
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    className={inputClass}
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    className={inputClass}
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Patient ID</label>
                  <input className={inputClass} value={form.patientId} disabled />
                </div>

                <div>
                  <label className={labelClass}>MRN</label>
                  <input className={inputClass} value={form.mrn} disabled />
                </div>

                <div>
                  <label className={labelClass}>DOB</label>
                  <input
                    className={inputClass}
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    className={selectClass}
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value as Gender)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Emergency Contact</label>
                  <input
                    className={inputClass}
                    value={form.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Emergency Phone</label>
                  <input
                    className={inputClass}
                    value={form.emergencyPhone}
                    onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value as PatientStatus)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Medicare Number</label>
                  <input
                    className={inputClass}
                    value={form.medicareNumber}
                    onChange={(e) => handleChange("medicareNumber", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Medicare Expiry</label>
                  <input
                    className={inputClass}
                    value={form.medicareExpiry}
                    onChange={(e) => handleChange("medicareExpiry", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Medicare Status</label>
                  <select
                    className={selectClass}
                    value={form.medicareStatus}
                    onChange={(e) =>
                      handleChange("medicareStatus", e.target.value as MedicareStatus)
                    }
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Referral Linked</label>
                  <select
                    className={selectClass}
                    value={form.referralLinked}
                    onChange={(e) => handleChange("referralLinked", e.target.value as YesNo)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Referral Source</label>
                  <input
                    className={inputClass}
                    value={form.referralSource}
                    onChange={(e) => handleChange("referralSource", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pre-Study Form</label>
                  <select
                    className={selectClass}
                    value={form.preStudyFormStatus}
                    onChange={(e) =>
                      handleChange(
                        "preStudyFormStatus",
                        e.target.value as PreStudyFormStatus
                      )
                    }
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Not Sent">Not Sent</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>SMS Notification</label>
                  <select
                    className={selectClass}
                    value={form.smsNotification}
                    onChange={(e) =>
                      handleChange("smsNotification", e.target.value as SmsNotification)
                    }
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea
                    className="min-h-[84px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[14px] text-white outline-none"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </form>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Profile Summary</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Current identity and audit visibility
                </div>
              </div>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-500/15 text-[12px] font-extrabold text-emerald-300">
                {patientAudits.length}
              </div>
            </div>

            <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
              {[
                ["Selected", `${selectedPatient.firstName} ${selectedPatient.lastName}`],
                ["Patient ID", selectedPatient.patientId],
                ["MRN", selectedPatient.mrn],
                ["DOB", selectedPatient.dob],
                ["Gender", selectedPatient.gender],
                ["Medicare", selectedPatient.medicareStatus],
                ["Referral", selectedPatient.referralLinked],
                ["Pre-Study Form", selectedPatient.preStudyFormStatus],
                ["SMS", selectedPatient.smsNotification]
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
              <div className="mb-2 text-[14px] font-extrabold">Audit Visibility</div>

              <div className="overflow-x-auto rounded-[18px] border border-[#143a5c] bg-[#071427]">
                <table className="min-w-[760px] w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#143a5c] bg-[#091427]">
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">Timestamp</th>
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">User</th>
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">Action</th>
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">Field</th>
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">Before</th>
                      <th className="px-3 py-2 text-left text-[11px] font-extrabold text-white/85">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientAudits.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-[12px] text-white/45"
                        >
                          No audit entries available.
                        </td>
                      </tr>
                    ) : (
                      patientAudits.map((entry) => (
                        <tr key={entry.id} className="border-b border-[#143a5c]">
                          <td className="px-3 py-2 text-[12px] text-white/60">{entry.timestamp}</td>
                          <td className="px-3 py-2 text-[12px] text-white">{entry.user}</td>
                          <td className="px-3 py-2 text-[12px] text-white">{entry.action}</td>
                          <td className="px-3 py-2 text-[12px] text-white">
                            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
                              {entry.field}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[12px] text-white/60">{entry.before}</td>
                          <td className="px-3 py-2 text-[12px] text-white">{entry.after}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
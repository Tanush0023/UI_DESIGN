"use client";

import React, { useMemo, useState } from "react";

const modalities = [
  {
    id: "ct",
    name: "CT",
    tests: [
      "CT Brain",
      "CT Chest",
      "CT Abdomen",
      "CT Lumbosacral Spine"
    ]
  },
  {
    id: "us",
    name: "Ultrasound",
    tests: [
      "Ultrasound Abdomen",
      "Ultrasound Pelvis",
      "Ultrasound Thyroid"
    ]
  },
  {
    id: "xr",
    name: "X-Ray",
    tests: ["Chest X-Ray", "Knee X-Ray", "Spine X-Ray"]
  },
  {
    id: "mri",
    name: "MRI",
    tests: ["MRI Brain", "MRI Spine", "MRI Knee"]
  }
];

const australianStates = [
  "WA",
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "TAS",
  "ACT",
  "NT"
];

const mockPatients = [
  {
    id: 1,
    name: "Sandra MAYES",
    dob: "1949-02-02",
    mobile: "0400 123 999",
    mrn: "215798",
    lastVisit: "12 Feb",
    clinic: "Oran Park"
  },
  {
    id: 2,
    name: "Sandra Mays",
    dob: "1949-02-02",
    mobile: "0400 123 888",
    mrn: "194420",
    lastVisit: "05 Jan",
    clinic: "Liverpool"
  }
];

const availableSlots = [
  { time: "09:40", room: "Room 2", label: "Earliest" },
  { time: "10:10", room: "Room 1", label: "Same clinic" },
  { time: "11:20", room: "Room 3", label: "Next available" }
];

function generatePatientId(firstName: string, lastName: string) {
  const base =
    `${firstName}${lastName}`.replace(/\s/g, "").slice(0, 4).toUpperCase() ||
    "PT";
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `PT-${base}-${random}`;
}

const inputClass =
  "h-8 w-full rounded-md border border-[#284a73] bg-[#0d1830] px-3 text-[12px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-8 w-full rounded-md border border-[#284a73] bg-[#0d1830] px-3 text-[12px] text-white outline-none focus:border-sky-500/50";

const panelClass = "rounded-[16px] border border-[#143a5c] bg-[#020d1f]";
const subPanelClass = "rounded-[12px] border border-[#143a5c] bg-[#071427]";
const labelClass = "mb-1 block text-[10px] font-semibold text-white/78";

export default function PatientRegistrationPage() {
  const [statusMessage, setStatusMessage] = useState<{
    type: string;
    text: string;
  } | null>(null);
  const [showTimeSlotCard, setShowTimeSlotCard] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientType, setSelectedPatientType] = useState<
    "Existing patient" | "New patient"
  >("New patient");

  const [formData, setFormData] = useState({
    medicare: {
      medicareNumber: "",
      expiryDate: "",
      verificationStatus: "Pending"
    },
    patient: {
      patientId: "",
      dateOfBirth: "",
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      mobilePhone: "",
      homePhone: "",
      workPhone: "",
      contactPerson: "",
      contactNumber: "",
      addressLine1: "",
      addressLine2: "",
      state: "",
      suburb: "",
      postCode: ""
    },
    referrer: {
      referrerName: "Dr A. Patel",
      providerNumber: "8891",
      speciality: "",
      referrerEmail: "",
      referrerContact: "",
      dateReferred: "2026-04-15",
      referralUrgency: "Routine",
      clinicalNotes: "RUQ pain for 3 weeks",
      referralType: "Doctor"
    },
    test: {
      selectedModality: "us",
      selectedTest: "Ultrasound Abdomen",
      multiExamRequired: false,
      secondTest: "",
      machineAllocation: "Room 2 / US Bay",
      preStudyFormRequired: true,
      selectedClinic: "Oran Park",
      selectedSlot: "09:40",
      selectedRoom: "Room 2"
    },
    notification: {
      method: "SMS",
      sendConfirmation: true,
      sendPreparation: true,
      includeFormLink: true
    },
    documents: {
      referralPdf: true,
      idPending: true,
      uploadedDocs: [] as string[]
    }
  });

  const filteredTests = useMemo(() => {
    const selected = modalities.find(
      (m) => m.id === formData.test.selectedModality
    );
    return selected ? selected.tests : [];
  }, [formData.test.selectedModality]);

  const availableSecondTests = useMemo(() => {
    return filteredTests.filter((test) => test !== formData.test.selectedTest);
  }, [filteredTests, formData.test.selectedTest]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockPatients;
    return mockPatients.filter((p) =>
      `${p.name} ${p.mobile} ${p.dob} ${p.mrn}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const updateSection = (
    section: keyof typeof formData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleExpiryDateChange = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 6);
    let month = digits.slice(0, 2);
    const year = digits.slice(2);

    if (month.length === 2) {
      let monthNum = parseInt(month, 10);
      if (isNaN(monthNum) || monthNum < 1) monthNum = 1;
      if (monthNum > 12) monthNum = 12;
      month = String(monthNum).padStart(2, "0");
    }

    let formatted = month;
    if (digits.length > 2) formatted += "/" + year;

    updateSection("medicare", "expiryDate", formatted);

    if (
      formatted.length === 7 &&
      formData.medicare.medicareNumber.length >= 10
    ) {
      updateSection("medicare", "verificationStatus", "Verified");
    } else {
      updateSection("medicare", "verificationStatus", "Pending");
    }
  };

  const handleSaveDraft = () => {
    setStatusMessage({
      type: "success",
      text: "Draft saved successfully."
    });
  };

  const handleConfirmRegistration = () => {
    if (
      !formData.patient.firstName ||
      !formData.patient.lastName ||
      !formData.patient.dateOfBirth ||
      !formData.test.selectedModality ||
      !formData.test.selectedTest
    ) {
      setStatusMessage({
        type: "error",
        text: "Please complete required fields before confirming registration."
      });
      return;
    }

    const patientId =
      formData.patient.patientId ||
      generatePatientId(
        formData.patient.firstName,
        formData.patient.lastName
      );

    setFormData((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        patientId
      }
    }));

    setSavedPatientId(patientId);
    setShowTimeSlotCard(true);

    setStatusMessage({
      type: "success",
      text: formData.notification.sendConfirmation
        ? `Registration confirmed. Patient ID ${patientId} created and notification queued.`
        : `Registration confirmed. Patient ID ${patientId} created.`
    });
  };

  const verificationTone =
    formData.medicare.verificationStatus === "Verified"
      ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
      : formData.medicare.verificationStatus === "Failed"
      ? "border border-rose-700/30 bg-rose-500/15 text-rose-300"
      : "border border-amber-700/30 bg-amber-500/15 text-amber-300";

  const selectedModalityName =
    modalities.find((m) => m.id === formData.test.selectedModality)?.name ||
    "Not Selected";

  const selectExistingPatient = (patient: (typeof mockPatients)[0]) => {
    const parts = patient.name.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        firstName,
        lastName,
        dateOfBirth: patient.dob,
        mobilePhone: patient.mobile,
        patientId: patient.mrn
      },
      test: {
        ...prev.test,
        selectedClinic: patient.clinic
      }
    }));

    setSelectedPatientType("Existing patient");
    setStatusMessage({
      type: "success",
      text: `${patient.name} selected.`
    });
  };

  const uploadDocument = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        uploadedDocs: prev.documents.uploadedDocs.includes(name)
          ? prev.documents.uploadedDocs
          : [...prev.documents.uploadedDocs, name]
      }
    }));

    setStatusMessage({
      type: "success",
      text: `${name} uploaded successfully.`
    });
  };

  return (
    <div className="min-h-screen bg-[#030a16] text-white">
      <div className="p-2">
        <div className="rounded-[16px] border border-[#143a5c] bg-[#020d1f] px-4 py-3 text-center">
          <div className="text-[17px] font-extrabold">Patient Registration</div>
        </div>

        <div className="mt-2 rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-[#284a73] bg-[#0d1830] px-3 py-1 text-[11px] text-white/80">
                Patient Search / Registration
              </div>
              <div className="rounded-md border border-emerald-700/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
                {formData.patient.firstName || "Sandra"} {formData.patient.lastName || "Mayes"} | 76Y | F | PID {savedPatientId || "215798"}
              </div>
              <div className="rounded-md border border-[#284a73] bg-sky-500/10 px-3 py-1 text-[11px] text-sky-300">
                {formData.test.selectedTest || "Abdomen Ultrasound"}
              </div>
              <div className="rounded-md border border-[#284a73] bg-sky-500/10 px-3 py-1 text-[11px] text-sky-300">
                Reception Desk A
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="h-8 rounded-md border border-[#284a73] bg-[#0d1830] px-4 text-[11px] font-semibold text-white"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                className="h-8 rounded-md bg-[#2d55d7] px-4 text-[11px] font-bold text-white"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mt-2 rounded-xl px-4 py-2 text-[12px] font-semibold ${
              statusMessage.type === "success"
                ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                : "border border-rose-700/30 bg-rose-500/15 text-rose-300"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-[1.38fr_0.34fr]">
          <section className={`${panelClass} p-3`}>
            <div className="mb-2 flex flex-wrap gap-2">
              {[
                "1 Patient Search/Create",
                "2 Referral",
                "3 Study & Slot",
                "4 Details",
                "5 Documents",
                "6 Review"
              ].map((label, idx) => (
                <div
                  key={label}
                  className={`h-8 rounded-md px-4 text-[11px] font-semibold flex items-center ${
                    idx === 4
                      ? "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : idx === 5
                      ? "border border-emerald-700/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-[#284a73] bg-[#0d1830] text-white/80"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-2 text-center text-[14px] font-extrabold">
                A. Patient lookup
              </div>

              <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
                  <input
                    className={inputClass}
                    placeholder="Search by name / mobile / DOB / MRN"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="h-8 rounded-md bg-[#2d55d7] px-5 text-[11px] font-bold">
                    Search
                  </button>
                  <button className="h-8 rounded-md border border-[#284a73] bg-[#0d1830] px-4 text-[11px] font-semibold">
                    + New Patient
                  </button>
                  <button className="h-8 rounded-md border border-amber-500/40 bg-amber-500/15 px-4 text-[11px] font-semibold text-amber-300">
                    Check Medicare Eligibility
                  </button>
                </div>

                <div className="mt-3 text-[11px] text-white/65">
                  Possible matches (single click to select)
                </div>

                <div className="mt-2 overflow-x-auto rounded-md border border-[#143a5c]">
                  <table className="w-full min-w-[720px] border-collapse text-[11px]">
                    <thead className="bg-[#091427]">
                      <tr>
                        {["Name", "DOB", "Mobile", "MRN", "Last Visit", "Clinic", "Action"].map((h) => (
                          <th
                            key={h}
                            className="border-b border-[#143a5c] px-3 py-2 text-left font-bold"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id}>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.name}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.dob}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.mobile}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.mrn}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.lastVisit}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            {patient.clinic}
                          </td>
                          <td className="border-b border-[#143a5c] px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => selectExistingPatient(patient)}
                                className="rounded bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-300"
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                className="rounded bg-sky-500/15 px-3 py-1 text-[10px] font-bold text-sky-300"
                              >
                                Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-2 text-center text-[14px] font-extrabold">
                B. Referral + study + slot selection
              </div>

              <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 text-[12px] font-bold">Referral</div>

                  <div className="mb-2 flex flex-wrap gap-1">
                    {["Self", "Doctor", "Corporate"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          updateSection("referrer", "referralType", type)
                        }
                        className={`h-7 rounded-md px-3 text-[10px] font-semibold ${
                          formData.referrer.referralType === type
                            ? "border border-sky-500/40 bg-sky-500/15 text-sky-300"
                            : "border border-[#284a73] bg-[#0d1830] text-white/80"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="ml-auto h-7 rounded-md border border-emerald-700/30 bg-emerald-500/10 px-3 text-[10px] font-semibold text-emerald-300"
                    >
                      Referral.pdf
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      className={inputClass}
                      placeholder="Search referrer / provider"
                      value={formData.referrer.referrerName}
                      onChange={(e) =>
                        updateSection("referrer", "referrerName", e.target.value)
                      }
                    />
                    <button className="h-8 rounded-md border border-[#284a73] bg-[#0d1830] px-3 text-[11px] font-semibold">
                      + Add referrer
                    </button>
                  </div>

                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="rounded-md border border-emerald-700/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
                      {formData.referrer.referrerName} | Provider {formData.referrer.providerNumber}
                    </div>
                    <button className="rounded-md border border-[#284a73] bg-[#0d1830] px-3 py-1.5 text-[11px] font-semibold">
                      Read from Referral Doc
                    </button>
                  </div>

                  <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <div className="text-[11px] text-white/70">Referral date</div>
                    <input
                      type="date"
                      className={inputClass}
                      value={formData.referrer.dateReferred}
                      onChange={(e) =>
                        updateSection("referrer", "dateReferred", e.target.value)
                      }
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-2">
                    <div className="text-[11px] text-white/70">
                      Clinical notes / indication
                    </div>
                    <input
                      className={inputClass}
                      value={formData.referrer.clinicalNotes}
                      onChange={(e) =>
                        updateSection("referrer", "clinicalNotes", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 text-[12px] font-bold">Study</div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputClass}
                      value={formData.test.selectedClinic}
                      onChange={(e) =>
                        updateSection("test", "selectedClinic", e.target.value)
                      }
                    />
                    <select
                      className={selectClass}
                      value={formData.test.selectedTest}
                      onChange={(e) =>
                        updateSection("test", "selectedTest", e.target.value)
                      }
                    >
                      {filteredTests.map((test) => (
                        <option key={test}>{test}</option>
                      ))}
                    </select>

                    <select
                      className={selectClass}
                      value={formData.referrer.referralUrgency}
                      onChange={(e) =>
                        updateSection(
                          "referrer",
                          "referralUrgency",
                          e.target.value
                        )
                      }
                    >
                      <option>Routine</option>
                      <option>Fast 6 hrs</option>
                      <option>Immediate</option>
                    </select>

                    <select className={selectClass}>
                      <option>Any</option>
                    </select>
                  </div>

                  <div className="mt-3 rounded-md border border-orange-700/30 bg-orange-500/10 px-3 py-1.5 text-center text-[11px] text-orange-300">
                    Prep SMS will be sent after confirmation
                  </div>
                </div>

                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[12px] font-bold">Available slots</div>
                    <div className="flex gap-1">
                      <span className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300">
                        Earliest
                      </span>
                      <span className="rounded bg-sky-500/15 px-2 py-1 text-[10px] text-sky-300">
                        Same clinic
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={`${slot.time}-${slot.room}`}
                        className="grid grid-cols-[56px_1fr_auto] items-center gap-2"
                      >
                        <div className="rounded-md border border-[#284a73] bg-[#0d1830] px-2 py-1.5 text-[11px]">
                          {slot.time}
                        </div>
                        <div className="rounded-md border border-[#284a73] bg-[#0d1830] px-2 py-1.5 text-[11px]">
                          {slot.room}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateSection("test", "selectedSlot", slot.time);
                            updateSection("test", "selectedRoom", slot.room);
                            updateSection(
                              "test",
                              "machineAllocation",
                              slot.room
                            );
                            setStatusMessage({
                              type: "success",
                              text: `Slot ${slot.time} ${slot.room} selected.`
                            });
                          }}
                          className="rounded bg-emerald-500/15 px-3 py-1.5 text-[10px] font-bold text-emerald-300"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-md border border-orange-700/30 bg-orange-500/10 px-3 py-1.5 text-center text-[11px] text-orange-300">
                    If full, show next 3 slots + nearest clinic + waitlist
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-center text-[14px] font-extrabold">
                    C. Documents Upload
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-md border border-amber-700/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-300">
                      ID Pending
                    </div>
                    <button
                      type="button"
                      onClick={() => uploadDocument("Referral.pdf")}
                      className="rounded-md border border-[#284a73] bg-[#0d1830] px-3 py-1 text-[10px] font-semibold text-white"
                    >
                      Upload / Camera
                    </button>
                    <div className="rounded-md border border-orange-700/30 bg-orange-500/10 px-3 py-1 text-[10px] font-semibold text-orange-300">
                      Non-blocking docs can be uploaded later
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-2 text-center text-[14px] font-extrabold">
                D. Confirm details
              </div>

              <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
                <div className={`${subPanelClass} min-h-[124px] p-4 text-center text-[12px] text-white/75`}>
                  <div>Display</div>
                  <div>Patient details</div>
                </div>

                <div className={`${subPanelClass} min-h-[124px] p-4 text-center text-[12px] text-white/75`}>
                  <div>Display</div>
                  <div>Study details</div>
                </div>

                <div className={`${subPanelClass} min-h-[124px] p-4 text-center text-[12px] text-white/75`}>
                  <div>Display</div>
                  <div>List of documents uploaded</div>
                  <div className="mt-4 space-y-2">
                    {formData.documents.uploadedDocs.length === 0 ? (
                      <div className="text-[11px] text-white/50">
                        No documents uploaded
                      </div>
                    ) : (
                      formData.documents.uploadedDocs.map((doc) => (
                        <div
                          key={doc}
                          className="rounded-md border border-emerald-700/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300"
                        >
                          {doc}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 text-[12px] font-bold">Patient details</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input
                        className={inputClass}
                        value={formData.patient.firstName}
                        onChange={(e) =>
                          updateSection("patient", "firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input
                        className={inputClass}
                        value={formData.patient.lastName}
                        onChange={(e) =>
                          updateSection("patient", "lastName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>DOB *</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={formData.patient.dateOfBirth}
                        onChange={(e) =>
                          updateSection(
                            "patient",
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Gender</label>
                      <select
                        className={selectClass}
                        value={formData.patient.gender}
                        onChange={(e) =>
                          updateSection("patient", "gender", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={formData.patient.email}
                        onChange={(e) =>
                          updateSection("patient", "email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile</label>
                      <input
                        className={inputClass}
                        value={formData.patient.mobilePhone}
                        onChange={(e) =>
                          updateSection(
                            "patient",
                            "mobilePhone",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 text-[12px] font-bold">Medicare + address</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className={labelClass}>Medicare Number</label>
                      <input
                        className={inputClass}
                        placeholder="10 digit number"
                        value={formData.medicare.medicareNumber}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          updateSection("medicare", "medicareNumber", value);
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry</label>
                      <input
                        className={inputClass}
                        placeholder="MM/YYYY"
                        value={formData.medicare.expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address Line 1</label>
                      <input
                        className={inputClass}
                        value={formData.patient.addressLine1}
                        onChange={(e) =>
                          updateSection(
                            "patient",
                            "addressLine1",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address Line 2</label>
                      <input
                        className={inputClass}
                        value={formData.patient.addressLine2}
                        onChange={(e) =>
                          updateSection(
                            "patient",
                            "addressLine2",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <select
                        className={selectClass}
                        value={formData.patient.state}
                        onChange={(e) =>
                          updateSection("patient", "state", e.target.value)
                        }
                      >
                        <option value="">State</option>
                        {australianStates.map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Suburb / Postcode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className={inputClass}
                          value={formData.patient.suburb}
                          onChange={(e) =>
                            updateSection("patient", "suburb", e.target.value)
                          }
                        />
                        <input
                          className={inputClass}
                          value={formData.patient.postCode}
                          onChange={(e) =>
                            updateSection("patient", "postCode", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${subPanelClass} p-3`}>
                  <div className="mb-2 text-[12px] font-bold">Referrer + notification</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className={labelClass}>Provider Number</label>
                      <input
                        className={inputClass}
                        value={formData.referrer.providerNumber}
                        onChange={(e) =>
                          updateSection(
                            "referrer",
                            "providerNumber",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Referrer Name</label>
                      <input
                        className={inputClass}
                        value={formData.referrer.referrerName}
                        onChange={(e) =>
                          updateSection(
                            "referrer",
                            "referrerName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Date Referred</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={formData.referrer.dateReferred}
                        onChange={(e) =>
                          updateSection(
                            "referrer",
                            "dateReferred",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Notification Method</label>
                      <select
                        className={selectClass}
                        value={formData.notification.method}
                        onChange={(e) =>
                          updateSection("notification", "method", e.target.value)
                        }
                      >
                        <option>SMS</option>
                        <option>Email</option>
                        <option>Both</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-white/82">
                      <input
                        type="checkbox"
                        checked={formData.notification.sendConfirmation}
                        onChange={(e) =>
                          updateSection(
                            "notification",
                            "sendConfirmation",
                            e.target.checked
                          )
                        }
                      />
                      <span>Send confirmation</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-white/82">
                      <input
                        type="checkbox"
                        checked={formData.notification.sendPreparation}
                        onChange={(e) =>
                          updateSection(
                            "notification",
                            "sendPreparation",
                            e.target.checked
                          )
                        }
                      />
                      <span>Send preparation + form link</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="h-8 rounded-md border border-[#284a73] bg-[#0d1830] px-5 text-[11px] font-semibold text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRegistration}
                  className="h-8 rounded-md bg-[#2d55d7] px-5 text-[11px] font-bold text-white"
                >
                  Register
                </button>
              </div>
            </div>
          </section>

          <aside className={`${panelClass} p-3`}>
            <div className="rounded-[12px] border border-[#143a5c] bg-[#071427] px-4 py-3 text-center text-[14px] font-extrabold">
              Sticky summary / actions
            </div>

            <div className="mt-3 space-y-2">
              {[
                [
                  "Patient",
                  selectedPatientType === "Existing patient"
                    ? `${formData.patient.firstName} ${formData.patient.lastName}`.trim() || "Sandra Mayes"
                    : `${formData.patient.firstName} ${formData.patient.lastName}`.trim() || "-"
                ],
                ["Type", selectedPatientType],
                ["Referrer", formData.referrer.referrerName || "-"],
                ["Study", formData.test.selectedTest || "-"],
                ["Clinic", formData.test.selectedClinic || "-"],
                [
                  "Slot",
                  `${formData.test.selectedSlot || "Today 09:40"} ${formData.test.selectedRoom || "Room 2"}`
                ],
                ["Status on save", savedPatientId ? "Registered" : "New"]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-[#143a5c] bg-[#071427] px-3 py-2"
                >
                  <div className="text-[10px] text-white/55">{label}</div>
                  <div className="mt-1 text-[11px] font-semibold text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <div className={`inline-flex h-7 items-center rounded-md px-3 text-[11px] font-semibold ${verificationTone}`}>
                Medicare: {formData.medicare.verificationStatus}
              </div>
              <div className="inline-flex h-7 items-center rounded-md border border-[#284a73] bg-[#0d1d35] px-3 text-[11px] font-semibold text-[#59b7ff]">
                Modality: {selectedModalityName}
              </div>
              <div className="inline-flex h-7 items-center rounded-md border border-[#284a73] bg-[#0d1d35] px-3 text-[11px] font-semibold text-[#59b7ff]">
                Form Link: {formData.notification.includeFormLink ? "Included" : "No"}
              </div>
              <div className="inline-flex h-7 items-center rounded-md border border-[#284a73] bg-[#0d1d35] px-3 text-[11px] font-semibold text-[#59b7ff]">
                Docs: {formData.documents.uploadedDocs.length}
              </div>
            </div>

            {showTimeSlotCard && (
              <div className="mt-3 rounded-[12px] border border-emerald-700/30 bg-emerald-500/10 p-3">
                <div className="mb-1 text-[12px] font-bold text-emerald-300">
                  Time Slot Selection
                </div>
                <div className="text-[11px] leading-5 text-emerald-200/90">
                  Registration complete. Next step is assigning an appointment
                  slot.
                </div>
                <button
                  type="button"
                  onClick={() => alert("Navigate to calendar / time slot page")}
                  className="mt-3 h-8 rounded-md bg-[#00a96e] px-4 text-[11px] font-bold text-white"
                >
                  Select Slot
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
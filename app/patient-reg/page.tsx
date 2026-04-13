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

function generatePatientId(firstName: string, lastName: string) {
  const base =
    `${firstName}${lastName}`.replace(/\s/g, "").slice(0, 4).toUpperCase() ||
    "PT";
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `PT-${base}-${random}`;
}

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";

const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

export default function PatientRegistrationPage() {
  const [statusMessage, setStatusMessage] = useState<{
    type: string;
    text: string;
  } | null>(null);
  const [showTimeSlotCard, setShowTimeSlotCard] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState("");

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
      referrerName: "",
      providerNumber: "",
      speciality: "",
      referrerEmail: "",
      referrerContact: "",
      dateReferred: "",
      referralUrgency: "",
      clinicalNotes: ""
    },
    test: {
      selectedModality: "",
      selectedTest: "",
      multiExamRequired: false,
      secondTest: "",
      machineAllocation: "",
      preStudyFormRequired: true
    },
    notification: {
      method: "SMS",
      sendConfirmation: true,
      sendPreparation: true,
      includeFormLink: true
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

  const handleSave = () => {
    if (
      !formData.patient.firstName ||
      !formData.patient.lastName ||
      !formData.patient.dateOfBirth ||
      !formData.test.selectedModality ||
      !formData.test.selectedTest
    ) {
      setStatusMessage({
        type: "error",
        text: "Please complete required fields."
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
        ? `Saved. Patient ID ${patientId} created and notification queued.`
        : `Saved. Patient ID ${patientId} created.`
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

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          PATIENT REGISTRATION • MEDICARE {formData.medicare.verificationStatus.toUpperCase()} • NOTIFICATION {formData.notification.method.toUpperCase()}
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
                PATIENT ONBOARDING
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Patient Registration
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              ID: {savedPatientId || "Pending"}
            </div>
            <div
              className={`inline-flex h-9 items-center rounded-2xl px-4 text-[13px] font-bold ${verificationTone}`}
            >
              Medicare: {formData.medicare.verificationStatus}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
            >
              Save
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mb-2 rounded-2xl px-4 py-2 text-[13px] font-bold ${
              statusMessage.type === "success"
                ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                : "border border-rose-700/30 bg-rose-500/15 text-rose-300"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <div className="grid h-[calc(100%-76px)] grid-cols-1 gap-2 xl:grid-cols-[0.82fr_1.26fr_0.82fr]">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2">
              <div className="text-[15px] font-extrabold">Workflow</div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Compact registration steps
              </div>
            </div>

            <div className="mb-2 rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#56a8ff]" />
                <span>Patient details</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d8f52]" />
                <span>Medicare capture</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9b6bff]" />
                <span>Study setup</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d24d57]" />
                <span>Notification + slot</span>
              </div>
            </div>

            <div className="mb-2 rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-1 text-[13px] font-extrabold text-[#59b7ff]">
                Generated Patient ID
              </div>
              <div className="text-[12px] text-white/72">
                {savedPatientId || "Generated after save"}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-2 text-[14px] font-extrabold">
                Quick Summary
              </div>
              {[
                [
                  "Name",
                  `${formData.patient.firstName || "-"} ${formData.patient.lastName || ""}`.trim()
                ],
                ["Test", formData.test.selectedTest || "-"],
                [
                  "Form Link",
                  formData.notification.includeFormLink ? "Yes" : "No"
                ]
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
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">
                  Registration Details
                </div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Medicare, patient details, and referrer setup
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Medicare: {formData.medicare.verificationStatus}
                </span>
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Modality: {selectedModalityName}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">Medicare</div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
                </div>
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">
                  Patient Details
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
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
                        updateSection("patient", "dateOfBirth", e.target.value)
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
                    <label className={labelClass}>Contact Number</label>
                    <input
                      className={inputClass}
                      value={formData.patient.contactNumber}
                      onChange={(e) =>
                        updateSection("patient", "contactNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="xl:col-span-2">
                    <label className={labelClass}>Address Line 1</label>
                    <input
                      className={inputClass}
                      value={formData.patient.addressLine1}
                      onChange={(e) =>
                        updateSection("patient", "addressLine1", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Address Line 2</label>
                    <input
                      className={inputClass}
                      value={formData.patient.addressLine2}
                      onChange={(e) =>
                        updateSection("patient", "addressLine2", e.target.value)
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
                    <label className={labelClass}>Suburb</label>
                    <input
                      className={inputClass}
                      value={formData.patient.suburb}
                      onChange={(e) =>
                        updateSection("patient", "suburb", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Postcode</label>
                    <input
                      className={inputClass}
                      value={formData.patient.postCode}
                      onChange={(e) =>
                        updateSection("patient", "postCode", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contact Person</label>
                    <input
                      className={inputClass}
                      value={formData.patient.contactPerson}
                      onChange={(e) =>
                        updateSection("patient", "contactPerson", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">
                  Referrer Details
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
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
                        updateSection("referrer", "referrerName", e.target.value)
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
                        updateSection("referrer", "dateReferred", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Urgency</label>
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
                      <option value="">Select</option>
                      <option>Routine</option>
                      <option>Urgent</option>
                      <option>Immediate</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Referrer Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={formData.referrer.referrerEmail}
                      onChange={(e) =>
                        updateSection(
                          "referrer",
                          "referrerEmail",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      className={inputClass}
                      value={formData.referrer.referrerContact}
                      onChange={(e) =>
                        updateSection(
                          "referrer",
                          "referrerContact",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Speciality</label>
                    <input
                      className={inputClass}
                      value={formData.referrer.speciality}
                      onChange={(e) =>
                        updateSection("referrer", "speciality", e.target.value)
                      }
                    />
                  </div>

                  <div className="xl:col-span-4">
                    <label className={labelClass}>Clinical Notes</label>
                    <textarea
                      className="min-h-[72px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[13px] text-white outline-none"
                      value={formData.referrer.clinicalNotes}
                      onChange={(e) =>
                        updateSection(
                          "referrer",
                          "clinicalNotes",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2">
              <div className="text-[15px] font-extrabold">Study Setup</div>
              <div className="mt-0.5 text-[12px] text-white/55">
                Test details, notifications, and next step
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">
                  Test Details
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Modality *</label>
                    <select
                      className={selectClass}
                      value={formData.test.selectedModality}
                      onChange={(e) => {
                        updateSection(
                          "test",
                          "selectedModality",
                          e.target.value
                        );
                        updateSection("test", "selectedTest", "");
                        updateSection("test", "secondTest", "");
                      }}
                    >
                      <option value="">Select</option>
                      {modalities.map((modality) => (
                        <option key={modality.id} value={modality.id}>
                          {modality.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Test *</label>
                    <select
                      className={selectClass}
                      value={formData.test.selectedTest}
                      onChange={(e) =>
                        updateSection("test", "selectedTest", e.target.value)
                      }
                      disabled={!formData.test.selectedModality}
                    >
                      <option value="">Select</option>
                      {filteredTests.map((test) => (
                        <option key={test}>{test}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex h-10 items-center justify-between rounded-xl border border-[#284a73] bg-[#0d1830] px-3">
                    <div className="text-[13px] text-white/72">Multi-Exam</div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(
                          "test",
                          "multiExamRequired",
                          !formData.test.multiExamRequired
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                        formData.test.multiExamRequired
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {formData.test.multiExamRequired ? "On" : "Off"}
                    </button>
                  </div>

                  <div>
                    <label className={labelClass}>Second Test</label>
                    <select
                      className={selectClass}
                      value={formData.test.secondTest}
                      onChange={(e) =>
                        updateSection("test", "secondTest", e.target.value)
                      }
                      disabled={!formData.test.multiExamRequired}
                    >
                      <option value="">Select</option>
                      {availableSecondTests.map((test) => (
                        <option key={test}>{test}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Machine Allocation</label>
                    <input
                      className={inputClass}
                      placeholder="Suggested machine / room"
                      value={formData.test.machineAllocation}
                      onChange={(e) =>
                        updateSection(
                          "test",
                          "machineAllocation",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex h-10 items-center justify-between rounded-xl border border-[#284a73] bg-[#0d1830] px-3">
                    <div className="text-[13px] text-white/72">
                      Pre-Study Form
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(
                          "test",
                          "preStudyFormRequired",
                          !formData.test.preStudyFormRequired
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                        formData.test.preStudyFormRequired
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {formData.test.preStudyFormRequired
                        ? "Required"
                        : "Not Required"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[14px] font-extrabold">
                  Notification Setup
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Notification Method</label>
                    <select
                      className={selectClass}
                      value={formData.notification.method}
                      onChange={(e) =>
                        updateSection(
                          "notification",
                          "method",
                          e.target.value
                        )
                      }
                    >
                      <option>SMS</option>
                      <option>Email</option>
                      <option>Both</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 text-[13px] text-white/82">
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

                  <label className="flex items-center gap-3 text-[13px] text-white/82">
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
                    <span>Send preparation</span>
                  </label>

                  <label className="flex items-center gap-3 text-[13px] text-white/82">
                    <input
                      type="checkbox"
                      checked={formData.notification.includeFormLink}
                      onChange={(e) =>
                        updateSection(
                          "notification",
                          "includeFormLink",
                          e.target.checked
                        )
                      }
                    />
                    <span>Include form link</span>
                  </label>

                  <div className="rounded-[18px] border border-[#143a5c] bg-[#081321] p-3">
                    {[
                      ["Method", formData.notification.method],
                      [
                        "Preparation",
                        formData.notification.sendPreparation ? "Yes" : "No"
                      ],
                      [
                        "Form Link",
                        formData.notification.includeFormLink
                          ? "Included"
                          : "No"
                      ]
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
                </div>
              </div>

              {showTimeSlotCard && (
                <div className="rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
                  <div className="mb-2 text-[14px] font-extrabold">
                    Time Slot Selection
                  </div>
                  <div className="mb-3 text-[12px] leading-6 text-white/72">
                    Registration complete. Next step is assigning an appointment
                    slot.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Navigate to calendar / time slot page")
                    }
                    className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
                  >
                    Select Slot
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
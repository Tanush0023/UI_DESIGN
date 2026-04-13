"use client";

import React, { useEffect, useMemo, useState } from "react";

type ExamStatus = "Active" | "Inactive";
type ContrastOption = "Yes" | "No";
type Modality =
  | "CT"
  | "MRI"
  | "Ultrasound"
  | "X-Ray"
  | "Mammography"
  | "Nuclear";
type DoctorPresenceType =
  | "Not Required"
  | "On-site Radiologist Required"
  | "Medical Staff On-site Required"
  | "Radiologist On-call Only"
  | "Senior Reviewer Required";
type Competency =
  | "Radiographer Level 1"
  | "Radiographer Level 2"
  | "CT Certified"
  | "MRI Certified"
  | "Sonographer"
  | "Ultrasound Certified"
  | "Contrast Qualified"
  | "Senior Reviewer";

type Exam = {
  id: number;
  examName: string;
  examCode: string;
  modality: Modality;
  category: string;
  bodyPart: string;
  contrast: ContrastOption;
  billingCode: string;
  medicareItemNumber: string;
  medicareRebateFee: string;
  outOfPocketFee: string;
  privateBillingFee: string;
  equipmentRequirement: string;
  duration: string;
  status: ExamStatus;
  doctorPresenceRequired: boolean;
  doctorPresenceType: DoctorPresenceType;
  minimumDoctorsRequired: number;
  doctorPresenceNotes: string;
  preparation: string;
  postProcedureInstructions: string;
  smsRules: string;
  competencies: Competency[];
  notes: string;
};

const examSeed: Exam[] = [
  {
    id: 1,
    examName: "CT Lumbosacral Spine",
    examCode: "EX-CT-001",
    modality: "CT",
    category: "Spine",
    bodyPart: "Lumbosacral Spine",
    contrast: "No",
    billingCode: "CT-LS-4492",
    medicareItemNumber: "56220",
    medicareRebateFee: "$210.00",
    outOfPocketFee: "$65.00",
    privateBillingFee: "$275.00",
    equipmentRequirement: "GE CT 128",
    duration: "30 min",
    status: "Active",
    doctorPresenceRequired: true,
    doctorPresenceType: "On-site Radiologist Required",
    minimumDoctorsRequired: 1,
    doctorPresenceNotes:
      "Radiologist must be available on-site for protocol escalation and urgent review.",
    preparation:
      "No special preparation required. Remove metal objects before scan.",
    postProcedureInstructions:
      "Hydrate well after the scan. Contact clinic if symptoms worsen.",
    smsRules:
      "Send reminder 24 hours before appointment and arrival instruction 2 hours prior.",
    competencies: ["Radiographer Level 2", "CT Certified"],
    notes: "Standard lumbar spine protocol with axial and sagittal reformats."
  },
  {
    id: 2,
    examName: "Ultrasound Abdomen",
    examCode: "EX-US-010",
    modality: "Ultrasound",
    category: "Abdomen",
    bodyPart: "Abdomen",
    contrast: "No",
    billingCode: "US-ABD-2201",
    medicareItemNumber: "55036",
    medicareRebateFee: "$145.00",
    outOfPocketFee: "$40.00",
    privateBillingFee: "$185.00",
    equipmentRequirement: "Philips Ultrasound 7",
    duration: "25 min",
    status: "Active",
    doctorPresenceRequired: false,
    doctorPresenceType: "Not Required",
    minimumDoctorsRequired: 0,
    doctorPresenceNotes:
      "Performed by accredited sonographer unless escalation required.",
    preparation:
      "Fast for 6 hours prior to exam. Water permitted unless otherwise advised.",
    postProcedureInstructions:
      "Resume diet after scan unless otherwise instructed.",
    smsRules: "Send fasting instruction 24 hours before appointment.",
    competencies: ["Sonographer", "Ultrasound Certified"],
    notes: "Check hepatobiliary and renal structures."
  },
  {
    id: 3,
    examName: "MRI Brain Contrast",
    examCode: "EX-MR-021",
    modality: "MRI",
    category: "Neurology",
    bodyPart: "Brain",
    contrast: "Yes",
    billingCode: "MRI-BR-7750",
    medicareItemNumber: "63541",
    medicareRebateFee: "$390.00",
    outOfPocketFee: "$120.00",
    privateBillingFee: "$510.00",
    equipmentRequirement: "Siemens MRI 3T",
    duration: "45 min",
    status: "Inactive",
    doctorPresenceRequired: true,
    doctorPresenceType: "Medical Staff On-site Required",
    minimumDoctorsRequired: 1,
    doctorPresenceNotes:
      "Medical staff must be available for contrast-related escalation and screening exceptions.",
    preparation:
      "Screen for implants. Contrast consent required. Renal function as indicated.",
    postProcedureInstructions:
      "Advise patient to report any delayed reaction after contrast administration.",
    smsRules:
      "Send MRI safety checklist and arrival instructions 24 hours before exam.",
    competencies: ["MRI Certified", "Contrast Qualified"],
    notes: "Review contraindications before scheduling."
  }
];

const modalities: Modality[] = [
  "CT",
  "MRI",
  "Ultrasound",
  "X-Ray",
  "Mammography",
  "Nuclear"
];

const contrastOptions: ContrastOption[] = ["Yes", "No"];

const doctorPresenceTypes: DoctorPresenceType[] = [
  "Not Required",
  "On-site Radiologist Required",
  "Medical Staff On-site Required",
  "Radiologist On-call Only",
  "Senior Reviewer Required"
];

const competencyOptions: Competency[] = [
  "Radiographer Level 1",
  "Radiographer Level 2",
  "CT Certified",
  "MRI Certified",
  "Sonographer",
  "Ultrasound Certified",
  "Contrast Qualified",
  "Senior Reviewer"
];

type EditableExamField =
  | "examName"
  | "examCode"
  | "modality"
  | "category"
  | "bodyPart"
  | "contrast"
  | "billingCode"
  | "medicareItemNumber"
  | "medicareRebateFee"
  | "outOfPocketFee"
  | "privateBillingFee"
  | "equipmentRequirement"
  | "duration"
  | "status"
  | "doctorPresenceType"
  | "minimumDoctorsRequired"
  | "doctorPresenceNotes"
  | "preparation"
  | "postProcedureInstructions"
  | "smsRules"
  | "notes";

const inputClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-sky-500/50";

const selectClass =
  "h-10 w-full rounded-xl border border-[#284a73] bg-[#0d1830] px-3 text-[13px] text-white outline-none focus:border-sky-500/50";

const panelClass = "rounded-[22px] border border-[#143a5c] bg-[#020d1f]";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/78";

export default function ExaminationConfigurationPage() {
  const [exams, setExams] = useState<Exam[]>(examSeed);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const selectedExam = exams.find((exam) => exam.id === selectedId) ?? exams[0];
  const [form, setForm] = useState<Exam>(selectedExam);

  useEffect(() => {
    setForm(JSON.parse(JSON.stringify(selectedExam)) as Exam);
    setMessage("");
  }, [selectedExam]);

  const filteredExams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exams;

    return exams.filter((exam) => {
      const text =
        `${exam.examName} ${exam.examCode} ${exam.modality} ${exam.billingCode} ${exam.category} ${exam.bodyPart}`.toLowerCase();
      return text.includes(q);
    });
  }, [exams, search]);

  const activeCount = exams.filter((e) => e.status === "Active").length;
  const inactiveCount = exams.filter((e) => e.status === "Inactive").length;
  const modalityCount = new Set(exams.map((e) => e.modality)).size;
  const doctorPresenceCount = exams.filter(
    (e) => e.doctorPresenceRequired
  ).length;

  const handleFieldChange = <K extends EditableExamField>(
    field: K,
    value: Exam[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCompetency = (value: Competency) => {
    setForm((prev) => {
      const exists = prev.competencies.includes(value);
      return {
        ...prev,
        competencies: exists
          ? prev.competencies.filter((item) => item !== value)
          : [...prev.competencies, value]
      };
    });
  };

  const handleDoctorPresenceToggle = () => {
    setForm((prev) => ({
      ...prev,
      doctorPresenceRequired: !prev.doctorPresenceRequired,
      doctorPresenceType: !prev.doctorPresenceRequired
        ? "On-site Radiologist Required"
        : "Not Required",
      minimumDoctorsRequired: !prev.doctorPresenceRequired ? 1 : 0
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExams((prev) =>
      prev.map((exam) => (exam.id === selectedId ? form : exam))
    );
    setMessage("Examination configuration updated successfully.");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#030a16] text-white">
      <div className="sticky top-0 z-30 flex h-11 items-center justify-between bg-[#8d0d46] px-4">
        <div className="truncate text-[14px] font-bold">
          EXAM CONFIG • ACTIVE {activeCount} • INACTIVE {inactiveCount} • MODALITIES {modalityCount} • DOCTOR PRESENCE {doctorPresenceCount}
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
                EXAMINATION CONFIGURATION
              </div>
              <div className="text-[16px] font-extrabold">
                Compact Examination Setup
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Exam: {selectedExam.examCode}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Modality: {selectedExam.modality}
            </div>
            <div className="inline-flex h-9 items-center rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]">
              Presence: {selectedExam.doctorPresenceRequired ? "Required" : "Not Required"}
            </div>
            <button
              type="button"
              className="h-9 rounded-2xl border border-[#284a73] bg-[#0d1d35] px-4 text-[13px] font-bold text-[#59b7ff]"
            >
              Export
            </button>
            <button
              type="submit"
              form="exam-form"
              className="h-9 rounded-2xl bg-[#00a96e] px-5 text-[14px] font-extrabold"
            >
              Save Exam
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
                <div className="text-[15px] font-extrabold">Exam Search</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Find and switch exam quickly
                </div>
              </div>
              <div className="inline-flex h-7 items-center rounded-full bg-emerald-500/15 px-3 text-[11px] font-extrabold text-emerald-300">
                {filteredExams.length} shown
              </div>
            </div>

            <div className="mb-2">
              <input
                className={inputClass}
                placeholder="Exam, code, billing..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredExams.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => setSelectedId(exam.id)}
                  className={`w-full rounded-[20px] border px-3 py-3 text-left ${
                    exam.id === selectedId
                      ? "border-sky-500/45 bg-[#0b213f]"
                      : "border-[#143a5c] bg-[#071427]"
                  }`}
                >
                  <div className="text-[14px] font-extrabold">{exam.examName}</div>
                  <div className="mt-1 text-[12px] text-white/62">{exam.examCode}</div>
                  <div className="mt-0.5 text-[12px] text-white/55">
                    {exam.modality} • {exam.billingCode}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-2 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
              <div className="mb-2 text-[14px] font-extrabold">Overview</div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d8f52]" />
                <span>{activeCount} Active Exams</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d24d57]" />
                <span>{inactiveCount} Inactive Exams</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#56a8ff]" />
                <span>{modalityCount} Modalities</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-white/75">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9b6bff]" />
                <span>{doctorPresenceCount} Need Doctor Presence</span>
              </div>
            </div>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Examination Details</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Manage exam data, billing, instructions and presence rules
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Status: {form.status}
                </span>
                <span className="rounded-full border border-[#284a73] bg-[#0d1d35] px-3 py-1.5 text-[11px] font-bold text-white/85">
                  Duration: {form.duration}
                </span>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDoctorPresenceToggle}
                className={`h-9 rounded-2xl px-4 text-[13px] font-bold ${
                  form.doctorPresenceRequired
                    ? "border border-emerald-700/30 bg-emerald-500/15 text-emerald-300"
                    : "border border-slate-700/40 bg-[#111b2f] text-white"
                }`}
              >
                {form.doctorPresenceRequired ? "Presence Required" : "Presence Not Required"}
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
                    ? "border border-sky-600/30 bg-[#0f2746] text-sky-300"
                    : "border border-rose-700/30 bg-rose-500/15 text-rose-300"
                }`}
              >
                {form.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>

            <form id="exam-form" onSubmit={handleSave} className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>Exam Name</label>
                  <input
                    className={inputClass}
                    value={form.examName}
                    onChange={(e) => handleFieldChange("examName", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Exam Code</label>
                  <input
                    className={inputClass}
                    value={form.examCode}
                    onChange={(e) => handleFieldChange("examCode", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Modality</label>
                  <select
                    className={selectClass}
                    value={form.modality}
                    onChange={(e) =>
                      handleFieldChange("modality", e.target.value as Modality)
                    }
                  >
                    {modalities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Body Part</label>
                  <input
                    className={inputClass}
                    value={form.bodyPart}
                    onChange={(e) => handleFieldChange("bodyPart", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contrast</label>
                  <select
                    className={selectClass}
                    value={form.contrast}
                    onChange={(e) =>
                      handleFieldChange("contrast", e.target.value as ContrastOption)
                    }
                  >
                    {contrastOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Billing Code</label>
                  <input
                    className={inputClass}
                    value={form.billingCode}
                    onChange={(e) => handleFieldChange("billingCode", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Medicare Item</label>
                  <input
                    className={inputClass}
                    value={form.medicareItemNumber}
                    onChange={(e) =>
                      handleFieldChange("medicareItemNumber", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Medicare Rebate</label>
                  <input
                    className={inputClass}
                    value={form.medicareRebateFee}
                    onChange={(e) =>
                      handleFieldChange("medicareRebateFee", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Out-of-pocket Fee</label>
                  <input
                    className={inputClass}
                    value={form.outOfPocketFee}
                    onChange={(e) =>
                      handleFieldChange("outOfPocketFee", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Private Billing Fee</label>
                  <input
                    className={inputClass}
                    value={form.privateBillingFee}
                    onChange={(e) =>
                      handleFieldChange("privateBillingFee", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Equipment Requirement</label>
                  <input
                    className={inputClass}
                    value={form.equipmentRequirement}
                    onChange={(e) =>
                      handleFieldChange("equipmentRequirement", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    className={inputClass}
                    value={form.duration}
                    onChange={(e) => handleFieldChange("duration", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
                    value={form.status}
                    onChange={(e) =>
                      handleFieldChange("status", e.target.value as ExamStatus)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Presence Type</label>
                  <select
                    className={selectClass}
                    value={form.doctorPresenceType}
                    onChange={(e) =>
                      handleFieldChange(
                        "doctorPresenceType",
                        e.target.value as DoctorPresenceType
                      )
                    }
                    disabled={!form.doctorPresenceRequired}
                  >
                    {doctorPresenceTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Minimum Doctors</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={form.minimumDoctorsRequired}
                    onChange={(e) =>
                      handleFieldChange(
                        "minimumDoctorsRequired",
                        Number(e.target.value)
                      )
                    }
                    disabled={!form.doctorPresenceRequired}
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Preparation</label>
                  <textarea
                    className="min-h-[70px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[13px] text-white outline-none"
                    value={form.preparation}
                    onChange={(e) => handleFieldChange("preparation", e.target.value)}
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Post-Procedure Instructions</label>
                  <textarea
                    className="min-h-[70px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[13px] text-white outline-none"
                    value={form.postProcedureInstructions}
                    onChange={(e) =>
                      handleFieldChange("postProcedureInstructions", e.target.value)
                    }
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>SMS Rules</label>
                  <textarea
                    className="min-h-[70px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[13px] text-white outline-none"
                    value={form.smsRules}
                    onChange={(e) => handleFieldChange("smsRules", e.target.value)}
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Doctor Presence Notes</label>
                  <textarea
                    className="min-h-[70px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[13px] text-white outline-none"
                    value={form.doctorPresenceNotes}
                    onChange={(e) =>
                      handleFieldChange("doctorPresenceNotes", e.target.value)
                    }
                  />
                </div>

                <div className="xl:col-span-2">
                  <label className={labelClass}>Operational Notes</label>
                  <textarea
                    className="min-h-[84px] w-full resize-y rounded-2xl border border-[#284a73] bg-[#0d1830] p-3 text-[14px] text-white outline-none"
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </form>
          </section>

          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold">Configuration Summary</div>
                <div className="mt-0.5 text-[12px] text-white/55">
                  Competencies, rules and setup visibility
                </div>
              </div>
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-500/15 text-[12px] font-extrabold text-emerald-300">
                {form.competencies.length}
              </div>
            </div>

            <div className="mb-3 rounded-[20px] border border-[#143a5c] bg-[#071427] p-3">
              {[
                ["Exam Name", selectedExam.examName],
                ["Exam Code", selectedExam.examCode],
                ["Modality", selectedExam.modality],
                ["Body Part", selectedExam.bodyPart],
                ["Billing Code", selectedExam.billingCode],
                ["Presence Type", selectedExam.doctorPresenceType],
                ["Minimum Doctors", selectedExam.minimumDoctorsRequired]
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
              <div className="mb-2 text-[14px] font-extrabold">Required Competencies</div>

              <div className="mb-3 flex flex-wrap gap-2">
                {competencyOptions.map((item) => {
                  const active = form.competencies.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleCompetency(item)}
                      className={
                        active
                          ? "rounded-xl border border-sky-500/30 bg-[#0b213f] px-3 py-2 text-[11px] font-bold text-sky-300"
                          : "rounded-xl border border-[#143a5c] bg-[#071427] px-3 py-2 text-[11px] font-semibold text-white/72"
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="mb-3 rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[13px] font-extrabold">Preparation Instructions</div>
                <div className="text-[12px] leading-6 text-white/75">{selectedExam.preparation}</div>
              </div>

              <div className="rounded-[18px] border border-[#143a5c] bg-[#071427] p-3">
                <div className="mb-2 text-[13px] font-extrabold">Post-Procedure & SMS Rules</div>

                <div className="mb-3 rounded-xl border border-[#143a5c] bg-[#081321] p-3">
                  <div className="mb-1 text-[12px] font-extrabold text-white">SMS Rules</div>
                  <div className="text-[12px] leading-6 text-white/72">{selectedExam.smsRules}</div>
                </div>

                <div className="rounded-xl border border-[#143a5c] bg-[#081321] p-3">
                  <div className="mb-1 text-[12px] font-extrabold text-white">Post-Procedure</div>
                  <div className="text-[12px] leading-6 text-white/72">
                    {selectedExam.postProcedureInstructions}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
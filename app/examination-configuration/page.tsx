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
    notes: "Standard lumbar spine protocol with axial and sagittal reformats.",
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
    notes: "Check hepatobiliary and renal structures.",
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
    notes: "Review contraindications before scheduling.",
  },
];

const modalities: Modality[] = [
  "CT",
  "MRI",
  "Ultrasound",
  "X-Ray",
  "Mammography",
  "Nuclear",
];

const contrastOptions: ContrastOption[] = ["Yes", "No"];

const doctorPresenceTypes: DoctorPresenceType[] = [
  "Not Required",
  "On-site Radiologist Required",
  "Medical Staff On-site Required",
  "Radiologist On-call Only",
  "Senior Reviewer Required",
];

const competencyOptions: Competency[] = [
  "Radiographer Level 1",
  "Radiographer Level 2",
  "CT Certified",
  "MRI Certified",
  "Sonographer",
  "Ultrasound Certified",
  "Contrast Qualified",
  "Senior Reviewer",
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
      [field]: value,
    }));
  };

  const toggleCompetency = (value: Competency) => {
    setForm((prev) => {
      const exists = prev.competencies.includes(value);
      return {
        ...prev,
        competencies: exists
          ? prev.competencies.filter((item) => item !== value)
          : [...prev.competencies, value],
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
      minimumDoctorsRequired: !prev.doctorPresenceRequired ? 1 : 0,
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
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>Examination Configuration</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topActionButton}>Master Data</div>
          <div style={styles.topInfoPill}>Doctor Presence Rules</div>
          <div style={styles.userPill}>Admin</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>EXAM CONFIG</div>
            <div style={styles.sidebarSub}>
              Admin and security examination setup
            </div>
          </div>

          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>Search Examination</div>
            <input
              style={styles.input}
              placeholder="Search exam, code, billing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.examList}>
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => setSelectedId(exam.id)}
                style={
                  exam.id === selectedId
                    ? styles.examItemActive
                    : styles.examItem
                }
              >
                <div style={styles.examName}>{exam.examName}</div>
                <div style={styles.examMeta}>{exam.examCode}</div>
                <div style={styles.examMeta}>
                  {exam.modality} • {exam.billingCode}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>Overview</div>
            <div style={styles.statusRow}>
              <span style={styles.dotGreen} />
              <span>{activeCount} Active Exams</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotRed} />
              <span>{inactiveCount} Inactive Exams</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotBlue} />
              <span>{modalityCount} Modalities Used</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotPurple} />
              <span>{doctorPresenceCount} Require Doctor Presence</span>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>EXAMINATION ADMINISTRATION</div>
              <h1 style={styles.pageTitle}>Examination Configuration Screens</h1>
              <p style={styles.pageSub}>
                Manage exam types, modality, billing, preparation instructions,
                equipment requirements, competencies, and doctor presence rules.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button type="button" style={styles.secondaryButton}>
                Export
              </button>
              <button type="button" style={styles.primaryButton}>
                Save Exam
              </button>
            </div>
          </div>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Selected Exam</div>
              <div style={styles.metricValueSmall}>{selectedExam.examCode}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Modality</div>
              <div style={styles.metricValueSmall}>{selectedExam.modality}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Status</div>
              <div style={styles.metricValueSmall}>{selectedExam.status}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Doctor Presence</div>
              <div style={styles.metricValueSmall}>
                {selectedExam.doctorPresenceRequired
                  ? "Required"
                  : "Not Required"}
              </div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Examination Details</div>
                  <div style={styles.panelSub}>
                    Configure exam master data, billing, restrictions, and
                    readiness settings.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={styles.formGrid}>
                  <input
                    style={styles.input}
                    value={form.examName}
                    onChange={(e) =>
                      handleFieldChange("examName", e.target.value)
                    }
                    placeholder="Exam Name"
                  />
                  <input
                    style={styles.input}
                    value={form.examCode}
                    onChange={(e) =>
                      handleFieldChange("examCode", e.target.value)
                    }
                    placeholder="Exam Code"
                  />
                  <select
                    style={styles.select}
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
                  <input
                    style={styles.input}
                    value={form.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                    placeholder="Category"
                  />
                  <input
                    style={styles.input}
                    value={form.bodyPart}
                    onChange={(e) =>
                      handleFieldChange("bodyPart", e.target.value)
                    }
                    placeholder="Body Part"
                  />
                  <select
                    style={styles.select}
                    value={form.contrast}
                    onChange={(e) =>
                      handleFieldChange(
                        "contrast",
                        e.target.value as ContrastOption
                      )
                    }
                  >
                    {contrastOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    style={styles.input}
                    value={form.billingCode}
                    onChange={(e) =>
                      handleFieldChange("billingCode", e.target.value)
                    }
                    placeholder="Practice Billing Code"
                  />
                  <input
                    style={styles.input}
                    value={form.medicareItemNumber}
                    onChange={(e) =>
                      handleFieldChange("medicareItemNumber", e.target.value)
                    }
                    placeholder="Medicare Item Number"
                  />
                  <input
                    style={styles.input}
                    value={form.medicareRebateFee}
                    onChange={(e) =>
                      handleFieldChange("medicareRebateFee", e.target.value)
                    }
                    placeholder="Medicare Rebate Fee"
                  />
                  <input
                    style={styles.input}
                    value={form.outOfPocketFee}
                    onChange={(e) =>
                      handleFieldChange("outOfPocketFee", e.target.value)
                    }
                    placeholder="Out-of-pocket Fee"
                  />
                  <input
                    style={styles.input}
                    value={form.privateBillingFee}
                    onChange={(e) =>
                      handleFieldChange("privateBillingFee", e.target.value)
                    }
                    placeholder="Private Billing Fee"
                  />
                  <input
                    style={styles.input}
                    value={form.equipmentRequirement}
                    onChange={(e) =>
                      handleFieldChange("equipmentRequirement", e.target.value)
                    }
                    placeholder="Equipment Requirement"
                  />
                  <input
                    style={styles.input}
                    value={form.duration}
                    onChange={(e) =>
                      handleFieldChange("duration", e.target.value)
                    }
                    placeholder="Duration"
                  />
                  <select
                    style={styles.select}
                    value={form.status}
                    onChange={(e) =>
                      handleFieldChange("status", e.target.value as ExamStatus)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <div style={styles.toggleBox}>
                    <div style={styles.toggleLabel}>
                      Doctor Presence Required
                    </div>
                    <button
                      type="button"
                      onClick={handleDoctorPresenceToggle}
                      style={
                        form.doctorPresenceRequired
                          ? styles.toggleActive
                          : styles.toggleInactive
                      }
                    >
                      {form.doctorPresenceRequired
                        ? "Required"
                        : "Not Required"}
                    </button>
                  </div>

                  <select
                    style={styles.select}
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

                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    value={form.minimumDoctorsRequired}
                    onChange={(e) =>
                      handleFieldChange(
                        "minimumDoctorsRequired",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Minimum Doctors Required"
                    disabled={!form.doctorPresenceRequired}
                  />

                  <div style={styles.readOnlyBox}>
                    <span style={styles.readOnlyLabel}>Exam Type</span>
                    <strong style={styles.readOnlyValue}>{form.modality}</strong>
                  </div>

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.preparation}
                    onChange={(e) =>
                      handleFieldChange("preparation", e.target.value)
                    }
                    placeholder="Preparation and arrival instructions"
                  />

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.smsRules}
                    onChange={(e) =>
                      handleFieldChange("smsRules", e.target.value)
                    }
                    placeholder="SMS content rules"
                  />

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.postProcedureInstructions}
                    onChange={(e) =>
                      handleFieldChange(
                        "postProcedureInstructions",
                        e.target.value
                      )
                    }
                    placeholder="Post-procedure instructions"
                  />

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.doctorPresenceNotes}
                    onChange={(e) =>
                      handleFieldChange("doctorPresenceNotes", e.target.value)
                    }
                    placeholder="Doctor presence notes"
                  />

                  <textarea
                    style={{ ...styles.textarea, gridColumn: "1 / span 2" }}
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Operational notes"
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.secondaryButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Exam
                  </button>
                </div>
              </form>

              {message ? <div style={styles.message}>{message}</div> : null}
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Configuration Summary</div>
                  <div style={styles.panelSub}>
                    Current visibility of exam, billing, and doctor presence
                    rules.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Exam Name</span>
                  <strong>{selectedExam.examName}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Exam Code</span>
                  <strong>{selectedExam.examCode}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Modality</span>
                  <strong>{selectedExam.modality}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Body Part</span>
                  <strong>{selectedExam.bodyPart}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Billing Code</span>
                  <strong>{selectedExam.billingCode}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Medicare Item</span>
                  <strong>{selectedExam.medicareItemNumber}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Equipment</span>
                  <strong>{selectedExam.equipmentRequirement}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Doctor Presence</span>
                  <strong>
                    {selectedExam.doctorPresenceRequired
                      ? "Required"
                      : "Not Required"}
                  </strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Presence Type</span>
                  <strong>{selectedExam.doctorPresenceType}</strong>
                </div>
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Preparation Instructions</div>
                  <div style={styles.panelSub}>
                    Review the patient-facing preparation guidance.
                  </div>
                </div>
              </div>

              <div style={styles.instructionsBox}>
                {selectedExam.preparation}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Required Competencies</div>
                  <div style={styles.panelSub}>
                    Define user competencies required to perform this exam.
                  </div>
                </div>
              </div>

              <div style={styles.competencyGrid}>
                {competencyOptions.map((item) => {
                  const active = form.competencies.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleCompetency(item)}
                      style={
                        active ? styles.competencyActive : styles.competencyItem
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div style={styles.selectedCompetencies}>
                {form.competencies.map((item) => (
                  <span key={item} style={styles.badgeActive}>
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div style={styles.bottomGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Doctor Presence Rules</div>
                  <div style={styles.panelSub}>
                    Configure whether on-site radiologist or medical staff
                    presence is required.
                  </div>
                </div>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Presence Required</span>
                  <strong>
                    {selectedExam.doctorPresenceRequired ? "Yes" : "No"}
                  </strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Requirement Type</span>
                  <strong>{selectedExam.doctorPresenceType}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Minimum Doctors</span>
                  <strong>{selectedExam.minimumDoctorsRequired}</strong>
                </div>
              </div>

              <div style={styles.instructionsBoxAlt}>
                {selectedExam.doctorPresenceNotes}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>
                    Post-Procedure & SMS Rules
                  </div>
                  <div style={styles.panelSub}>
                    Review communication and post-procedure guidance.
                  </div>
                </div>
              </div>

              <div style={styles.detailBlock}>
                <div style={styles.detailTitle}>SMS Content Rules</div>
                <div style={styles.detailText}>{selectedExam.smsRules}</div>
              </div>

              <div style={styles.detailBlock}>
                <div style={styles.detailTitle}>
                  Post-Procedure Instructions
                </div>
                <div style={styles.detailText}>
                  {selectedExam.postProcedureInstructions}
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
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },

  topbar: {
    height: 52,
    background: "#1b1d20",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
  },

  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  headerLogo: {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 4,
  },

  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  topbarText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  topActionButton: {
    padding: "6px 10px",
    borderRadius: 4,
    background: "#252a31",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 11,
    color: "rgba(255,255,255,0.72)",
  },

  topInfoPill: {
    padding: "6px 10px",
    borderRadius: 4,
    background: "#1f2c3b",
    border: "1px solid rgba(86,168,255,0.18)",
    fontSize: 11,
    fontWeight: 700,
    color: "#56a8ff",
  },

  userPill: {
    padding: "6px 10px",
    borderRadius: 4,
    background: "#2d8f52",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "calc(100vh - 52px)",
  },

  sidebar: {
    background: "#141618",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  sidebarHeader: {
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  sidebarTitle: {
    fontSize: 12,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "0.9px",
  },

  sidebarSub: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.56)",
  },

  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
  },

  examList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },

  examItem: {
    padding: "12px",
    background: "#17191d",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  examItemActive: {
    padding: "12px",
    background: "#1b1e22",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid rgba(86,168,255,0.22)",
  },

  examName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
  },

  examMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.58)",
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
    fontSize: 14,
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
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 110,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "12px",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
    resize: "vertical",
    fontFamily: "inherit",
  },

  statusCard: {
    marginTop: "auto",
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14,
  },

  statusTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.84)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 10,
  },

  dotGreen: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block",
  },

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block",
  },

  dotBlue: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block",
  },

  dotPurple: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block",
  },

  main: {
    padding: 20,
    background: "#111315",
  },

  headerPanel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  kicker: {
    fontSize: 11,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: 10,
  },

  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },

  pageSub: {
    margin: "8px 0 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 1.6,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  secondaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  metricsRow: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  metricCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 16,
  },

  metricLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff",
  },

  metricValueSmall: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: 18,
    marginTop: 18,
  },

  bottomGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  panel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18,
  },

  panelHeader: {
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
  },

  panelSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },

  message: {
    marginTop: 14,
    fontSize: 13,
    color: "#53c27a",
  },

  summaryBox: {
    marginTop: 16,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 14,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },

  instructionsBox: {
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 16,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.7,
    fontSize: 14,
  },

  instructionsBoxAlt: {
    marginTop: 16,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 16,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.7,
    fontSize: 14,
  },

  detailBlock: {
    marginTop: 14,
    padding: 14,
    borderRadius: 8,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  detailTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 8,
  },

  detailText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.6,
  },

  competencyGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  competencyItem: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#121417",
    color: "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontWeight: 600,
  },

  competencyActive: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(86,168,255,0.24)",
    background: "rgba(86,168,255,0.14)",
    color: "#56a8ff",
    cursor: "pointer",
    fontWeight: 700,
  },

  selectedCompetencies: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  badgeActive: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 12,
    fontWeight: 700,
  },

  readOnlyBox: {
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },

  readOnlyLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  readOnlyValue: {
    fontSize: 13,
    color: "#ffffff",
  },

  toggleBox: {
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },

  toggleLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },

  toggleActive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#2d8f52",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  toggleInactive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#b53d4a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
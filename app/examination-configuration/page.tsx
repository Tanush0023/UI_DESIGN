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
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          EXAM CONFIG • ACTIVE {activeCount} • INACTIVE {inactiveCount} • MODALITIES {modalityCount} • DOCTOR PRESENCE {doctorPresenceCount}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>EXAMINATION CONFIGURATION</div>
              <div style={styles.title}>Compact Examination Setup</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>Exam: {selectedExam.examCode}</div>
            <div style={styles.topInfoPill}>Modality: {selectedExam.modality}</div>
            <div style={styles.topInfoPill}>
              Presence: {selectedExam.doctorPresenceRequired ? "Required" : "Not Required"}
            </div>
            <button style={styles.ghostButton}>Export</button>
            <button style={styles.primaryButton}>Save Exam</button>
          </div>
        </div>

        {message ? <div style={styles.messageBanner}>{message}</div> : null}

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
              {selectedExam.doctorPresenceRequired ? "Required" : "Not Required"}
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <aside style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Exam Search</div>
                <div style={styles.panelSub}>Find and switch exam quickly</div>
              </div>
            </div>

            <div style={styles.filterSection}>
              <div style={styles.filterLabel}>Search</div>
              <input
                style={styles.input}
                placeholder="Exam, code, billing..."
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
                <span>{modalityCount} Modalities</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotPurple} />
                <span>{doctorPresenceCount} Need Doctor Presence</span>
              </div>
            </div>
          </aside>

          <section style={styles.centerArea}>
            <div style={styles.compactStack}>
              <form onSubmit={handleSave} style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Examination Details</div>
                    <div style={styles.panelSub}>
                      Manage exam data, billing, instructions, competencies, and doctor presence
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid4}>
                  <div>
                    <label style={styles.label}>Exam Name</label>
                    <input
                      style={styles.input}
                      value={form.examName}
                      onChange={(e) => handleFieldChange("examName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Exam Code</label>
                    <input
                      style={styles.input}
                      value={form.examCode}
                      onChange={(e) => handleFieldChange("examCode", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Modality</label>
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
                  </div>

                  <div>
                    <label style={styles.label}>Category</label>
                    <input
                      style={styles.input}
                      value={form.category}
                      onChange={(e) => handleFieldChange("category", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Body Part</label>
                    <input
                      style={styles.input}
                      value={form.bodyPart}
                      onChange={(e) => handleFieldChange("bodyPart", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Contrast</label>
                    <select
                      style={styles.select}
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
                    <label style={styles.label}>Billing Code</label>
                    <input
                      style={styles.input}
                      value={form.billingCode}
                      onChange={(e) => handleFieldChange("billingCode", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Medicare Item</label>
                    <input
                      style={styles.input}
                      value={form.medicareItemNumber}
                      onChange={(e) =>
                        handleFieldChange("medicareItemNumber", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Medicare Rebate</label>
                    <input
                      style={styles.input}
                      value={form.medicareRebateFee}
                      onChange={(e) =>
                        handleFieldChange("medicareRebateFee", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Out-of-pocket Fee</label>
                    <input
                      style={styles.input}
                      value={form.outOfPocketFee}
                      onChange={(e) =>
                        handleFieldChange("outOfPocketFee", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Private Billing Fee</label>
                    <input
                      style={styles.input}
                      value={form.privateBillingFee}
                      onChange={(e) =>
                        handleFieldChange("privateBillingFee", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Equipment Requirement</label>
                    <input
                      style={styles.input}
                      value={form.equipmentRequirement}
                      onChange={(e) =>
                        handleFieldChange("equipmentRequirement", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Duration</label>
                    <input
                      style={styles.input}
                      value={form.duration}
                      onChange={(e) => handleFieldChange("duration", e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Status</label>
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
                  </div>

                  <div style={styles.toggleBox}>
                    <div style={styles.toggleLabel}>Doctor Presence Required</div>
                    <button
                      type="button"
                      onClick={handleDoctorPresenceToggle}
                      style={
                        form.doctorPresenceRequired
                          ? styles.toggleActive
                          : styles.toggleInactive
                      }
                    >
                      {form.doctorPresenceRequired ? "Required" : "Not Required"}
                    </button>
                  </div>

                  <div>
                    <label style={styles.label}>Presence Type</label>
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
                  </div>

                  <div>
                    <label style={styles.label}>Minimum Doctors</label>
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
                      disabled={!form.doctorPresenceRequired}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Preparation</label>
                    <textarea
                      style={styles.textarea}
                      value={form.preparation}
                      onChange={(e) => handleFieldChange("preparation", e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Post-Procedure Instructions</label>
                    <textarea
                      style={styles.textarea}
                      value={form.postProcedureInstructions}
                      onChange={(e) =>
                        handleFieldChange("postProcedureInstructions", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>SMS Rules</label>
                    <textarea
                      style={styles.textarea}
                      value={form.smsRules}
                      onChange={(e) => handleFieldChange("smsRules", e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Doctor Presence Notes</label>
                    <textarea
                      style={styles.textarea}
                      value={form.doctorPresenceNotes}
                      onChange={(e) =>
                        handleFieldChange("doctorPresenceNotes", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "span 4" }}>
                    <label style={styles.label}>Operational Notes</label>
                    <textarea
                      style={styles.textarea}
                      value={form.notes}
                      onChange={(e) => handleFieldChange("notes", e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.ghostButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryButton}>
                    Save Exam
                  </button>
                </div>
              </form>

              <div style={styles.bottomGrid}>
                <section style={styles.panelCompact}>
                  <div style={styles.panelTitle}>Required Competencies</div>
                  <div style={styles.panelSub}>Toggle staff competencies for this exam</div>

                  <div style={styles.competencyGrid}>
                    {competencyOptions.map((item) => {
                      const active = form.competencies.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleCompetency(item)}
                          style={active ? styles.competencyActive : styles.competencyItem}
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

                <section style={styles.panelCompact}>
                  <div style={styles.panelTitle}>Configuration Summary</div>
                  <div style={styles.panelSub}>Current exam visibility and rule overview</div>

                  <div style={styles.summaryBoxCompact}>
                    <div style={styles.summaryRowMini}>
                      <span>Exam Name</span>
                      <strong>{selectedExam.examName}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Exam Code</span>
                      <strong>{selectedExam.examCode}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Modality</span>
                      <strong>{selectedExam.modality}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Body Part</span>
                      <strong>{selectedExam.bodyPart}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Billing Code</span>
                      <strong>{selectedExam.billingCode}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Presence Type</span>
                      <strong>{selectedExam.doctorPresenceType}</strong>
                    </div>
                    <div style={styles.summaryRowMini}>
                      <span>Minimum Doctors</span>
                      <strong>{selectedExam.minimumDoctorsRequired}</strong>
                    </div>
                  </div>
                </section>
              </div>

              <div style={styles.bottomGrid}>
                <section style={styles.panelCompact}>
                  <div style={styles.panelTitle}>Preparation Instructions</div>
                  <div style={styles.panelSub}>Patient-facing preparation guidance</div>
                  <div style={styles.instructionsBox}>{selectedExam.preparation}</div>
                </section>

                <section style={styles.panelCompact}>
                  <div style={styles.panelTitle}>Post-Procedure & SMS Rules</div>
                  <div style={styles.panelSub}>Communication and post-care guidance</div>

                  <div style={styles.detailBlock}>
                    <div style={styles.detailTitle}>SMS Rules</div>
                    <div style={styles.detailText}>{selectedExam.smsRules}</div>
                  </div>

                  <div style={styles.detailBlock}>
                    <div style={styles.detailTitle}>Post-Procedure</div>
                    <div style={styles.detailText}>
                      {selectedExam.postProcedureInstructions}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#030a16",
    color: "#ffffff",
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    overflowX: "hidden",
    overflowY: "auto"
  },

  topStrip: {
    height: 28,
    background: "#8d0d46",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    position: "sticky",
    top: 0,
    zIndex: 20
  },

  topStripText: {
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },

  collapseButton: {
    height: 20,
    minWidth: 20,
    borderRadius: 999,
    border: "none",
    background: "#d9d9d9",
    color: "#222",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1
  },

  appShell: {
    padding: 8,
    boxSizing: "border-box"
  },

  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(54,112,190,0.28)",
    borderRadius: 14,
    background: "#020d1f",
    padding: "8px 12px",
    marginBottom: 8,
    position: "sticky",
    top: 36,
    zIndex: 15
  },

  titleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  logo: {
    width: 24,
    height: 24,
    borderRadius: 5,
    objectFit: "cover"
  },

  eyebrow: {
    fontSize: 9,
    color: "#1da4ff",
    fontWeight: 800,
    letterSpacing: "1.2px"
  },

  title: {
    fontSize: 14,
    fontWeight: 800,
    marginTop: 1
  },

  titleActions: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap"
  },

  ghostButton: {
    height: 26,
    padding: "0 10px",
    borderRadius: 9,
    border: "1px solid rgba(54,112,190,0.32)",
    background: "#0d1d35",
    color: "#59b7ff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer"
  },

  primaryButton: {
    height: 26,
    padding: "0 12px",
    borderRadius: 9,
    border: "none",
    background: "#00a96e",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer"
  },

  topInfoPill: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "#0d1d35",
    border: "1px solid rgba(54,112,190,0.28)",
    color: "#59b7ff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  messageBanner: {
    marginBottom: 8,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    background: "rgba(45,143,82,0.14)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a"
  },

  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    marginBottom: 8
  },

  metricCard: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 12,
    background: "#020d1f",
    padding: "8px 10px"
  },

  metricLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 3
  },

  metricValueSmall: {
    fontSize: 12,
    fontWeight: 800
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "0.75fr 2fr",
    gap: 8,
    alignItems: "start"
  },

  leftRail: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignSelf: "start",
    position: "sticky",
    top: 88
  },

  centerArea: {
    minWidth: 0
  },

  compactStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  panelCompact: {
    border: "1px solid rgba(54,112,190,0.24)",
    borderRadius: 14,
    background: "#020d1f",
    padding: 8
  },

  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6
  },

  panelTitle: {
    fontSize: 11,
    fontWeight: 800
  },

  panelSub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.56)",
    marginTop: 1
  },

  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  filterLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.72)"
  },

  examList: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },

  examItem: {
    padding: "7px 8px",
    background: "#071427",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(54,112,190,0.18)"
  },

  examItemActive: {
    padding: "7px 8px",
    background: "#0b213f",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid rgba(26,154,255,0.45)"
  },

  examName: {
    fontSize: 11,
    fontWeight: 800,
    color: "#ffffff"
  },

  examMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "rgba(255,255,255,0.58)"
  },

  input: {
    width: "100%",
    height: 26,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "0 8px",
    fontSize: 11,
    outline: "none",
    boxSizing: "border-box"
  },

  select: {
    width: "100%",
    height: 26,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "0 8px",
    fontSize: 11,
    outline: "none",
    boxSizing: "border-box"
  },

  textarea: {
    width: "100%",
    minHeight: 56,
    borderRadius: 9,
    border: "1px solid rgba(92,118,166,0.35)",
    background: "#0d1830",
    color: "#fff",
    padding: "8px",
    fontSize: 11,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },

  formGrid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 6
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 8
  },

  statusCard: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  statusTitle: {
    fontSize: 10,
    fontWeight: 800,
    marginBottom: 4
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 7
  },

  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block"
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotPurple: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
  },

  toggleBox: {
    height: 26,
    background: "#0d1830",
    border: "1px solid rgba(92,118,166,0.35)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px"
  },

  toggleLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)"
  },

  toggleActive: {
    height: 20,
    padding: "0 8px",
    borderRadius: 999,
    border: "none",
    background: "#00a96e",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer"
  },

  toggleInactive: {
    height: 20,
    padding: "0 8px",
    borderRadius: 999,
    border: "none",
    background: "#b53d4a",
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer"
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8
  },

  competencyGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8
  },

  competencyItem: {
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid rgba(54,112,190,0.18)",
    background: "#071427",
    color: "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 10
  },

  competencyActive: {
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid rgba(26,154,255,0.3)",
    background: "#0b213f",
    color: "#59b7ff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 10
  },

  selectedCompetencies: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8
  },

  badgeActive: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.18)",
    color: "#53c27a",
    fontSize: 9,
    fontWeight: 700
  },

  summaryBoxCompact: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8,
    marginTop: 6
  },

  summaryRowMini: {
    display: "flex",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 0",
    borderBottom: "1px solid rgba(54,112,190,0.12)",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)"
  },

  instructionsBox: {
    marginTop: 8,
    background: "#071427",
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    padding: 8,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.5,
    fontSize: 10
  },

  detailBlock: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    background: "#071427",
    border: "1px solid rgba(54,112,190,0.18)"
  },

  detailTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 4
  },

  detailText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5
  }
};
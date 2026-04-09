"use client";

import React, { CSSProperties, useMemo, useState } from "react";

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

export default function PatientRegistrationPage() {
  const [statusMessage, setStatusMessage] = useState<{ type: string; text: string } | null>(null);
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

  const updateSection = (section: keyof typeof formData, field: string, value: any) => {
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

    if (formatted.length === 7 && formData.medicare.medicareNumber.length >= 10) {
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
      generatePatientId(formData.patient.firstName, formData.patient.lastName);

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
      text:
        formData.notification.sendConfirmation
          ? `Saved. Patient ID ${patientId} created and notification queued.`
          : `Saved. Patient ID ${patientId} created.`
    });
  };

  const verificationTone =
    formData.medicare.verificationStatus === "Verified"
      ? styles.topInfoSuccess
      : formData.medicare.verificationStatus === "Failed"
      ? styles.topInfoDanger
      : styles.topInfoWarning;

  return (
    <div style={styles.page}>
      <div style={styles.topStrip}>
        <div style={styles.topStripText}>
          PATIENT REGISTRATION • MEDICARE {formData.medicare.verificationStatus.toUpperCase()} • NOTIFICATION {formData.notification.method.toUpperCase()}
        </div>
        <button style={styles.collapseButton}>⌄</button>
      </div>

      <div style={styles.appShell}>
        <div style={styles.titleBar}>
          <div style={styles.titleLeft}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.logo} />
            <div>
              <div style={styles.eyebrow}>PATIENT ONBOARDING</div>
              <div style={styles.title}>Compact Patient Registration</div>
            </div>
          </div>

          <div style={styles.titleActions}>
            <div style={styles.topInfoPill}>ID: {savedPatientId || "Pending"}</div>
            <div style={verificationTone}>
              Medicare: {formData.medicare.verificationStatus}
            </div>
            <button style={styles.ghostButton}>Reset</button>
            <button style={styles.primaryButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div
            style={{
              ...styles.messageBanner,
              background:
                statusMessage.type === "success"
                  ? "rgba(45,143,82,0.14)"
                  : "rgba(210,77,87,0.14)",
              color:
                statusMessage.type === "success" ? "#7fd19a" : "#f08b8b",
              border:
                statusMessage.type === "success"
                  ? "1px solid rgba(45,143,82,0.28)"
                  : "1px solid rgba(210,77,87,0.28)"
            }}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Patient ID</div>
            <div style={styles.metricValueSmall}>{savedPatientId || "Pending"}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Medicare</div>
            <div style={styles.metricValueSmall}>{formData.medicare.verificationStatus}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Modality</div>
            <div style={styles.metricValueSmall}>
              {formData.test.selectedModality
                ? modalities.find((m) => m.id === formData.test.selectedModality)?.name
                : "Not Selected"}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Notification</div>
            <div style={styles.metricValueSmall}>{formData.notification.method}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <section style={styles.leftRail}>
            <div style={styles.panelHeaderRow}>
              <div>
                <div style={styles.panelTitle}>Workflow</div>
                <div style={styles.panelSub}>Compact registration steps</div>
              </div>
            </div>

            <div style={styles.statusCard}>
              <div style={styles.statusRow}>
                <span style={styles.dotBlue} />
                <span>Patient details</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotGreen} />
                <span>Medicare capture</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotPurple} />
                <span>Study setup</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.dotRed} />
                <span>Notification + slot</span>
              </div>
            </div>

            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>Generated Patient ID</div>
              <div style={styles.infoText}>
                {savedPatientId || "Generated after save"}
              </div>
            </div>

            <div style={styles.summaryPanel}>
              <div style={styles.summaryTitle}>Quick Summary</div>
              <div style={styles.summaryRowMini}>
                <span>Name</span>
                <strong>
                  {formData.patient.firstName || "-"} {formData.patient.lastName || ""}
                </strong>
              </div>
              <div style={styles.summaryRowMini}>
                <span>Test</span>
                <strong>{formData.test.selectedTest || "-"}</strong>
              </div>
              <div style={styles.summaryRowMini}>
                <span>Form Link</span>
                <strong>{formData.notification.includeFormLink ? "Yes" : "No"}</strong>
              </div>
            </div>
          </section>

          <section style={styles.centerArea}>
            <div style={styles.compactStack}>
              <div style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Medicare</div>
                    <div style={styles.panelSub}>Card and verification</div>
                  </div>
                </div>

                <div style={styles.formGrid2}>
                  <div>
                    <label style={styles.label}>Medicare Number</label>
                    <input
                      style={styles.input}
                      placeholder="10 digit number"
                      value={formData.medicare.medicareNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        updateSection("medicare", "medicareNumber", value);
                      }}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Expiry</label>
                    <input
                      style={styles.input}
                      placeholder="MM/YYYY"
                      value={formData.medicare.expiryDate}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Patient Details</div>
                    <div style={styles.panelSub}>Demographics and contact</div>
                  </div>
                </div>

                <div style={styles.formGrid4}>
                  <div>
                    <label style={styles.label}>First Name *</label>
                    <input
                      style={styles.input}
                      value={formData.patient.firstName}
                      onChange={(e) =>
                        updateSection("patient", "firstName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Last Name *</label>
                    <input
                      style={styles.input}
                      value={formData.patient.lastName}
                      onChange={(e) =>
                        updateSection("patient", "lastName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>DOB *</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={formData.patient.dateOfBirth}
                      onChange={(e) =>
                        updateSection("patient", "dateOfBirth", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Gender</label>
                    <select
                      style={styles.select}
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
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      style={styles.input}
                      value={formData.patient.email}
                      onChange={(e) =>
                        updateSection("patient", "email", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Contact Number</label>
                    <input
                      style={styles.input}
                      value={formData.patient.contactNumber}
                      onChange={(e) =>
                        updateSection("patient", "contactNumber", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>Address Line 1</label>
                    <input
                      style={styles.input}
                      value={formData.patient.addressLine1}
                      onChange={(e) =>
                        updateSection("patient", "addressLine1", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Address Line 2</label>
                    <input
                      style={styles.input}
                      value={formData.patient.addressLine2}
                      onChange={(e) =>
                        updateSection("patient", "addressLine2", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>State</label>
                    <select
                      style={styles.select}
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
                    <label style={styles.label}>Suburb</label>
                    <input
                      style={styles.input}
                      value={formData.patient.suburb}
                      onChange={(e) =>
                        updateSection("patient", "suburb", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Postcode</label>
                    <input
                      style={styles.input}
                      value={formData.patient.postCode}
                      onChange={(e) =>
                        updateSection("patient", "postCode", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Contact Person</label>
                    <input
                      style={styles.input}
                      value={formData.patient.contactPerson}
                      onChange={(e) =>
                        updateSection("patient", "contactPerson", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Referrer Details</div>
                    <div style={styles.panelSub}>Referrer and clinical note setup</div>
                  </div>
                </div>

                <div style={styles.formGrid4}>
                  <div>
                    <label style={styles.label}>Provider Number</label>
                    <input
                      style={styles.input}
                      value={formData.referrer.providerNumber}
                      onChange={(e) =>
                        updateSection("referrer", "providerNumber", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Referrer Name</label>
                    <input
                      style={styles.input}
                      value={formData.referrer.referrerName}
                      onChange={(e) =>
                        updateSection("referrer", "referrerName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Date Referred</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={formData.referrer.dateReferred}
                      onChange={(e) =>
                        updateSection("referrer", "dateReferred", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Urgency</label>
                    <select
                      style={styles.select}
                      value={formData.referrer.referralUrgency}
                      onChange={(e) =>
                        updateSection("referrer", "referralUrgency", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option>Routine</option>
                      <option>Urgent</option>
                      <option>Immediate</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Referrer Email</label>
                    <input
                      type="email"
                      style={styles.input}
                      value={formData.referrer.referrerEmail}
                      onChange={(e) =>
                        updateSection("referrer", "referrerEmail", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Contact Number</label>
                    <input
                      style={styles.input}
                      value={formData.referrer.referrerContact}
                      onChange={(e) =>
                        updateSection("referrer", "referrerContact", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Speciality</label>
                    <input
                      style={styles.input}
                      value={formData.referrer.speciality}
                      onChange={(e) =>
                        updateSection("referrer", "speciality", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "span 4" }}>
                    <label style={styles.label}>Clinical Notes</label>
                    <textarea
                      style={styles.textarea}
                      rows={2}
                      value={formData.referrer.clinicalNotes}
                      onChange={(e) =>
                        updateSection("referrer", "clinicalNotes", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.rightRail}>
            <div style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Test Details</div>
                  <div style={styles.panelSub}>Study and machine setup</div>
                </div>
              </div>

              <div style={styles.formGrid1}>
                <div>
                  <label style={styles.label}>Modality *</label>
                  <select
                    style={styles.select}
                    value={formData.test.selectedModality}
                    onChange={(e) => {
                      updateSection("test", "selectedModality", e.target.value);
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
                  <label style={styles.label}>Test *</label>
                  <select
                    style={styles.select}
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

                <div style={styles.toggleBox}>
                  <div style={styles.toggleLabel}>Multi-Exam</div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(
                        "test",
                        "multiExamRequired",
                        !formData.test.multiExamRequired
                      )
                    }
                    style={
                      formData.test.multiExamRequired
                        ? styles.toggleActive
                        : styles.toggleInactive
                    }
                  >
                    {formData.test.multiExamRequired ? "On" : "Off"}
                  </button>
                </div>

                <div>
                  <label style={styles.label}>Second Test</label>
                  <select
                    style={styles.select}
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
                  <label style={styles.label}>Machine Allocation</label>
                  <input
                    style={styles.input}
                    placeholder="Suggested machine / room"
                    value={formData.test.machineAllocation}
                    onChange={(e) =>
                      updateSection("test", "machineAllocation", e.target.value)
                    }
                  />
                </div>

                <div style={styles.toggleBox}>
                  <div style={styles.toggleLabel}>Pre-Study Form</div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(
                        "test",
                        "preStudyFormRequired",
                        !formData.test.preStudyFormRequired
                      )
                    }
                    style={
                      formData.test.preStudyFormRequired
                        ? styles.toggleActive
                        : styles.toggleInactive
                    }
                  >
                    {formData.test.preStudyFormRequired ? "Required" : "Not Required"}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.panelCompact}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <div style={styles.panelTitle}>Notification Setup</div>
                  <div style={styles.panelSub}>Confirmation and prep messages</div>
                </div>
              </div>

              <div style={styles.formGrid1}>
                <div>
                  <label style={styles.label}>Notification Method</label>
                  <select
                    style={styles.select}
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

                <label style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Send confirmation</span>
                </label>

                <label style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Send preparation</span>
                </label>

                <label style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Include form link</span>
                </label>

                <div style={styles.summaryBoxCompact}>
                  <div style={styles.summaryRowMini}>
                    <span>Method</span>
                    <strong>{formData.notification.method}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Preparation</span>
                    <strong>{formData.notification.sendPreparation ? "Yes" : "No"}</strong>
                  </div>
                  <div style={styles.summaryRowMini}>
                    <span>Form Link</span>
                    <strong>{formData.notification.includeFormLink ? "Included" : "No"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {showTimeSlotCard && (
              <div style={styles.panelCompact}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <div style={styles.panelTitle}>Time Slot Selection</div>
                    <div style={styles.panelSub}>
                      Registration saved. Continue to booking.
                    </div>
                  </div>
                </div>

                <div style={styles.timeSlotCard}>
                  <div style={styles.timeSlotText}>
                    Registration complete. Next step is assigning an appointment slot.
                  </div>
                  <button
                    style={styles.primaryButton}
                    onClick={() => alert("Navigate to calendar / time slot page")}
                  >
                    Select Slot
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
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

  topInfoSuccess: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(45,143,82,0.16)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoWarning: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(196,145,49,0.16)",
    border: "1px solid rgba(196,145,49,0.28)",
    color: "#f2cb74",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoDanger: {
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "rgba(210,77,87,0.16)",
    border: "1px solid rgba(210,77,87,0.28)",
    color: "#f08b8b",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  messageBanner: {
    marginBottom: 8,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700
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
    gridTemplateColumns: "0.72fr 1.9fr 0.95fr",
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

  rightRail: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
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

  formGrid1: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 6
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6
  },

  formGrid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 6
  },

  label: {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.66)",
    marginBottom: 3
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
    minHeight: 52,
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

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10
  },

  checkboxLabel: {
    color: "rgba(255,255,255,0.82)"
  },

  statusCard: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 7
  },

  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block"
  },

  dotPurple: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  dotRed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  infoBox: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  infoTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: "#59b7ff",
    marginBottom: 4
  },

  infoText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)"
  },

  summaryPanel: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  summaryTitle: {
    fontSize: 10,
    fontWeight: 800,
    marginBottom: 4
  },

  summaryBoxCompact: {
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8,
    marginTop: 4
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

  timeSlotCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    border: "1px solid rgba(54,112,190,0.18)",
    borderRadius: 10,
    background: "#071427",
    padding: 8
  },

  timeSlotText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.4
  }
};
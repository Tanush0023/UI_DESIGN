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
        text: "Please complete all required fields."
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
          ? `Patient registration saved. Patient ID ${patientId} created and appointment notification queued.`
          : `Patient registration saved. Patient ID ${patientId} created.`
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
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <img src="/logo.jpg" alt="EsyRIS logo" style={styles.headerLogo} />
          <div style={styles.brand}>EsyRIS</div>
          <div style={styles.topbarText}>Patient Registration</div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.topInfoPill}>New Registration</div>
          <div style={verificationTone}>
            Medicare: {formData.medicare.verificationStatus}
          </div>
          <div style={styles.topInfoPill}>
            Notification: {formData.notification.method}
          </div>
          <div style={styles.userPill}>Registration Form</div>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>ONBOARDING</div>
            <div style={styles.sidebarSub}>
              Patient details, referral, study, and notification setup
            </div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusTitle}>Workflow</div>
            <div style={styles.statusRow}>
              <span style={styles.dotBlue} />
              <span>Patient profile creation</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotGreen} />
              <span>Referral and Medicare capture</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotPurple} />
              <span>Test and machine selection</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.dotRed} />
              <span>Notification and time slot step</span>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Generated Patient ID</div>
            <div style={styles.infoText}>
              {savedPatientId || "Will be generated after save"}
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          {statusMessage ? (
            <div
              style={{
                ...styles.messageBanner,
                background:
                  statusMessage.type === "success"
                    ? "rgba(45,143,82,0.16)"
                    : "rgba(210,77,87,0.16)",
                color:
                  statusMessage.type === "success" ? "#7fd19a" : "#f08b8b",
                border:
                  statusMessage.type === "success"
                    ? "1px solid rgba(45,143,82,0.32)"
                    : "1px solid rgba(210,77,87,0.32)"
              }}
            >
              {statusMessage.text}
            </div>
          ) : null}

          <div style={styles.headerPanel}>
            <div>
              <div style={styles.kicker}>PATIENT REGISTRATION / ONBOARDING</div>
              <h1 style={styles.pageTitle}>New Patient Registration</h1>
              <p style={styles.pageSub}>
                Create a new patient record, capture referral and Medicare
                details, assign examination type, and prepare for booking.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button style={styles.secondaryButton}>Reset</button>
              <button style={styles.primaryButton} onClick={handleSave}>
                Save Registration
              </button>
            </div>
          </div>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Patient ID</div>
              <div style={styles.metricValueSmall}>
                {savedPatientId || "Pending"}
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Medicare</div>
              <div style={styles.metricValueSmall}>
                {formData.medicare.verificationStatus}
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Modality</div>
              <div style={styles.metricValueSmall}>
                {formData.test.selectedModality
                  ? modalities.find((m) => m.id === formData.test.selectedModality)
                      ?.name
                  : "Not Selected"}
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Notification</div>
              <div style={styles.metricValueSmall}>
                {formData.notification.method}
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Medicare Details</div>
                <div style={styles.panelSub}>
                  Capture Medicare card and verification status.
                </div>
              </div>
            </div>

            <div style={styles.formGrid2}>
              <div>
                <label style={styles.label}>Medicare Number</label>
                <input
                  style={styles.input}
                  placeholder="Enter 10 digit Medicare number"
                  value={formData.medicare.medicareNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateSection("medicare", "medicareNumber", value);
                  }}
                />
              </div>

              <div>
                <label style={styles.label}>Expiry Date</label>
                <input
                  style={styles.input}
                  placeholder="MM/YYYY"
                  value={formData.medicare.expiryDate}
                  onChange={(e) => handleExpiryDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Patient Details</div>
                <div style={styles.panelSub}>
                  Demographics, contact information, and patient identity.
                </div>
              </div>
            </div>

            <div style={styles.formGrid3}>
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
                <label style={styles.label}>Date of Birth *</label>
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
                <label style={styles.label}>Mobile / Contact Number</label>
                <input
                  style={styles.input}
                  value={formData.patient.contactNumber}
                  onChange={(e) =>
                    updateSection("patient", "contactNumber", e.target.value)
                  }
                />
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
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
                  <option value="">Select State</option>
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

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelTitle}>Referrer Details</div>
                <div style={styles.panelSub}>
                  Referrer identity, urgency, and clinical notes.
                </div>
              </div>
            </div>

            <div style={styles.formGrid3}>
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
                <label style={styles.label}>Speciality</label>
                <input
                  style={styles.input}
                  value={formData.referrer.speciality}
                  onChange={(e) =>
                    updateSection("referrer", "speciality", e.target.value)
                  }
                />
              </div>

              <div style={{ gridColumn: "1 / span 3" }}>
                <label style={styles.label}>Clinical Notes</label>
                <textarea
                  style={styles.textarea}
                  rows={4}
                  value={formData.referrer.clinicalNotes}
                  onChange={(e) =>
                    updateSection("referrer", "clinicalNotes", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Test Details</div>
                  <div style={styles.panelSub}>
                    Select modality, examination type, machine allocation, and pre-study form needs.
                  </div>
                </div>
              </div>

              <div style={styles.formGrid2}>
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
                    <option value="">Select Modality</option>
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
                    <option value="">Select Test</option>
                    {filteredTests.map((test) => (
                      <option key={test}>{test}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.toggleBox}>
                  <div style={styles.toggleLabel}>Multi-Exam Booking</div>
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
                    {formData.test.multiExamRequired ? "Enabled" : "Disabled"}
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
                    <option value="">Select Second Test</option>
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
                  <div style={styles.toggleLabel}>Pre-Study Form Required</div>
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
            </section>

            <section style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Notification Setup</div>
                  <div style={styles.panelSub}>
                    Configure appointment confirmation and preparation notifications.
                  </div>
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

                <div style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Send appointment confirmation</span>
                </div>

                <div style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Send preparation instructions</span>
                </div>

                <div style={styles.checkboxRow}>
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
                  <span style={styles.checkboxLabel}>Include pre-study form link</span>
                </div>

                <div style={styles.summaryBox}>
                  <div style={styles.summaryRow}>
                    <span>Notification Method</span>
                    <strong>{formData.notification.method}</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Preparation Message</span>
                    <strong>
                      {formData.notification.sendPreparation ? "Yes" : "No"}
                    </strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Form Link</span>
                    <strong>
                      {formData.notification.includeFormLink ? "Included" : "Not Included"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {showTimeSlotCard && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>Time Slot Selection</div>
                  <div style={styles.panelSub}>
                    Registration saved. Continue to booking calendar and select a time slot.
                  </div>
                </div>
              </div>

              <div style={styles.timeSlotCard}>
                <div style={styles.timeSlotText}>
                  Patient registration is complete. The next step is to assign an appointment slot.
                </div>
                <button
                  style={styles.primaryButton}
                  onClick={() => alert("Navigate to calendar / time slot page")}
                >
                  Select Time Slot
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111315",
    color: "#ffffff",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif"
  },

  topbar: {
    height: 52,
    background: "#1b1d20",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px"
  },

  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  headerLogo: {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 4
  } as CSSProperties,

  brand: {
    fontSize: 18,
    fontWeight: 700
  },

  topbarText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)"
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const
  },

  topInfoPill: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "#1f2c3b",
    border: "1px solid rgba(86,168,255,0.18)",
    color: "#56a8ff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoSuccess: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(45,143,82,0.18)",
    border: "1px solid rgba(45,143,82,0.28)",
    color: "#7fd19a",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoWarning: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(196,145,49,0.18)",
    border: "1px solid rgba(196,145,49,0.28)",
    color: "#f2cb74",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  topInfoDanger: {
    height: 34,
    padding: "0 12px",
    borderRadius: 6,
    background: "rgba(210,77,87,0.18)",
    border: "1px solid rgba(210,77,87,0.28)",
    color: "#f08b8b",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  userPill: {
    height: 34,
    padding: "0 14px",
    borderRadius: 6,
    background: "#2d8f52",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "calc(100vh - 52px)"
  },

  sidebar: {
    background: "#141618",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 18
  } as const,

  sidebarHeader: {
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },

  sidebarTitle: {
    fontSize: 12,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "0.9px"
  },

  sidebarSub: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.56)"
  },

  statusCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14
  },

  statusTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.84)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.7px"
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 10
  },

  dotBlue: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#56a8ff",
    display: "inline-block"
  },

  dotGreen: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2d8f52",
    display: "inline-block"
  },

  dotPurple: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#9b6bff",
    display: "inline-block"
  },

  dotRed: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#d24d57",
    display: "inline-block"
  },

  infoBox: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#56a8ff",
    marginBottom: 8
  },

  infoText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)"
  },

  main: {
    padding: 20,
    background: "#111315"
  },

  messageBanner: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600
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
    marginBottom: 18
  },

  kicker: {
    fontSize: 11,
    color: "#56a8ff",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: 10
  },

  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700
  },

  pageSub: {
    margin: "8px 0 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 1.6
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },

  primaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "none",
    background: "#2d8f52",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  secondaryButton: {
    height: 38,
    padding: "0 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#252a31",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  metricsRow: {
    marginBottom: 18,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14
  },

  metricCard: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 16
  },

  metricLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 8
  },

  metricValueSmall: {
    fontSize: 18,
    fontWeight: 700
  },

  panel: {
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 18,
    marginBottom: 18
  },

  panelHeader: {
    marginBottom: 16
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 700
  },

  panelSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)"
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: 18
  },

  formGrid1: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },

  formGrid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)"
  },

  input: {
    width: "100%",
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "0 12px",
    boxSizing: "border-box" as const,
    fontSize: 14,
    outline: "none"
  } as const,

  select: {
    width: "100%",
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "0 12px",
    boxSizing: "border-box" as const,
    fontSize: 14,
    outline: "none"
  } as const,

  textarea: {
    width: "100%",
    minHeight: 100,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    color: "#ffffff",
    padding: "12px",
    boxSizing: "border-box" as const,
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit"
  } as const,

  toggleBox: {
    height: 42,
    background: "#101215",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px"
  },

  toggleLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)"
  },

  toggleActive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#2d8f52",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  toggleInactive: {
    height: 28,
    padding: "0 10px",
    borderRadius: 999,
    border: "none",
    background: "#b53d4a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14
  },

  checkboxLabel: {
    color: "rgba(255,255,255,0.82)"
  },

  summaryBox: {
    marginTop: 8,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 14
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 14
  },

  timeSlotCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    background: "#121417",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 18
  },

  timeSlotText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.6
  }
};
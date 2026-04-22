"use client";

import React, { useEffect, useMemo, useState } from "react";

type Modality = "Ultrasound" | "CT" | "MRI" | "X-Ray";
type TemplateStatus = "Active" | "Draft" | "Archived";

type TemplateRecord = {
  id: number;
  name: string;
  modality: Modality;
  examType: string;
  status: TemplateStatus;
  mappedExaminations: string[];
  comparison: string;
  technique: string[];
  findings: string;
  conclusion: string;
  impressions: string;
  autoLoad: boolean;
  allowTemplateOverride: boolean;
  lateralityHighlighting: boolean;
  lowConfidenceThreshold: number;
  lastUpdated: string;
  author: string;
};

type MacroRecord = {
  id: number;
  label: string;
  content: string;
  modality: Modality | "General";
};

type ReferenceRecord = {
  id: number;
  title: string;
  content: string;
  category: string;
};

const templateSeed: TemplateRecord[] = [
  {
    id: 1,
    name: "Abdominal Ultrasound",
    modality: "Ultrasound",
    examType: "Abdominal Ultrasound",
    status: "Active",
    mappedExaminations: [
      "Abdominal Ultrasound",
      "Male Pelvis Ultrasound",
      "Carotid Doppler"
    ],
    comparison: "No comparison available",
    technique: [
      "Abdominal Ultrasound",
      "Male Pelvis Ultrasound",
      "Carotid Doppler"
    ],
    findings:
      "[Sample Text]\n\nBrain is normal, no intracranial space-occupying lesions, no hydrocephalus, no extra axial collection, no diffuse restriction, no lobar products.",
    conclusion: "[Sample Text]",
    impressions: "No acute abnormality identified.",
    autoLoad: true,
    allowTemplateOverride: true,
    lateralityHighlighting: true,
    lowConfidenceThreshold: 80,
    lastUpdated: "2026-03-27 09:10",
    author: "Dr Olivia Kent"
  },
  {
    id: 2,
    name: "Pelvic Ultrasound",
    modality: "Ultrasound",
    examType: "Pelvic Ultrasound",
    status: "Active",
    mappedExaminations: ["Pelvic Ultrasound", "Female Pelvis Ultrasound"],
    comparison: "Prior pelvic ultrasound if available.",
    technique: ["Pelvic Ultrasound"],
    findings:
      "Uterus and adnexa assessed. No focal suspicious lesion identified.",
    conclusion: "No significant pelvic sonographic abnormality.",
    impressions: "Routine pelvic ultrasound template.",
    autoLoad: true,
    allowTemplateOverride: true,
    lateralityHighlighting: true,
    lowConfidenceThreshold: 80,
    lastUpdated: "2026-03-26 15:20",
    author: "Dr Helen Morris"
  },
  {
    id: 3,
    name: "Thyroid Ultrasound",
    modality: "Ultrasound",
    examType: "Thyroid Ultrasound",
    status: "Active",
    mappedExaminations: ["Thyroid Ultrasound"],
    comparison: "No prior thyroid imaging available.",
    technique: ["Thyroid Ultrasound"],
    findings:
      "Both thyroid lobes assessed. No suspicious dominant thyroid nodule.",
    conclusion: "No suspicious thyroid abnormality.",
    impressions: "Standard thyroid template.",
    autoLoad: true,
    allowTemplateOverride: true,
    lateralityHighlighting: true,
    lowConfidenceThreshold: 75,
    lastUpdated: "2026-03-25 12:40",
    author: "Dr Nolan Hart"
  },
  {
    id: 4,
    name: "Carotid Doppler",
    modality: "Ultrasound",
    examType: "Carotid Doppler",
    status: "Draft",
    mappedExaminations: ["Carotid Doppler"],
    comparison: "Comparison with previous Doppler if available.",
    technique: ["Carotid Doppler"],
    findings:
      "Bilateral carotid Doppler assessment performed with peak systolic velocity measurements.",
    conclusion: "No hemodynamically significant stenosis.",
    impressions: "Draft carotid Doppler template.",
    autoLoad: true,
    allowTemplateOverride: true,
    lateralityHighlighting: true,
    lowConfidenceThreshold: 80,
    lastUpdated: "2026-03-24 11:05",
    author: "Dr Smith"
  },
  {
    id: 5,
    name: "Renal Ultrasound",
    modality: "Ultrasound",
    examType: "Renal Ultrasound",
    status: "Active",
    mappedExaminations: ["Renal Ultrasound"],
    comparison: "No comparison available",
    technique: ["Renal Ultrasound"],
    findings: "Kidneys and bladder assessed. No hydronephrosis.",
    conclusion: "No acute renal sonographic abnormality.",
    impressions: "Standard renal ultrasound template.",
    autoLoad: true,
    allowTemplateOverride: true,
    lateralityHighlighting: true,
    lowConfidenceThreshold: 80,
    lastUpdated: "2026-03-23 08:55",
    author: "Dr Amy Song"
  }
];

const macroSeed: MacroRecord[] = [
  {
    id: 1,
    label: "Normal abdominal study",
    content:
      "Liver, gallbladder, pancreas, spleen and kidneys are unremarkable. No focal abnormality identified.",
    modality: "Ultrasound"
  },
  {
    id: 2,
    label: "No hydronephrosis",
    content: "No hydronephrosis is seen in either kidney.",
    modality: "Ultrasound"
  },
  {
    id: 3,
    label: "No significant stenosis",
    content: "No hemodynamically significant stenosis is identified.",
    modality: "Ultrasound"
  },
  {
    id: 4,
    label: "Degenerative changes",
    content: "Degenerative changes are present without acute osseous abnormality.",
    modality: "General"
  }
];

const referenceSeed: ReferenceRecord[] = [
  {
    id: 1,
    title: "Laterality Check",
    content: "Verify right / left consistency before saving or authorizing.",
    category: "Proofing"
  },
  {
    id: 2,
    title: "Template Override Rule",
    content: "Radiologist may select a different template when clinically appropriate.",
    category: "Workflow"
  },
  {
    id: 3,
    title: "Confidence Highlighting",
    content: "Directional words and low-confidence dictated words can be visually highlighted.",
    category: "Editor"
  }
];

const examLibrary = [
  "Abdominal Ultrasound",
  "Male Pelvis Ultrasound",
  "Female Pelvis Ultrasound",
  "Pelvic Ultrasound",
  "Thyroid Ultrasound",
  "Carotid Doppler",
  "Renal Ultrasound",
  "Vascular Doppler",
  "Chest X-ray",
  "CT Lumbosacral Spine",
  "CT Abdomen",
  "MRI Brain"
];

const lateralityTerms = [
  "right",
  "left",
  "superior",
  "inferior",
  "anterior",
  "posterior",
  "high",
  "low",
  "less",
  "more"
];

const panelClass =
  "rounded-[22px] border border-[#17355c] bg-[#041126]/95 backdrop-blur-sm";
const subPanelClass =
  "rounded-[18px] border border-[#1e406a] bg-[#09162d]/90";
const inputClass =
  "h-10 w-full rounded-xl border border-[#29446d] bg-[#0c1830] px-3 text-[13px] text-white outline-none placeholder:text-white/35";
const selectClass =
  "h-10 w-full rounded-xl border border-[#29446d] bg-[#0c1830] px-3 text-[13px] text-white outline-none";
const smallBtn =
  "h-9 rounded-xl px-4 text-[12px] font-bold transition";
const labelClass = "mb-1 block text-[11px] font-semibold text-white/75";

function highlightDirectionalWords(text: string) {
  const words = text.split(/(\s+)/);
  return words.map((word, idx) => {
    const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
    const highlighted = lateralityTerms.includes(normalized);
    return (
      <span
        key={idx}
        className={highlighted ? "text-amber-300" : "text-white/85"}
      >
        {word}
      </span>
    );
  });
}

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(templateSeed);
  const [macros, setMacros] = useState<MacroRecord[]>(macroSeed);
  const [references, setReferences] = useState<ReferenceRecord[]>(referenceSeed);

  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [macroSearch, setMacroSearch] = useState("");
  const [referenceSearch, setReferenceSearch] = useState("");
  const [message, setMessage] = useState("");
  const [examToAdd, setExamToAdd] = useState("Renal Ultrasound");

  const selectedTemplate =
    templates.find((item) => item.id === selectedId) ?? templates[0];
  const [form, setForm] = useState<TemplateRecord>(selectedTemplate);

  useEffect(() => {
    setForm(JSON.parse(JSON.stringify(selectedTemplate)));
    setMessage("");
  }, [selectedTemplate]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((item) => {
      const text =
        `${item.name} ${item.examType} ${item.modality} ${item.status} ${item.mappedExaminations.join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [templates, search]);

  const filteredMacros = useMemo(() => {
    const q = macroSearch.trim().toLowerCase();
    if (!q) return macros;
    return macros.filter((item) =>
      `${item.label} ${item.content} ${item.modality}`.toLowerCase().includes(q)
    );
  }, [macros, macroSearch]);

  const filteredReferences = useMemo(() => {
    const q = referenceSearch.trim().toLowerCase();
    if (!q) return references;
    return references.filter((item) =>
      `${item.title} ${item.content} ${item.category}`.toLowerCase().includes(q)
    );
  }, [references, referenceSearch]);

  const activeCount = templates.filter((t) => t.status === "Active").length;
  const draftCount = templates.filter((t) => t.status === "Draft").length;
  const autoLoadCount = templates.filter((t) => t.autoLoad).length;

  const availableExamAdds = examLibrary.filter(
    (item) => !form.mappedExaminations.includes(item)
  );

  const updateField = <K extends keyof TemplateRecord>(
    field: K,
    value: TemplateRecord[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTechniqueChange = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      technique: prev.technique.map((item, idx) =>
        idx === index ? value : item
      )
    }));
  };

  const removeTechnique = (index: number) => {
    setForm((prev) => ({
      ...prev,
      technique: prev.technique.filter((_, idx) => idx !== index)
    }));
  };

  const addTechnique = () => {
    setForm((prev) => ({
      ...prev,
      technique: [...prev.technique, "New Technique"]
    }));
  };

  const removeMappedExam = (exam: string) => {
    setForm((prev) => ({
      ...prev,
      mappedExaminations: prev.mappedExaminations.filter((e) => e !== exam)
    }));
  };

  const addMappedExam = () => {
    if (!examToAdd || form.mappedExaminations.includes(examToAdd)) return;
    setForm((prev) => ({
      ...prev,
      mappedExaminations: [...prev.mappedExaminations, examToAdd]
    }));
    setMessage(`Added ${examToAdd} to template mapping.`);
  };

  const insertMacro = (content: string) => {
    setForm((prev) => ({
      ...prev,
      findings: prev.findings ? `${prev.findings}\n${content}` : content
    }));
    setMessage("Macro inserted into findings.");
  };

  const createNewTemplate = () => {
    const newId = Date.now();
    const newTemplate: TemplateRecord = {
      id: newId,
      name: "New Template",
      modality: "Ultrasound",
      examType: "Abdominal Ultrasound",
      status: "Draft",
      mappedExaminations: ["Abdominal Ultrasound"],
      comparison: "",
      technique: ["Abdominal Ultrasound"],
      findings: "",
      conclusion: "",
      impressions: "",
      autoLoad: true,
      allowTemplateOverride: true,
      lateralityHighlighting: true,
      lowConfidenceThreshold: 80,
      lastUpdated: "2026-03-27 10:10",
      author: "Radiologist User"
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedId(newId);
    setMessage("New template created.");
  };

  const saveTemplate = () => {
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === form.id
          ? {
              ...form,
              lastUpdated: "2026-03-27 10:15"
            }
          : item
      )
    );
    setMessage("Template saved successfully.");
  };

  const deleteTemplate = () => {
    if (templates.length <= 1) {
      setMessage("At least one template must remain.");
      return;
    }
    const remaining = templates.filter((item) => item.id !== form.id);
    setTemplates(remaining);
    setSelectedId(remaining[0].id);
    setMessage("Template deleted.");
  };

  const autoLoadedExamTemplate = useMemo(() => {
    return templates.find(
      (item) =>
        item.examType === selectedTemplate.examType &&
        item.autoLoad &&
        item.status !== "Archived"
    );
  }, [templates, selectedTemplate.examType]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#132b60_0%,#07122a_28%,#020814_60%,#01040c_100%)] text-white">
      <div className="mx-auto max-w-[1700px] p-3">
        <div className={`${panelClass} mb-3 px-4 py-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo.jpg"
                alt="EsyRIS logo"
                className="h-11 w-11 rounded-xl border border-[#2a4570] bg-[#102349] object-cover"
              />
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-sky-300">
                  REPORT TEMPLATE ENGINE
                </div>
                <div className="truncate text-[16px] font-extrabold">
                  Build template management UI
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex h-9 items-center rounded-xl border border-[#2a4570] bg-[#102349] px-4 text-[12px] font-semibold text-sky-200">
                Active: {activeCount}
              </div>
              <div className="inline-flex h-9 items-center rounded-xl border border-[#2a4570] bg-[#102349] px-4 text-[12px] font-semibold text-sky-200">
                Auto-load: {autoLoadCount}
              </div>
              <button
                onClick={createNewTemplate}
                className={`${smallBtn} border border-[#35598b] bg-[#102349] text-sky-200`}
              >
                + New Template
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[12px] font-semibold text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className={`${panelClass} min-h-[860px] p-3`}>
            <div className="mb-3">
              <input
                className={inputClass}
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={`${subPanelClass} mb-3 p-3`}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-extrabold">Exam Templates</div>
                <div className="text-[12px] text-white/50">⌃</div>
              </div>
            </div>

            <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
              {filteredTemplates.map((template) => {
                const selected = template.id === selectedId;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_24px_rgba(34,197,94,0.2)]"
                        : "border-[#26476e] bg-[#0b1730]/90 hover:bg-[#102349]/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          selected ? "bg-emerald-400" : "bg-sky-300/35"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-bold">
                          {template.name}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={`${subPanelClass} mt-3 p-3`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13px] font-extrabold">Macros</div>
                <div className="text-[11px] text-sky-300">({macros.length})</div>
              </div>
              <input
                className={`${inputClass} mb-2`}
                placeholder="Search macros..."
                value={macroSearch}
                onChange={(e) => setMacroSearch(e.target.value)}
              />
              <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {filteredMacros.map((macro) => (
                  <button
                    key={macro.id}
                    onClick={() => insertMacro(macro.content)}
                    className="w-full rounded-xl border border-[#29446d] bg-[#102349]/70 px-3 py-2 text-left"
                  >
                    <div className="text-[12px] font-bold">{macro.label}</div>
                    <div className="mt-1 text-[10px] text-white/50">
                      {macro.modality}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${subPanelClass} mt-3 p-3`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13px] font-extrabold">References</div>
                <div className="text-[11px] text-sky-300">({references.length})</div>
              </div>
              <input
                className={`${inputClass} mb-2`}
                placeholder="Search references..."
                value={referenceSearch}
                onChange={(e) => setReferenceSearch(e.target.value)}
              />
              <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {filteredReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="rounded-xl border border-[#29446d] bg-[#102349]/70 px-3 py-2"
                  >
                    <div className="text-[12px] font-bold">{ref.title}</div>
                    <div className="mt-1 text-[10px] text-white/50">
                      {ref.category}
                    </div>
                    <div className="mt-2 text-[11px] text-white/75">
                      {ref.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className={`${panelClass} min-h-[860px] p-4`}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Template Name</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-12 text-[16px]`}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                    ✎
                  </button>
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>Examinations</label>
                  <select
                    className={selectClass}
                    value={form.examType}
                    onChange={(e) => updateField("examType", e.target.value)}
                  >
                    {examLibrary.map((exam) => (
                      <option key={exam}>{exam}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Modality</label>
                  <select
                    className={selectClass}
                    value={form.modality}
                    onChange={(e) =>
                      updateField("modality", e.target.value as Modality)
                    }
                  >
                    <option>Ultrasound</option>
                    <option>CT</option>
                    <option>MRI</option>
                    <option>X-Ray</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-3">
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={selectClass}
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as TemplateStatus)
                    }
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex h-10 items-center gap-2 rounded-xl border border-[#29446d] bg-[#0c1830] px-3 text-[12px] text-white">
                    <input
                      type="checkbox"
                      checked={form.autoLoad}
                      onChange={(e) => updateField("autoLoad", e.target.checked)}
                    />
                    <span>Auto-load template</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <label className="flex h-10 items-center gap-2 rounded-xl border border-[#29446d] bg-[#0c1830] px-3 text-[12px] text-white">
                    <input
                      type="checkbox"
                      checked={form.allowTemplateOverride}
                      onChange={(e) =>
                        updateField("allowTemplateOverride", e.target.checked)
                      }
                    />
                    <span>Allow override</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Comparison</label>
                <input
                  className={inputClass}
                  value={form.comparison}
                  onChange={(e) => updateField("comparison", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Technique</label>
                <div className="rounded-2xl border border-[#29446d] bg-[#0c1830] p-3">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {form.technique.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                          index === 0
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                            : index === 1
                            ? "border-teal-400/40 bg-teal-500/15 text-teal-200"
                            : "border-indigo-400/40 bg-indigo-500/15 text-indigo-200"
                        }`}
                      >
                        <input
                          className="w-[120px] bg-transparent outline-none"
                          value={item}
                          onChange={(e) =>
                            handleTechniqueChange(index, e.target.value)
                          }
                        />
                        <button onClick={() => removeTechnique(index)}>×</button>
                      </div>
                    ))}

                    <button
                      onClick={addTechnique}
                      className="rounded-lg border border-[#446ca0] bg-[#1b2f5f] px-4 py-2 text-[12px] font-bold text-sky-200"
                    >
                      + Add Examinations
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Findings</label>
                <div className="rounded-2xl border border-[#29446d] bg-[#0c1830]">
                  <div className="flex h-10 items-center gap-4 border-b border-[#29446d] px-4 text-[13px] text-white/70">
                    <span className="font-bold">B</span>
                    <span className="italic">I</span>
                    <span>≡</span>
                    <span>≣</span>
                    <span>⋯</span>
                    <span className="ml-auto">⌄</span>
                  </div>
                  <textarea
                    className="min-h-[170px] w-full resize-none bg-transparent p-4 text-[14px] leading-7 text-white outline-none"
                    value={form.findings}
                    onChange={(e) => updateField("findings", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Conclusion</label>
                <textarea
                  className="min-h-[90px] w-full rounded-2xl border border-[#29446d] bg-[#0c1830] p-4 text-[14px] text-white outline-none"
                  value={form.conclusion}
                  onChange={(e) => updateField("conclusion", e.target.value)}
                />
              </div>

              <div className="border-t border-[#1e406a] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={deleteTemplate}
                    className={`${smallBtn} border border-rose-400/40 bg-rose-500/10 text-rose-200`}
                  >
                    Delete
                  </button>

                  <div className="flex gap-2">
                    <button
                      className={`${smallBtn} border border-[#35598b] bg-[#102349] text-white/80`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTemplate}
                      className={`${smallBtn} border border-sky-400/40 bg-sky-600/80 text-white`}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className={`${panelClass} min-h-[860px] p-3`}>
            <div className={`${subPanelClass} mb-3 p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">
                Template Mapping
              </div>
              <div className="mb-3 text-[11px] text-white/55">
                Exam-specific templates auto-load at reporting start, with override support.
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {form.mappedExaminations.map((exam, idx) => (
                  <div
                    key={`${exam}-${idx}`}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                      idx === 0
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : idx === 1
                        ? "border-teal-400/40 bg-teal-500/15 text-teal-200"
                        : "border-indigo-400/40 bg-indigo-500/15 text-indigo-200"
                    }`}
                  >
                    <span>{exam}</span>
                    <button onClick={() => removeMappedExam(exam)}>×</button>
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <select
                  className={selectClass}
                  value={examToAdd}
                  onChange={(e) => setExamToAdd(e.target.value)}
                >
                  {availableExamAdds.length === 0 ? (
                    <option>No more examinations</option>
                  ) : (
                    availableExamAdds.map((item) => (
                      <option key={item}>{item}</option>
                    ))
                  )}
                </select>
                <button
                  onClick={addMappedExam}
                  className={`${smallBtn} border border-[#446ca0] bg-[#1b2f5f] text-sky-200`}
                >
                  + Add Mapping
                </button>
              </div>
            </div>

            <div className={`${subPanelClass} mb-3 p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">
                Auto-load Preview
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Exam: <strong>{form.examType}</strong>
                </div>
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Auto-loaded Template:{" "}
                  <strong>{autoLoadedExamTemplate?.name || "None"}</strong>
                </div>
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Override Allowed:{" "}
                  <strong>{form.allowTemplateOverride ? "Yes" : "No"}</strong>
                </div>
              </div>
            </div>

            <div className={`${subPanelClass} mb-3 p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">
                Reporting Rules
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[12px]">
                  <input
                    type="checkbox"
                    checked={form.lateralityHighlighting}
                    onChange={(e) =>
                      updateField("lateralityHighlighting", e.target.checked)
                    }
                  />
                  <span>Enable directional highlighting</span>
                </label>

                <div>
                  <label className={labelClass}>
                    Low confidence threshold (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    className={inputClass}
                    value={form.lowConfidenceThreshold}
                    onChange={(e) =>
                      updateField("lowConfidenceThreshold", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={`${subPanelClass} mb-3 p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">Preview</div>
              <div className="rounded-xl border border-[#29446d] bg-[#0c1830] p-3 text-[12px] leading-6">
                <div className="mb-2 font-bold text-sky-200">{form.name}</div>
                <div className="mb-2 text-white/60">Findings</div>
                <div>{highlightDirectionalWords(form.findings)}</div>
                <div className="mt-4 mb-2 text-white/60">Conclusion</div>
                <div>{highlightDirectionalWords(form.conclusion)}</div>
              </div>
            </div>

            <div className={`${subPanelClass} p-3`}>
              <div className="mb-2 text-[13px] font-extrabold">
                Audit Summary
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Author: <strong>{form.author}</strong>
                </div>
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Updated: <strong>{form.lastUpdated}</strong>
                </div>
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Status: <strong>{form.status}</strong>
                </div>
                <div className="rounded-xl bg-[#102349]/70 px-3 py-2">
                  Draft Templates: <strong>{draftCount}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
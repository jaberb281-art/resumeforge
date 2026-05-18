"use client";
// =============================================================
// ResumeForge — Editor Page
// src/app/editor/[id]/page.tsx
//
// Split-screen: Form (left) ↔ Live PDF Preview (right)
// Dark dashboard shell, clean white resume paper.
// =============================================================

import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import {
    User, Briefcase, GraduationCap, Code2, Wrench, Award,
    Wand2, Download, Save, Eye, Columns2,
    ChevronRight, Plus, Trash2, GripVertical, CheckCircle2,
    Loader2, Palette, X
} from "lucide-react";
import {
    useResumeStore, THEME_PRESETS, EMPTY_RESUME_DATA,
    type ResumeTemplate, type AiSuggestion, type ResumeData,
} from "@/store/useResumeStore";
import { v4 as uuidv4 } from "uuid";

// ─── Lazy-load BlobProvider (client-only, heavy) ─────────────
// Use BlobProvider + a controlled iframe instead of PDFViewer.
// PDFViewer creates its own iframe and can mis-measure height/scale inside
// split panes, causing tiny text, forced second pages, and unstable preview.
const BlobProvider = dynamic(
    () => import("@react-pdf/renderer").then((m) => ({ default: m.BlobProvider })),
    { ssr: false, loading: () => <PDFSkeleton /> }
);

import { getTemplate } from "@/features/pdf/registry";
import type { DocumentProps } from "@react-pdf/renderer";

function PDFFrame({
    blob,
    error,
}: {
    blob: Blob | null;
    error: Error | null;
}) {
    const srcRef = useRef<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        if (!blob) return;

        const nextSrc = URL.createObjectURL(blob);
        if (srcRef.current) URL.revokeObjectURL(srcRef.current);
        srcRef.current = nextSrc;
        if (iframeRef.current) iframeRef.current.src = nextSrc;

        return () => {
            if (srcRef.current === nextSrc) {
                URL.revokeObjectURL(nextSrc);
                srcRef.current = null;
            }
        };
    }, [blob]);

    useEffect(() => {
        return () => {
            if (srcRef.current) URL.revokeObjectURL(srcRef.current);
            srcRef.current = null;
        };
    }, []);

    if (error) {
        console.error("[pdf preview] BlobProvider failed", error);
        return (
            <div className="h-full flex items-center justify-center text-red-400 text-xs px-4 text-center">
                Preview failed to render. Try exporting directly.
            </div>
        );
    }

    return (
        <iframe
            ref={iframeRef}
            src="about:blank"
            title="Resume preview"
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                background: "#2a2a2a",
            }}
        />
    );
}

function PDFPreview({ document: doc }: { document: React.ReactElement<DocumentProps> }) {
    return (
        <BlobProvider document={doc}>
            {({ blob, error }) => (
                <PDFFrame blob={blob} error={error} />
            )}
        </BlobProvider>
    );
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
    { id: "contact", label: "Contact", icon: User },
    { id: "summary", label: "Summary", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code2 },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "certifications", label: "Certifications", icon: Award },
] as const;

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
    { id: "professional", label: "Professional", desc: "Clean, single-column. Best ATS score." },
    { id: "creative", label: "Creative", desc: "Dark sidebar, typographic hierarchy." },
    { id: "academic", label: "Academic", desc: "Serif fonts, expanded margins." },
];

// ─────────────────────────────────────────────────────────────
// SMALL UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────

function PDFSkeleton() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs tracking-wide">Loading preview…</span>
            </div>
        </div>
    );
}

function StatusBar({ isDirty, isSaving, lastSavedAt, onSave }: {
    isDirty: boolean; isSaving: boolean; lastSavedAt: Date | null; onSave: () => void;
}) {
    return (
        <div className="flex items-center gap-3">
            {isSaving && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                </span>
            )}
            {!isSaving && !isDirty && lastSavedAt && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
            )}
            {isDirty && !isSaving && (
                <button
                    onClick={onSave}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                    <Save className="w-3 h-3" />
                    Unsaved changes
                </button>
            )}
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
            {children}
        </label>
    );
}

const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all";

const textareaClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none";

// ─────────────────────────────────────────────────────────────
// SECTION PANELS
// ─────────────────────────────────────────────────────────────

function ContactPanel() {
    const { data, setContact } = useResumeStore();
    const c = data.contact;
    const field = (key: keyof typeof c) => (
        <input
            value={c[key] ?? ""}
            onChange={(e) => setContact({ [key]: e.target.value })}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            className={inputClass}
        />
    );
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel>Full Name</FieldLabel>{field("name")}</div>
                <div><FieldLabel>Email</FieldLabel>{field("email")}</div>
                <div><FieldLabel>Phone</FieldLabel>{field("phone")}</div>
                <div><FieldLabel>Location</FieldLabel>{field("location")}</div>
                <div><FieldLabel>Website</FieldLabel>{field("website")}</div>
                <div><FieldLabel>LinkedIn URL</FieldLabel>{field("linkedin")}</div>
                <div className="col-span-2"><FieldLabel>GitHub URL</FieldLabel>{field("github")}</div>
            </div>
        </div>
    );
}

function SummaryPanel() {
    const { data, setSummary } = useResumeStore();
    return (
        <div>
            <FieldLabel>Professional Summary</FieldLabel>
            <textarea
                rows={5}
                value={data.summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2–4 sentences. Lead with years of experience, your specialty, and a quantified achievement."
                className={textareaClass}
            />
            <p className="mt-1.5 text-xs text-zinc-600">
                {data.summary.length} chars · Aim for 300–500
            </p>
        </div>
    );
}

function ExperiencePanel() {
    const { data, addExperience, updateExperience, removeExperience } = useResumeStore();
    const [open, setOpen] = useState<string | null>(null);

    const newEntry = () => {
        const id = uuidv4();
        addExperience({
            id, role: "", company: "", location: "", startDate: "",
            endDate: "", current: false, bullets: [""], technologies: [],
        });
        setOpen(id);
    };

    return (
        <div className="space-y-3">
            {data.experience.map((exp) => (
                <div key={exp.id} className="border border-zinc-700/50 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setOpen(open === exp.id ? null : exp.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
                    >
                        <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                                {exp.role || "New Position"}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {exp.company || "Company"} {exp.startDate ? `· ${exp.startDate}` : ""}
                            </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${open === exp.id ? "rotate-90" : ""}`} />
                    </button>

                    {open === exp.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-zinc-700/50 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <FieldLabel>Job Title</FieldLabel>
                                    <input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                                        placeholder="Senior Engineer" className={inputClass} />
                                </div>
                                <div>
                                    <FieldLabel>Company</FieldLabel>
                                    <input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                        placeholder="Acme Corp" className={inputClass} />
                                </div>
                                <div>
                                    <FieldLabel>Start (YYYY-MM)</FieldLabel>
                                    <input value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                        placeholder="2021-03" className={inputClass} />
                                </div>
                                <div>
                                    <FieldLabel>End (YYYY-MM)</FieldLabel>
                                    <input value={exp.endDate ?? ""} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                        placeholder="2024-01" disabled={exp.current} className={inputClass} />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="checkbox" id={`current-${exp.id}`} checked={exp.current}
                                        onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                                        className="rounded border-zinc-600 bg-zinc-800 text-indigo-500" />
                                    <label htmlFor={`current-${exp.id}`} className="text-xs text-zinc-400">Current role</label>
                                </div>
                            </div>

                            <div>
                                <FieldLabel>Bullet Points</FieldLabel>
                                <div className="space-y-2">
                                    {exp.bullets.map((b, i) => (
                                        <div key={i} className="flex gap-2">
                                            <textarea rows={2} value={b}
                                                onChange={(e) => {
                                                    const bullets = [...exp.bullets];
                                                    bullets[i] = e.target.value;
                                                    updateExperience(exp.id, { bullets });
                                                }}
                                                placeholder="Led migration of monolith to microservices, reducing deploy time by 70%"
                                                className={`${textareaClass} flex-1`} />
                                            <button onClick={() => updateExperience(exp.id, { bullets: exp.bullets.filter((_, j) => j !== i) })}
                                                className="text-zinc-600 hover:text-red-400 transition-colors self-start pt-2">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ""] })}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                        <Plus className="w-3 h-3" /> Add bullet
                                    </button>
                                </div>
                            </div>

                            <div>
                                <FieldLabel>Technologies (comma-separated)</FieldLabel>
                                <input
                                    value={(exp.technologies ?? []).join(", ")}
                                    onChange={(e) => updateExperience(exp.id, { technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                                    placeholder="React, Node.js, PostgreSQL"
                                    className={inputClass}
                                />
                            </div>

                            <button onClick={() => removeExperience(exp.id)}
                                className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" /> Remove position
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={newEntry}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all">
                <Plus className="w-4 h-4" /> Add Position
            </button>
        </div>
    );
}

function SkillsPanel() {
    const { data, addSkillGroup, updateSkillGroup, removeSkillGroup } = useResumeStore();
    const [newCat, setNewCat] = useState("");

    return (
        <div className="space-y-3">
            {data.skills.map((group) => (
                <div key={group.category} className="border border-zinc-700/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-300 uppercase tracking-wide">{group.category}</span>
                        <button onClick={() => removeSkillGroup(group.category)} className="text-zinc-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <textarea rows={2}
                        value={group.items.join(", ")}
                        onChange={(e) => updateSkillGroup(group.category, e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        placeholder="React, TypeScript, Next.js"
                        className={textareaClass}
                    />
                </div>
            ))}
            <div className="flex gap-2">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)}
                    placeholder="New category (e.g. Frontend)" className={`${inputClass} flex-1`} />
                <button
                    onClick={() => { if (newCat.trim()) { addSkillGroup({ category: newCat.trim(), items: [] }); setNewCat(""); } }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// EDUCATION PANEL
// ─────────────────────────────────────────────────────────────

function EducationPanel() {
    const { data, addEducation, updateEducation, removeEducation } = useResumeStore();
    const [open, setOpen] = useState<string | null>(null);

    const newEntry = () => {
        const id = uuidv4();
        addEducation({ id, degree: "", field: "", institution: "", location: "", graduationDate: "", gpa: "", honors: "" });
        setOpen(id);
    };

    return (
        <div className="space-y-3">
            {data.education.map((edu) => (
                <div key={edu.id} className="border border-zinc-700/50 rounded-xl overflow-hidden">
                    <button onClick={() => setOpen(open === edu.id ? null : edu.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors">
                        <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                                {edu.degree || "New Degree"}{edu.field ? `, ${edu.field}` : ""}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                {edu.institution || "Institution"}{edu.graduationDate ? ` · ${edu.graduationDate}` : ""}
                            </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${open === edu.id ? "rotate-90" : ""}`} />
                    </button>
                    {open === edu.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-zinc-700/50 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><FieldLabel>Degree</FieldLabel>
                                    <input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="Bachelor of Science" className={inputClass} /></div>
                                <div><FieldLabel>Field of Study</FieldLabel>
                                    <input value={edu.field ?? ""} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="Computer Science" className={inputClass} /></div>
                                <div><FieldLabel>Institution</FieldLabel>
                                    <input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} placeholder="MIT" className={inputClass} /></div>
                                <div><FieldLabel>Location</FieldLabel>
                                    <input value={edu.location ?? ""} onChange={(e) => updateEducation(edu.id, { location: e.target.value })} placeholder="Cambridge, MA" className={inputClass} /></div>
                                <div><FieldLabel>Graduation (YYYY-MM)</FieldLabel>
                                    <input value={edu.graduationDate} onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })} placeholder="2022-05" className={inputClass} /></div>
                                <div><FieldLabel>GPA</FieldLabel>
                                    <input value={edu.gpa ?? ""} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} placeholder="3.9 / 4.0" className={inputClass} /></div>
                                <div className="col-span-2"><FieldLabel>Honors / Awards</FieldLabel>
                                    <input value={edu.honors ?? ""} onChange={(e) => updateEducation(edu.id, { honors: e.target.value })} placeholder="Summa Cum Laude" className={inputClass} /></div>
                            </div>
                            <button onClick={() => removeEducation(edu.id)} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" /> Remove education
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={newEntry} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all">
                <Plus className="w-4 h-4" /> Add Education
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PROJECTS PANEL
// ─────────────────────────────────────────────────────────────

function ProjectsPanel() {
    const { data, addProject, updateProject, removeProject } = useResumeStore();
    const [open, setOpen] = useState<string | null>(null);

    const newEntry = () => {
        const id = uuidv4();
        addProject({ id, name: "", description: "", url: "", repoUrl: "", technologies: [], highlights: [""] });
        setOpen(id);
    };

    return (
        <div className="space-y-3">
            {data.projects.map((proj) => (
                <div key={proj.id} className="border border-zinc-700/50 rounded-xl overflow-hidden">
                    <button onClick={() => setOpen(open === proj.id ? null : proj.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors">
                        <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{proj.name || "New Project"}</p>
                            <p className="text-xs text-zinc-500 truncate">{proj.technologies.slice(0, 3).join(", ") || "No technologies yet"}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${open === proj.id ? "rotate-90" : ""}`} />
                    </button>
                    {open === proj.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-zinc-700/50 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><FieldLabel>Project Name</FieldLabel>
                                    <input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="ResumeForge" className={inputClass} /></div>
                                <div className="col-span-2"><FieldLabel>Description</FieldLabel>
                                    <textarea rows={2} value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="AI-powered resume builder" className={textareaClass} /></div>
                                <div><FieldLabel>Live URL</FieldLabel>
                                    <input value={proj.url ?? ""} onChange={(e) => updateProject(proj.id, { url: e.target.value })} placeholder="https://myproject.com" className={inputClass} /></div>
                                <div><FieldLabel>Repo URL</FieldLabel>
                                    <input value={proj.repoUrl ?? ""} onChange={(e) => updateProject(proj.id, { repoUrl: e.target.value })} placeholder="https://github.com/..." className={inputClass} /></div>
                                <div className="col-span-2"><FieldLabel>Technologies (comma-separated)</FieldLabel>
                                    <input value={proj.technologies.join(", ")} onChange={(e) => updateProject(proj.id, { technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} placeholder="Next.js, Supabase, Tailwind" className={inputClass} /></div>
                            </div>
                            <div>
                                <FieldLabel>Highlights</FieldLabel>
                                <div className="space-y-2">
                                    {proj.highlights.map((h, i) => (
                                        <div key={i} className="flex gap-2">
                                            <textarea rows={2} value={h} onChange={(e) => { const highlights = [...proj.highlights]; highlights[i] = e.target.value; updateProject(proj.id, { highlights }); }} placeholder="Built real-time PDF generation" className={`${textareaClass} flex-1`} />
                                            <button onClick={() => updateProject(proj.id, { highlights: proj.highlights.filter((_, j) => j !== i) })} className="text-zinc-600 hover:text-red-400 transition-colors self-start pt-2"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => updateProject(proj.id, { highlights: [...proj.highlights, ""] })} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                        <Plus className="w-3 h-3" /> Add highlight
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => removeProject(proj.id)} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" /> Remove project
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={newEntry} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all">
                <Plus className="w-4 h-4" /> Add Project
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────

function CertificationsPanel() {
    const { data, addCertification, removeCertification } = useResumeStore();

    // Note: no updateCertification action exists in the store.
    // We use setState directly for field-level updates.
    const updateCert = (id: string, patch: Record<string, string>) => {
        useResumeStore.setState((s) => {
            const idx = s.data.certifications.findIndex((c) => c.id === id);
            if (idx >= 0) Object.assign(s.data.certifications[idx], patch);
            s.isDirty = true;
        });
    };

    const newEntry = () => {
        addCertification({ id: uuidv4(), name: "", issuer: "", date: "", credentialUrl: "" });
    };

    return (
        <div className="space-y-3">
            {data.certifications.map((cert) => (
                <div key={cert.id} className="border border-zinc-700/50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><FieldLabel>Certification Name</FieldLabel>
                            <input value={cert.name} onChange={(e) => updateCert(cert.id, { name: e.target.value })} placeholder="AWS Solutions Architect" className={inputClass} /></div>
                        <div><FieldLabel>Issuer</FieldLabel>
                            <input value={cert.issuer} onChange={(e) => updateCert(cert.id, { issuer: e.target.value })} placeholder="Amazon Web Services" className={inputClass} /></div>
                        <div><FieldLabel>Date (YYYY-MM)</FieldLabel>
                            <input value={cert.date} onChange={(e) => updateCert(cert.id, { date: e.target.value })} placeholder="2023-06" className={inputClass} /></div>
                        <div className="col-span-2"><FieldLabel>Credential URL</FieldLabel>
                            <input value={cert.credentialUrl ?? ""} onChange={(e) => updateCert(cert.id, { credentialUrl: e.target.value })} placeholder="https://credential.net/..." className={inputClass} /></div>
                    </div>
                    <button onClick={() => removeCertification(cert.id)} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" /> Remove certification
                    </button>
                </div>
            ))}
            <button onClick={newEntry} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all">
                <Plus className="w-4 h-4" /> Add Certification
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// THEME PANEL
// ─────────────────────────────────────────────────────────────

function ThemePanel({ onClose }: { onClose: () => void }) {
    const { theme, setTemplate, updateColors } = useResumeStore();

    return (
        <div className="absolute top-0 right-0 h-full w-72 bg-zinc-900 border-l border-zinc-800 z-20 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-200">Theme & Layout</span>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Template</p>
                    <div className="space-y-2">
                        {TEMPLATES.map((t) => (
                            <button key={t.id} onClick={() => setTemplate(t.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${theme.template === t.id
                                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                                    : "border-zinc-700/50 hover:border-zinc-600 text-zinc-300"
                                    }`}>
                                <p className="text-sm font-medium">{t.label}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Accent Color</p>
                    <div className="grid grid-cols-6 gap-2">
                        {["#0F172A", "#1E3A5F", "#1E293B", "#14532D", "#3B0764", "#7C2D12"].map((color) => (
                            <button key={color} onClick={() => updateColors({ primary: color })}
                                className={`w-8 h-8 rounded-lg border-2 transition-all ${theme.colors.primary === color ? "border-white scale-110" : "border-transparent"
                                    }`}
                                style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AI TAILORING PANEL
// ─────────────────────────────────────────────────────────────

function AIPanel({ onClose }: { onClose: () => void }) {
    const { data, jobDescription, matchAnalysis, aiLoading, setJobDescription, setMatchAnalysis, applyAiSuggestion, setAiLoading } = useResumeStore();

    const runAI = async () => {
        if (!jobDescription.trim()) return;
        setAiLoading(true);
        try {
            const res = await fetch("/api/cv/tailor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data, jobDescription }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "AI request failed");
            setMatchAnalysis(json.matchAnalysis);
            applyAiSuggestion(json.resumeData as AiSuggestion);
        } catch (e) {
            console.error(e instanceof Error ? e.message : e);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 z-20 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-zinc-200">AI Tailoring</span>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <FieldLabel>Job Description</FieldLabel>
                    <textarea rows={10} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here. The AI will tailor your bullet points, reorder skills, and fill in keywords."
                        className={textareaClass} />
                </div>

                <button onClick={runAI} disabled={aiLoading || !jobDescription.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm text-white transition-all">
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {aiLoading ? "Analysing…" : "Tailor My Resume"}
                </button>

                {matchAnalysis && (
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-zinc-400">ATS Match Score</span>
                                <span className={`text-lg font-bold ${matchAnalysis.score >= 80 ? "text-emerald-400" : matchAnalysis.score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                                    {matchAnalysis.score}%
                                </span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${matchAnalysis.score}%` }} />
                            </div>
                        </div>

                        {matchAnalysis.missingKeywords.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-500 mb-2">Missing Keywords</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchAnalysis.missingKeywords.map((kw) => (
                                        <span key={kw} className="text-xs px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {matchAnalysis.strengths.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-500 mb-2">Strengths</p>
                                <ul className="space-y-1">
                                    {matchAnalysis.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN EDITOR PAGE
// ─────────────────────────────────────────────────────────────

export default function EditorPage() {
    const store = useResumeStore();
    const {
        data, theme, resumeTitle, isDirty, isSaving, lastSavedAt, previewMode,
        activeSection, setActiveSection, setPreviewMode, setIsSaving, markSaved, setResumeTitle,
        hydrateResume, resetToEmpty,
    } = store;

    const router = useRouter();
    const params = useParams<{ id: string }>();
    const resumeId = params?.id;

    const [showTheme, setShowTheme] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound">("loading");

    // ── Save: declared first so the auto-save effect can reference it ──
    const handleSave = useCallback(async () => {
        if (!resumeId) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/resumes/${resumeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: store.resumeTitle,
                    resume_data: data,
                    theme_config: theme,
                }),
            });
            if (!res.ok) throw new Error(`Save failed (${res.status})`);
            markSaved();
        } catch (err) {
            console.error("[editor] save failed:", err);
            // Leave isDirty=true so the user knows it didn't go through.
            setIsSaving(false);
        }
    }, [resumeId, data, theme, store.resumeTitle, setIsSaving, markSaved]);

    // ── Load resume on mount / when id changes ──
    useEffect(() => {
        let cancelled = false;
        if (!resumeId) return;

        (async () => {
            try {
                const res = await fetch(`/api/resumes/${resumeId}`);
                if (cancelled) return;

                if (res.status === 404) {
                    setLoadState("notfound");
                    return;
                }
                if (!res.ok) throw new Error(`Load failed (${res.status})`);

                const json = await res.json();
                const r = json.resume;

                // Fall back to defaults if the server-stored config is partial
                // (e.g. a freshly-created resume has empty {} for both fields).
                const themeConfig = r.theme_config?.template
                    ? r.theme_config
                    : THEME_PRESETS.professional;

                // Merge stored data with EMPTY_RESUME_DATA so every field
                // (especially `contact`) is always a defined object, even
                // for a brand-new resume whose resume_data is stored as {}.
                const resumeData: ResumeData = {
                    ...EMPTY_RESUME_DATA,
                    ...r.resume_data,
                    contact: {
                        ...EMPTY_RESUME_DATA.contact,
                        ...(r.resume_data?.contact ?? {}),
                    },
                };

                hydrateResume(r.id, r.title, resumeData, themeConfig);
                setLoadState("ready");
            } catch (err) {
                if (cancelled) return;
                console.error("[editor] load failed:", err);
                setLoadState("notfound");
            }
        })();

        return () => { cancelled = true; };
    }, [resumeId, hydrateResume]);

    // ── Auto-save: debounced on stable refs so typing doesn't reset it ──
    // The previous implementation re-armed the timer on every keystroke (data
    // and theme are in the dep array), so the user effectively had to stop
    // typing for the entire window before it would fire. Now we watch the
    // dirty flag only, and a separate ref tracks the latest save function.
    const saveRef = useRef(handleSave);
    useEffect(() => { saveRef.current = handleSave; }, [handleSave]);

    useEffect(() => {
        if (!isDirty || loadState !== "ready") return;
        const t = setTimeout(() => { saveRef.current(); }, 5_000);
        return () => clearTimeout(t);
    }, [isDirty, loadState]);

    // Reset the persisted draft when the user navigates away from the editor
    // entirely. Without this, a different resume id loaded next would briefly
    // show the previous draft due to localStorage rehydration.
    useEffect(() => {
        return () => {
            // Only reset if we're actually unmounting the editor — not on
            // hot-reload re-renders. resetToEmpty is idempotent.
            resetToEmpty();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownload = async () => {
        const { pdf } = await import("@react-pdf/renderer");
        const Template = getTemplate(theme.template);
        const blob = await pdf(<Template data={data} theme={theme} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.contact.name || "resume"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render the PDF document via memo. BlobProvider turns it into a blob URL,
    // then we render that URL in our own iframe with controlled sizing.
    const documentElement = useMemo((): React.ReactElement<DocumentProps> => {
        const Template = getTemplate(theme.template);
        // eslint-disable-next-line react-hooks/static-components
        return <Template data={data} theme={theme} /> as React.ReactElement<DocumentProps>;
    }, [data, theme]);
    const [previewDocumentElement, setPreviewDocumentElement] = useState(documentElement);

    useEffect(() => {
        const t = setTimeout(() => {
            setPreviewDocumentElement(documentElement);
        }, 250);

        return () => clearTimeout(t);
    }, [documentElement]);

    // ── Loading / 404 gates ──
    if (loadState === "loading") {
        return (
            <div className="h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading resume…
                </div>
            </div>
        );
    }

    if (loadState === "notfound") {
        return (
            <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-300">
                <p className="text-sm">This resume doesn&apos;t exist or you don&apos;t have access to it.</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                >
                    Back to home
                </button>
            </div>
        );
    }

    const renderSectionPanel = () => {
        switch (activeSection) {
            case "contact": return <ContactPanel />;
            case "summary": return <SummaryPanel />;
            case "experience": return <ExperiencePanel />;
            case "education": return <EducationPanel />;
            case "projects": return <ProjectsPanel />;
            case "skills": return <SkillsPanel />;
            case "certifications": return <CertificationsPanel />;
            default: return (
                <div className="text-sm text-zinc-500 text-center py-12">
                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} panel coming soon.
                </div>
            );
        }
    };

    return (
        <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">

            {/* ── TOP BAR ────────────────────────────────────── */}
            <header className="h-12 flex items-center justify-between px-4 border-b border-zinc-800/80 flex-shrink-0 bg-zinc-950/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <span className="text-sm font-bold tracking-tight text-zinc-100">
                        Resume<span className="text-indigo-400">Forge</span>
                    </span>

                    {/* Editable title */}
                    <input
                        value={resumeTitle}
                        onChange={(e) => setResumeTitle(e.target.value)}
                        className="bg-transparent text-sm text-zinc-400 hover:text-zinc-200 focus:text-zinc-100 focus:outline-none w-40 truncate transition-colors"
                    />

                    <StatusBar isDirty={isDirty} isSaving={isSaving} lastSavedAt={lastSavedAt} onSave={handleSave} />
                </div>

                <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-zinc-800/60 rounded-lg p-0.5 gap-0.5">
                        {([["split", Columns2], ["form", User], ["preview", Eye]] as const).map(([mode, Icon]) => (
                            <button key={mode} onClick={() => setPreviewMode(mode)}
                                className={`p-1.5 rounded-md transition-all ${previewMode === mode ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                                <Icon className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>

                    <button onClick={() => { setShowAI(!showAI); setShowTheme(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showAI ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60"}`}>
                        <Wand2 className="w-3.5 h-3.5" /> AI Tailor
                    </button>

                    <button onClick={() => { setShowTheme(!showTheme); setShowAI(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showTheme ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60"}`}>
                        <Palette className="w-3.5 h-3.5" /> Theme
                    </button>

                    <button onClick={handleSave}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg text-xs text-zinc-300 transition-all">
                        <Save className="w-3.5 h-3.5" /> Save
                    </button>

                    <button onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white transition-all">
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                </div>
            </header>

            {/* ── BODY ────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* ── LEFT SIDEBAR — Section Nav ─────────────── */}
                {(previewMode === "split" || previewMode === "form") && (
                    <nav className="w-48 flex-shrink-0 border-r border-zinc-800/60 flex flex-col py-3 gap-0.5 overflow-y-auto">
                        {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveSection(id)}
                                className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm transition-all ${activeSection === id
                                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                                    }`}>
                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                {label}
                            </button>
                        ))}
                    </nav>
                )}

                {/* ── CENTER — Form Panel ─────────────────────── */}
                {(previewMode === "split" || previewMode === "form") && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-xl mx-auto px-6 py-6">
                            <h2 className="text-sm font-semibold text-zinc-300 mb-5 capitalize">
                                {activeSection}
                            </h2>
                            {renderSectionPanel()}
                        </div>
                    </div>
                )}

                {/* ── RIGHT — PDF Preview ─────────────────────── */}
                {(previewMode === "split" || previewMode === "preview") && (
                    <div className={`${previewMode === "split" ? "w-[500px]" : "flex-1"} flex-shrink-0 border-l border-zinc-800/60 bg-zinc-900/40 flex flex-col`}>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
                            <span className="text-xs text-zinc-500 uppercase tracking-wide">Live Preview</span>
                            <span className="text-xs text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-md capitalize">
                                {theme.template}
                            </span>
                        </div>
                        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                            <Suspense fallback={<PDFSkeleton />}>
                                <PDFPreview document={previewDocumentElement} />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* ── SLIDING PANELS ──────────────────────────── */}
                {showTheme && <ThemePanel onClose={() => setShowTheme(false)} />}
                {showAI && <AIPanel onClose={() => setShowAI(false)} />}
            </div>
        </div>
    );
}

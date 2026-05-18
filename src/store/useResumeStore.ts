// =============================================================
// ResumeForge — Zustand Resume Store
// src/store/useResumeStore.ts
// =============================================================

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

// ─────────────────────────────────────────────────────────────
// STRICT TYPESCRIPT INTERFACES — "The Data-Theme Split"
// ─────────────────────────────────────────────────────────────

export interface ContactInfo {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
}

export interface ExperienceEntry {
    id: string;                  // uuid — stable key for list rendering
    role: string;
    company: string;
    location?: string;
    startDate: string;           // ISO "YYYY-MM"
    endDate?: string;            // ISO "YYYY-MM" or undefined (= Present)
    current: boolean;
    bullets: string[];           // action-verb, result-oriented sentences
    technologies?: string[];     // optional tag list
}

export interface EducationEntry {
    id: string;
    degree: string;
    field?: string;
    institution: string;
    location?: string;
    graduationDate: string;      // "YYYY-MM" or "YYYY"
    gpa?: string;
    honors?: string;
    coursework?: string[];
}

export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    url?: string;
    repoUrl?: string;
    technologies: string[];
    highlights: string[];
}

export interface CertificationEntry {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
}

export interface SkillGroup {
    category: string;            // e.g. "Frontend", "Backend", "Cloud"
    items: string[];
}

export interface ResumeData {
    contact: ContactInfo;
    summary: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    projects: ProjectEntry[];
    certifications: CertificationEntry[];
    skills: SkillGroup[];
    languages?: { language: string; proficiency: string }[];
    volunteer?: { role: string; org: string; date: string; summary: string }[];
}

// ─────────────────────────────────────────────────────────────
// THEME CONFIGURATION
// ─────────────────────────────────────────────────────────────

export type ResumeTemplate = "professional" | "creative" | "academic";

export type FontFamily =
    | "Inter"
    | "Lato"
    | "Merriweather"
    | "Playfair Display"
    | "Source Serif Pro"
    | "IBM Plex Sans";

export interface ThemeConfig {
    template: ResumeTemplate;
    colors: {
        primary: string;           // section headings, name, accents
        secondary: string;         // company names, dates
        text: string;              // body text
        background: string;        // paper color
        accent?: string;           // sidebar bg for creative template
    };
    typography: {
        headingFont: FontFamily;
        bodyFont: FontFamily;
        baseFontSize: number;      // pt, typically 10–12
        lineHeight: number;        // e.g. 1.4
    };
    spacing: {
        pagePaddingX: number;      // pt
        pagePaddingY: number;      // pt
        sectionGap: number;        // pt between sections
        entryGap: number;          // pt between entries within a section
    };
    layout: {
        columns: 1 | 2;            // 1 = single column, 2 = sidebar layout
        sidebarWidth?: number;     // percentage, only used when columns === 2
        showPhoto: boolean;
        dividerStyle: "line" | "thick" | "none";
    };
}

// ─────────────────────────────────────────────────────────────
// AI ANALYSIS
// ─────────────────────────────────────────────────────────────

export interface MatchAnalysis {
    score: number;               // 0–100
    strengths: string[];
    missingKeywords: string[];
    suggestions: string[];
}

// Shape the AI route returns under `resumeData`. Experience entries
// are intentionally partial (id + rewritten fields only); the store
// merges them into the existing entries by id.
export interface AiSuggestion {
    summary?: string;
    experience?: Array<{
        id: string;
        bullets: string[];
        technologies?: string[];
    }>;
    skills?: SkillGroup[];
}

// ─────────────────────────────────────────────────────────────
// PRESET THEMES
// ─────────────────────────────────────────────────────────────

export const THEME_PRESETS: Record<ResumeTemplate, ThemeConfig> = {
    professional: {
        template: "professional",
        colors: {
            primary: "#0F172A",
            secondary: "#334155",
            text: "#1E293B",
            background: "#FFFFFF",
        },
        typography: {
            headingFont: "Inter",
            bodyFont: "Lato",
            baseFontSize: 10,
            lineHeight: 1.45,
        },
        spacing: {
            pagePaddingX: 40,
            pagePaddingY: 40,
            sectionGap: 16,
            entryGap: 10,
        },
        layout: {
            columns: 1,
            showPhoto: false,
            dividerStyle: "line",
        },
    },

    creative: {
        template: "creative",
        colors: {
            primary: "#FFFFFF",
            secondary: "#CBD5E1",
            text: "#1E293B",
            background: "#FFFFFF",
            accent: "#1E3A5F",
        },
        typography: {
            headingFont: "Playfair Display",
            bodyFont: "Lato",
            baseFontSize: 10,
            lineHeight: 1.5,
        },
        spacing: {
            pagePaddingX: 0,
            pagePaddingY: 0,
            sectionGap: 14,
            entryGap: 10,
        },
        layout: {
            columns: 2,
            sidebarWidth: 35,
            showPhoto: true,
            dividerStyle: "none",
        },
    },

    academic: {
        template: "academic",
        colors: {
            primary: "#1A1A2E",
            secondary: "#4A4A6A",
            text: "#2D2D2D",
            background: "#FAFAF8",
        },
        typography: {
            headingFont: "Source Serif Pro",
            bodyFont: "IBM Plex Sans",
            baseFontSize: 11,
            lineHeight: 1.55,
        },
        spacing: {
            pagePaddingX: 50,
            pagePaddingY: 45,
            sectionGap: 18,
            entryGap: 12,
        },
        layout: {
            columns: 1,
            showPhoto: false,
            dividerStyle: "thick",
        },
    },
};

// ─────────────────────────────────────────────────────────────
// INITIAL / EMPTY STATE
// ─────────────────────────────────────────────────────────────

export const EMPTY_RESUME_DATA: ResumeData = {
    contact: {
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    skills: [],
    languages: [],
};

// ─────────────────────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────────────────────

interface ResumeStore {
    // Active resume identity
    resumeId: string | null;
    resumeTitle: string;

    // Core state — immutable split
    data: ResumeData;
    theme: ThemeConfig;

    // AI analysis result
    matchAnalysis: MatchAnalysis | null;
    jobDescription: string;

    // Editor UI state
    activeSection: string;
    isSaving: boolean;
    isDirty: boolean;
    lastSavedAt: Date | null;
    aiLoading: boolean;
    previewMode: "split" | "preview" | "form";

    // ─── DATA ACTIONS ───────────────────────────────────────

    setContact: (contact: Partial<ContactInfo>) => void;
    setSummary: (summary: string) => void;

    addExperience: (entry: ExperienceEntry) => void;
    updateExperience: (id: string, patch: Partial<ExperienceEntry>) => void;
    removeExperience: (id: string) => void;
    reorderExperience: (fromIdx: number, toIdx: number) => void;

    addEducation: (entry: EducationEntry) => void;
    updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
    removeEducation: (id: string) => void;

    addProject: (entry: ProjectEntry) => void;
    updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
    removeProject: (id: string) => void;

    addCertification: (entry: CertificationEntry) => void;
    removeCertification: (id: string) => void;

    setSkills: (groups: SkillGroup[]) => void;
    addSkillGroup: (group: SkillGroup) => void;
    updateSkillGroup: (category: string, items: string[]) => void;
    removeSkillGroup: (category: string) => void;

    // ─── THEME ACTIONS ──────────────────────────────────────

    setTemplate: (template: ResumeTemplate) => void;
    updateColors: (colors: Partial<ThemeConfig["colors"]>) => void;
    updateTypography: (typography: Partial<ThemeConfig["typography"]>) => void;
    updateSpacing: (spacing: Partial<ThemeConfig["spacing"]>) => void;
    updateLayout: (layout: Partial<ThemeConfig["layout"]>) => void;

    // ─── AI ACTIONS ─────────────────────────────────────────

    setJobDescription: (jd: string) => void;
    setMatchAnalysis: (analysis: MatchAnalysis | null) => void;
    applyAiSuggestion: (patch: AiSuggestion) => void;
    setAiLoading: (loading: boolean) => void;

    // ─── PERSISTENCE ACTIONS ────────────────────────────────

    hydrateResume: (id: string, title: string, data: ResumeData, theme: ThemeConfig) => void;
    loadResume: (id: string, data: ResumeData, theme: ThemeConfig) => void;
    setIsSaving: (saving: boolean) => void;
    markSaved: () => void;
    resetToEmpty: () => void;
    setPreviewMode: (mode: "split" | "preview" | "form") => void;
    setActiveSection: (section: string) => void;
    setResumeTitle: (title: string) => void;
}

// ─────────────────────────────────────────────────────────────
// STORE IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
}

export const useResumeStore = create<ResumeStore>()(
    devtools(
        persist(
            immer((set) => ({
                // ── Initial state ──
                resumeId: null,
                resumeTitle: "Untitled Resume",
                data: EMPTY_RESUME_DATA,
                theme: THEME_PRESETS.professional,
                matchAnalysis: null,
                jobDescription: "",
                activeSection: "contact",
                isSaving: false,
                isDirty: false,
                lastSavedAt: null,
                aiLoading: false,
                previewMode: "split",

                // ── Contact ──
                setContact: (contact) =>
                    set((s) => {
                        Object.assign(s.data.contact, contact);
                        s.isDirty = true;
                    }),

                setSummary: (summary) =>
                    set((s) => {
                        s.data.summary = summary;
                        s.isDirty = true;
                    }),

                // ── Experience ──
                addExperience: (entry) =>
                    set((s) => {
                        s.data.experience.unshift(entry);
                        s.isDirty = true;
                    }),

                updateExperience: (id, patch) =>
                    set((s) => {
                        const idx = s.data.experience.findIndex((e) => e.id === id);
                        if (idx >= 0) Object.assign(s.data.experience[idx], patch);
                        s.isDirty = true;
                    }),

                removeExperience: (id) =>
                    set((s) => {
                        s.data.experience = s.data.experience.filter((e) => e.id !== id);
                        s.isDirty = true;
                    }),

                reorderExperience: (from, to) =>
                    set((s) => {
                        s.data.experience = arrayMove(s.data.experience, from, to);
                        s.isDirty = true;
                    }),

                // ── Education ──
                addEducation: (entry) =>
                    set((s) => {
                        s.data.education.unshift(entry);
                        s.isDirty = true;
                    }),

                updateEducation: (id, patch) =>
                    set((s) => {
                        const idx = s.data.education.findIndex((e) => e.id === id);
                        if (idx >= 0) Object.assign(s.data.education[idx], patch);
                        s.isDirty = true;
                    }),

                removeEducation: (id) =>
                    set((s) => {
                        s.data.education = s.data.education.filter((e) => e.id !== id);
                        s.isDirty = true;
                    }),

                // ── Projects ──
                addProject: (entry) =>
                    set((s) => {
                        s.data.projects.unshift(entry);
                        s.isDirty = true;
                    }),

                updateProject: (id, patch) =>
                    set((s) => {
                        const idx = s.data.projects.findIndex((p) => p.id === id);
                        if (idx >= 0) Object.assign(s.data.projects[idx], patch);
                        s.isDirty = true;
                    }),

                removeProject: (id) =>
                    set((s) => {
                        s.data.projects = s.data.projects.filter((p) => p.id !== id);
                        s.isDirty = true;
                    }),

                // ── Certifications ──
                addCertification: (entry) =>
                    set((s) => {
                        s.data.certifications.push(entry);
                        s.isDirty = true;
                    }),

                removeCertification: (id) =>
                    set((s) => {
                        s.data.certifications = s.data.certifications.filter(
                            (c) => c.id !== id
                        );
                        s.isDirty = true;
                    }),

                // ── Skills ──
                setSkills: (groups) =>
                    set((s) => {
                        s.data.skills = groups;
                        s.isDirty = true;
                    }),

                addSkillGroup: (group) =>
                    set((s) => {
                        if (!s.data.skills.find((g) => g.category === group.category)) {
                            s.data.skills.push(group);
                            s.isDirty = true;
                        }
                    }),

                updateSkillGroup: (category, items) =>
                    set((s) => {
                        const group = s.data.skills.find((g) => g.category === category);
                        if (group) {
                            group.items = items;
                            s.isDirty = true;
                        }
                    }),

                removeSkillGroup: (category) =>
                    set((s) => {
                        s.data.skills = s.data.skills.filter(
                            (g) => g.category !== category
                        );
                        s.isDirty = true;
                    }),

                // ── Theme ──
                setTemplate: (template) =>
                    set((s) => {
                        s.theme = THEME_PRESETS[template];
                        s.isDirty = true;
                    }),

                updateColors: (colors) =>
                    set((s) => {
                        Object.assign(s.theme.colors, colors);
                        s.isDirty = true;
                    }),

                updateTypography: (typography) =>
                    set((s) => {
                        Object.assign(s.theme.typography, typography);
                        s.isDirty = true;
                    }),

                updateSpacing: (spacing) =>
                    set((s) => {
                        Object.assign(s.theme.spacing, spacing);
                        s.isDirty = true;
                    }),

                updateLayout: (layout) =>
                    set((s) => {
                        Object.assign(s.theme.layout, layout);
                        s.isDirty = true;
                    }),

                // ── AI ──
                setJobDescription: (jd) =>
                    set((s) => {
                        s.jobDescription = jd;
                    }),

                setMatchAnalysis: (analysis) =>
                    set((s) => {
                        s.matchAnalysis = analysis;
                    }),

                applyAiSuggestion: (patch) =>
                    set((s) => {
                        if (patch.summary) s.data.summary = patch.summary;

                        // Experience: merge by id. The AI returns partial
                        // entries with at minimum {id, bullets} — we keep
                        // company/role/dates intact and only overwrite the
                        // fields the AI actually rewrote.
                        if (patch.experience) {
                            const incoming = new Map(
                                patch.experience.map((e) => [e.id, e])
                            );
                            for (let i = 0; i < s.data.experience.length; i++) {
                                const update = incoming.get(s.data.experience[i].id);
                                if (update) {
                                    Object.assign(s.data.experience[i], update);
                                }
                            }
                        }

                        // Skills: full replacement is fine — categories are
                        // small and the AI is reordering by relevance.
                        if (patch.skills) s.data.skills = patch.skills;

                        s.isDirty = true;
                    }),

                setAiLoading: (loading) =>
                    set((s) => {
                        s.aiLoading = loading;
                    }),

                // ── Persistence ──
                hydrateResume: (id, title, data, theme) =>
                    set((s) => {
                        s.resumeId = id;
                        s.resumeTitle = title;
                        s.data = data;
                        s.theme = theme;
                        s.isDirty = false;
                        s.isSaving = false;
                        s.matchAnalysis = null;
                    }),

                loadResume: (id, data, theme) =>
                    set((s) => {
                        s.resumeId = id;
                        s.data = data;
                        s.theme = theme;
                        s.isDirty = false;
                        s.matchAnalysis = null;
                    }),

                setIsSaving: (saving) =>
                    set((s) => {
                        s.isSaving = saving;
                    }),

                markSaved: () =>
                    set((s) => {
                        s.isDirty = false;
                        s.isSaving = false;
                        s.lastSavedAt = new Date();
                    }),

                resetToEmpty: () =>
                    set((s) => {
                        s.resumeId = null;
                        s.resumeTitle = "Untitled Resume";
                        s.data = EMPTY_RESUME_DATA;
                        s.theme = THEME_PRESETS.professional;
                        s.matchAnalysis = null;
                        s.jobDescription = "";
                        s.isDirty = false;
                        s.lastSavedAt = null;
                    }),

                setPreviewMode: (mode) =>
                    set((s) => {
                        s.previewMode = mode;
                    }),

                setActiveSection: (section) =>
                    set((s) => {
                        s.activeSection = section;
                    }),

                setResumeTitle: (title) =>
                    set((s) => {
                        s.resumeTitle = title;
                        s.isDirty = true;
                    }),
            })),
            {
                name: "resumeforge-draft",
                // Only persist form data and theme, not UI state
                partialize: (s) => ({
                    resumeId: s.resumeId,
                    resumeTitle: s.resumeTitle,
                    data: s.data,
                    theme: s.theme,
                    jobDescription: s.jobDescription,
                }),
            }
        ),
        { name: "ResumeForge" }
    )
);

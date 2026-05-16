"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
    useResumeStore, THEME_PRESETS, EMPTY_RESUME_DATA,
    type ResumeData,
} from "@/store/useResumeStore";
import { getTemplate } from "@/features/pdf/registry";
import type { DocumentProps } from "@react-pdf/renderer";

import { EditorTopbar } from "./EditorTopbar";
import { EditorSidebar } from "./EditorSidebar";
import { PreviewPane } from "./PreviewPane";
import { ThemePanel } from "./ThemePanel";
import { AIPanel } from "./AIPanel";

import { ContactPanel } from "@/features/editor/panels/ContactPanel";
import { SummaryPanel } from "@/features/editor/panels/SummaryPanel";
import { ExperiencePanel } from "@/features/editor/panels/ExperiencePanel";
import { EducationPanel } from "@/features/editor/panels/EducationPanel";
import { ProjectsPanel } from "@/features/editor/panels/ProjectsPanel";
import { SkillsPanel } from "@/features/editor/panels/SkillsPanel";
import { CertificationsPanel } from "@/features/editor/panels/CertificationsPanel";

function renderSectionPanel(activeSection: string) {
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
}

export function EditorShell() {
    const store = useResumeStore();
    const {
        data, theme, isDirty, previewMode,
        activeSection, setIsSaving, markSaved, setResumeTitle,
        loadResume, resetToEmpty,
    } = store;

    const router = useRouter();
    const params = useParams<{ id: string }>();
    const resumeId = params?.id;

    const [showTheme, setShowTheme] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound">("loading");

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
            setIsSaving(false);
        }
    }, [resumeId, data, theme, store.resumeTitle, setIsSaving, markSaved]);

    useEffect(() => {
        let cancelled = false;
        if (!resumeId) return;

        (async () => {
            try {
                const res = await fetch(`/api/resumes/${resumeId}`);
                if (cancelled) return;

                if (res.status === 404) { setLoadState("notfound"); return; }
                if (!res.ok) throw new Error(`Load failed (${res.status})`);

                const json = await res.json();
                const r = json.resume;

                const themeConfig = r.theme_config?.template
                    ? r.theme_config
                    : THEME_PRESETS.professional;

                const resumeData: ResumeData = {
                    ...EMPTY_RESUME_DATA,
                    ...r.resume_data,
                    contact: {
                        ...EMPTY_RESUME_DATA.contact,
                        ...(r.resume_data?.contact ?? {}),
                    },
                };

                loadResume(r.id, resumeData, themeConfig);
                setResumeTitle(r.title);
                setLoadState("ready");
            } catch (err) {
                if (cancelled) return;
                console.error("[editor] load failed:", err);
                setLoadState("notfound");
            }
        })();

        return () => { cancelled = true; };
    }, [resumeId, loadResume, setResumeTitle]);

    const saveRef = useRef(handleSave);
    useEffect(() => { saveRef.current = handleSave; }, [handleSave]);

    useEffect(() => {
        if (!isDirty || loadState !== "ready") return;
        const t = setTimeout(() => { saveRef.current(); }, 5_000);
        return () => clearTimeout(t);
    }, [isDirty, loadState]);

    useEffect(() => {
        return () => { resetToEmpty(); };
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

    const documentElement = useMemo((): React.ReactElement<DocumentProps> => {
        const Template = getTemplate(theme.template);
        // eslint-disable-next-line react-hooks/static-components
        return <Template data={data} theme={theme} /> as React.ReactElement<DocumentProps>;
    }, [data, theme]);

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
                    Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
            <EditorTopbar
                onSave={handleSave}
                onDownload={handleDownload}
                showAI={showAI}
                showTheme={showTheme}
                onToggleAI={() => { setShowAI(!showAI); setShowTheme(false); }}
                onToggleTheme={() => { setShowTheme(!showTheme); setShowAI(false); }}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {(previewMode === "split" || previewMode === "form") && <EditorSidebar />}

                {(previewMode === "split" || previewMode === "form") && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-xl mx-auto px-6 py-6">
                            <h2 className="text-sm font-semibold text-zinc-300 mb-5 capitalize">
                                {activeSection}
                            </h2>
                            {renderSectionPanel(activeSection)}
                        </div>
                    </div>
                )}

                {(previewMode === "split" || previewMode === "preview") && (
                    <PreviewPane
                        documentElement={documentElement}
                        template={theme.template}
                        previewMode={previewMode}
                    />
                )}

                {showTheme && <ThemePanel onClose={() => setShowTheme(false)} />}
                {showAI && <AIPanel onClose={() => setShowAI(false)} />}
            </div>
        </div>
    );
}
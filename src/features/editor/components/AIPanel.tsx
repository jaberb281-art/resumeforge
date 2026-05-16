"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Loader2, Wand2, X } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import type { AiSuggestion } from "@/store/useResumeStore";
import { AiUsageBadge, notifyAiUsageChanged } from "@/features/ai/components/AiUsageBadge";

const textareaClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none";

const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
            {children}
        </label>
    );
}

export function AIPanel({ onClose }: { onClose: () => void }) {
    const { data, jobDescription, matchAnalysis, aiLoading, setJobDescription, setMatchAnalysis, applyAiSuggestion, setAiLoading } = useResumeStore();
    const [tailorError, setTailorError] = useState<string | null>(null);
    const [coverJobTitle, setCoverJobTitle] = useState("");
    const [coverCompanyName, setCoverCompanyName] = useState("");
    const [coverJobDescription, setCoverJobDescription] = useState("");
    const [coverTone, setCoverTone] = useState<"professional" | "confident" | "warm">("professional");
    const [coverLetter, setCoverLetter] = useState("");
    const [coverLoading, setCoverLoading] = useState(false);
    const [coverError, setCoverError] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");

    const runAI = async () => {
        if (!jobDescription.trim()) return;
        setAiLoading(true);
        setTailorError(null);
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
            notifyAiUsageChanged();
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unable to tailor resume right now.";
            console.error(message);
            setTailorError(message);
        } finally {
            setAiLoading(false);
        }
    };

    const generateCoverLetter = async () => {
        const trimmedJobTitle = coverJobTitle.trim();
        const trimmedCompanyName = coverCompanyName.trim();

        if (!trimmedJobTitle || !trimmedCompanyName) {
            setCoverError("Please enter both target job title and company name.");
            return;
        }

        setCoverLoading(true);
        setCoverError(null);
        setCopyState("idle");

        try {
            const res = await fetch("/api/cv/cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data,
                    jobTitle: trimmedJobTitle,
                    companyName: trimmedCompanyName,
                    jobDescription: coverJobDescription.trim(),
                    tone: coverTone,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Cover letter request failed");
            if (typeof json.coverLetter !== "string" || !json.coverLetter.trim()) {
                throw new Error("Cover letter generation returned no content.");
            }

            setCoverLetter(json.coverLetter.trim());
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unable to generate cover letter.";
            setCoverError(message);
        } finally {
            setCoverLoading(false);
        }
    };

    const copyCoverLetter = async () => {
        if (!coverLetter.trim()) return;
        try {
            await navigator.clipboard.writeText(coverLetter);
            setCopyState("done");
        } catch {
            setCopyState("error");
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 z-20 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-zinc-200">AI Tailoring</span>
                    </div>
                    <AiUsageBadge className="bg-zinc-950/40" />
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

                {tailorError && <p className="text-xs text-red-400">{tailorError}</p>}

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
                                        <span key={kw} className="text-xs px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">{kw}</span>
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
                                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />{s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-zinc-800 pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                        <p className="text-sm font-medium text-zinc-200">Cover Letter Generator</p>
                    </div>

                    <div>
                        <FieldLabel>Target Job Title</FieldLabel>
                        <input value={coverJobTitle} onChange={(e) => setCoverJobTitle(e.target.value)}
                            placeholder="Senior Frontend Engineer" className={inputClass} />
                    </div>

                    <div>
                        <FieldLabel>Company Name</FieldLabel>
                        <input value={coverCompanyName} onChange={(e) => setCoverCompanyName(e.target.value)}
                            placeholder="Acme Inc." className={inputClass} />
                    </div>

                    <div>
                        <FieldLabel>Tone</FieldLabel>
                        <div className="grid grid-cols-3 gap-1.5">
                            {([
                                { id: "professional", label: "Professional" },
                                { id: "confident", label: "Confident" },
                                { id: "warm", label: "Warm" },
                            ] as const).map((tone) => (
                                <button key={tone.id} type="button" onClick={() => setCoverTone(tone.id)}
                                    className={`rounded-md border px-2 py-1.5 text-[11px] transition-colors ${coverTone === tone.id
                                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                        : "border-zinc-700 text-zinc-400 hover:text-zinc-300"}`}>
                                    {tone.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Job Description (Optional)</FieldLabel>
                        <textarea rows={6} value={coverJobDescription}
                            onChange={(e) => setCoverJobDescription(e.target.value)}
                            placeholder="Paste the role description for better alignment."
                            className={textareaClass} />
                    </div>

                    <button type="button" onClick={generateCoverLetter}
                        disabled={coverLoading || !coverJobTitle.trim() || !coverCompanyName.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm text-white transition-all">
                        {coverLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {coverLoading ? "Generating..." : "Generate Cover Letter"}
                    </button>

                    {coverError && <p className="text-xs text-red-400">{coverError}</p>}

                    {coverLetter && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Generated Letter</p>
                                <button type="button" onClick={copyCoverLetter}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    <Copy className="w-3 h-3" />
                                    {copyState === "done" ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <textarea rows={14} value={coverLetter} readOnly className={textareaClass} />
                            {copyState === "error" && (
                                <p className="text-[11px] text-red-400">Could not copy automatically. Please copy manually.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
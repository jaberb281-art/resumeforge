"use client";

import { useResumeStore } from "@/store/useResumeStore";

const textareaClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
            {children}
        </label>
    );
}

export function SummaryPanel() {
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
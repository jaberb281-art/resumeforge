"use client";

import { X } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import type { ResumeTemplate } from "@/store/useResumeStore";

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
    { id: "professional", label: "Professional", desc: "Clean, single-column. Best ATS score." },
    { id: "creative", label: "Creative", desc: "Dark sidebar, typographic hierarchy." },
    { id: "academic", label: "Academic", desc: "Serif fonts, expanded margins." },
];

export function ThemePanel({ onClose }: { onClose: () => void }) {
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
"use client";

import {
    User, Wand2, Download, Save, Eye, Columns2,
    CheckCircle2, Loader2, Palette,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

interface EditorTopbarProps {
    onSave: () => void;
    onDownload: () => void;
    showAI: boolean;
    showTheme: boolean;
    onToggleAI: () => void;
    onToggleTheme: () => void;
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
                <button onClick={onSave}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    <Save className="w-3 h-3" />
                    Unsaved changes
                </button>
            )}
        </div>
    );
}

export function EditorTopbar({ onSave, onDownload, showAI, showTheme, onToggleAI, onToggleTheme }: EditorTopbarProps) {
    const { resumeTitle, isDirty, isSaving, lastSavedAt, previewMode, setPreviewMode, setResumeTitle } = useResumeStore();

    return (
        <header className="h-12 flex items-center justify-between gap-3 px-4 border-b border-zinc-800/80 flex-shrink-0 bg-zinc-950/80 backdrop-blur-sm z-10">
            <div className="min-w-0 flex items-center gap-4 overflow-x-auto">
                <span className="text-sm font-bold tracking-tight text-zinc-100">
                    Resume<span className="text-indigo-400">Forge</span>
                </span>

                <input
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    className="bg-transparent text-sm text-zinc-400 hover:text-zinc-200 focus:text-zinc-100 focus:outline-none w-40 truncate transition-colors"
                />

                <StatusBar isDirty={isDirty} isSaving={isSaving} lastSavedAt={lastSavedAt} onSave={onSave} />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
                <div className="flex items-center bg-zinc-800/60 rounded-lg p-0.5 gap-0.5">
                    {([["split", Columns2], ["form", User], ["preview", Eye]] as const).map(([mode, Icon]) => (
                        <button key={mode} onClick={() => setPreviewMode(mode)}
                            className={`p-1.5 rounded-md transition-all ${previewMode === mode ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                            <Icon className="w-3.5 h-3.5" />
                        </button>
                    ))}
                </div>

                <button onClick={onToggleAI}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showAI ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60"}`}>
                    <Wand2 className="w-3.5 h-3.5" /> AI Tailor
                </button>

                <button onClick={onToggleTheme}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${showTheme ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60"}`}>
                    <Palette className="w-3.5 h-3.5" /> Theme
                </button>

                <button onClick={onSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg text-xs text-zinc-300 transition-all">
                    <Save className="w-3.5 h-3.5" /> Save
                </button>

                <button onClick={onDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white transition-all">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
            </div>
        </header>
    );
}
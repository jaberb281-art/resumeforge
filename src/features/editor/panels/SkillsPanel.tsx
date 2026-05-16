"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all";

const textareaClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none";

export function SkillsPanel() {
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
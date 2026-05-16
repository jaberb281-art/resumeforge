"use client";

import { useState } from "react";
import { ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { v4 as uuidv4 } from "uuid";

const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all";

const textareaClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
            {children}
        </label>
    );
}

export function ExperiencePanel() {
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
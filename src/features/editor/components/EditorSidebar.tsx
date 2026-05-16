"use client";

import { User, Briefcase, GraduationCap, Code2, Wrench, Award } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

const NAV_SECTIONS = [
    { id: "contact", label: "Contact", icon: User },
    { id: "summary", label: "Summary", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code2 },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "certifications", label: "Certifications", icon: Award },
] as const;

export function EditorSidebar() {
    const { activeSection, setActiveSection } = useResumeStore();

    return (
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
    );
}
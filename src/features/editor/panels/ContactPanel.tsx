"use client";

import { useResumeStore } from "@/store/useResumeStore";

const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
            {children}
        </label>
    );
}

export function ContactPanel() {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
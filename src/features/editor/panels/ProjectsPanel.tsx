"use client";

export function ProjectsPanel() {
    const section = "projects";
    return (
        <div className="text-sm text-zinc-500 text-center py-12">
            {section.charAt(0).toUpperCase() + section.slice(1)} panel coming soon.
        </div>
    );
}
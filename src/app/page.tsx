// =============================================================
// ResumeForge — Dashboard
// src/app/page.tsx
//
// Server component. Lists the current user's resumes with a
// "New" button and per-row links into the editor. If the user
// isn't signed in, redirects to /login.
// =============================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createResumeAction } from "./_actions/create-resume";
import { Plus, FileText, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

interface ResumeRow {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
}

function formatRelative(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString();
}

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data: resumes, error } = await supabase
        .from("resumes")
        .select("id, title, updated_at, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("[dashboard] failed to load resumes:", error.message);
    }

    const list = (resumes ?? []) as ResumeRow[];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            {/* Top bar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-800/80">
                <span className="text-sm font-semibold tracking-tight">ResumeForge</span>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 hidden sm:inline">{user.email}</span>
                    <form action="/api/auth/signout" method="post">
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            {/* Body */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-semibold tracking-tight">Your resumes</h1>
                    <form action={createResumeAction}>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New resume
                        </button>
                    </form>
                </div>

                {list.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
                        <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-400 mb-1">No resumes yet</p>
                        <p className="text-xs text-zinc-600">Click &quot;New resume&quot; to create your first one.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {list.map((r) => (
                            <li key={r.id}>
                                <Link
                                    href={`/editor/${r.id}`}
                                    className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-zinc-200 truncate">
                                            {r.title || "Untitled Resume"}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Updated {formatRelative(r.updated_at)}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}

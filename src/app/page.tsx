// =============================================================
// ResumeForge — Dashboard
// src/app/page.tsx
//
// Server component. Fetches the resume list server-side and
// passes it to ResumeList (client component) which handles
// delete, confirmation modal, and local state updates.
// =============================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createResumeAction } from "@/features/resumes/actions/create-resume";
import { AiUsageBadge } from "@/features/ai/components/AiUsageBadge";
import { ResumeList, type ResumeRow } from "@/features/resumes/components/ResumeList";
import { Plus, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

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
                {error && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        Couldn&apos;t refresh your latest resumes. You can still create a new one.
                    </div>
                )}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Your resumes</h1>
                        <div className="mt-3">
                            <AiUsageBadge />
                        </div>
                    </div>
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

                <ResumeList initialResumes={list} />
            </main>
        </div>
    );
}

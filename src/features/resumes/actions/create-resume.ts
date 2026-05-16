// =============================================================
// ResumeForge — Dashboard "New Resume" form action
// src/app/_actions/create-resume.ts
//
// Server action: creates a new resume row for the current user
// and redirects them straight into the editor for it.
// =============================================================

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createResumeAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            user_id: user.id,
            title: "Untitled Resume",
            resume_data: {},
            theme_config: {},
        })
        .select("id")
        .single();

    if (error || !data) {
        throw new Error(error?.message ?? "Failed to create resume");
    }

    redirect(`/editor/${data.id}`);
}

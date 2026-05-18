// =============================================================
// ResumeForge — Resumes API (collection)
// src/app/api/resumes/route.ts
//
// GET   /api/resumes        → list current user's resumes
// POST  /api/resumes        → create a new resume
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createResumePayloadSchema } from "@/features/resumes/schemas";

export const dynamic = "force-dynamic";

// ── GET /api/resumes ─────────────────────────────────────────
export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, updated_at, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resumes: data });
}

// ── POST /api/resumes ────────────────────────────────────────
export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createResumePayloadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid payload", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            user_id: user.id,
            title: parsed.data.title ?? "Untitled Resume",
            resume_data: parsed.data.resume_data ?? {},
            theme_config: parsed.data.theme_config ?? {},
        })
        .select("id, title, resume_data, theme_config, updated_at")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resume: data }, { status: 201 });
}

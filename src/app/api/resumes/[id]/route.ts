// =============================================================
// ResumeForge — Resume API (single record)
// src/app/api/resumes/[id]/route.ts
//
// GET    /api/resumes/[id]  → fetch one resume
// PATCH  /api/resumes/[id]  → update title / data / theme
// DELETE /api/resumes/[id]  → delete
//
// RLS enforces ownership at the database layer. The handlers
// just pass the user's session through.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    resume_data: z.record(z.unknown()).optional(),
    theme_config: z.record(z.unknown()).optional(),
});

interface Ctx {
    params: Promise<{ id: string }>;
}

// ── GET /api/resumes/[id] ────────────────────────────────────
export async function GET(_req: NextRequest, ctx: Ctx) {
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, resume_data, theme_config, updated_at, created_at")
        .eq("id", id)
        .single();

    if (error || !data) {
        // RLS makes "not found" and "not yours" indistinguishable, which is
        // exactly what we want.
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: data });
}

// ── PATCH /api/resumes/[id] ──────────────────────────────────
export async function PATCH(req: NextRequest, ctx: Ctx) {
    const { id } = await ctx.params;
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

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid payload", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    if (Object.keys(parsed.data).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("resumes")
        .update(parsed.data)
        .eq("id", id)
        .select("id, title, updated_at")
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: data });
}

// ── DELETE /api/resumes/[id] ─────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

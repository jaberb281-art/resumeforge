import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Ctx {
    params: Promise<{ id: string }>;
}

function makeCopyTitle(originalTitle: string): string {
    const normalized = originalTitle.trim() || "Untitled Resume";
    const prefixed = `Copy of ${normalized}`;
    const maxLength = 200;

    if (prefixed.length <= maxLength) {
        return prefixed;
    }

    const suffix = " Copy";
    const truncated = normalized.slice(0, Math.max(1, maxLength - suffix.length)).trimEnd();
    return `${truncated}${suffix}`;
}

export async function POST(_req: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: source, error: sourceError } = await supabase
        .from("resumes")
        .select("id, title, resume_data, theme_config")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (sourceError || !source) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const { data: duplicated, error: insertError } = await supabase
        .from("resumes")
        .insert({
            user_id: user.id,
            title: makeCopyTitle(source.title ?? ""),
            resume_data: source.resume_data ?? {},
            theme_config: source.theme_config ?? {},
        })
        .select("id, title, updated_at, created_at")
        .single();

    if (insertError || !duplicated) {
        return NextResponse.json(
            { error: insertError?.message ?? "Failed to duplicate resume" },
            { status: 500 }
        );
    }

    return NextResponse.json({ resume: duplicated }, { status: 201 });
}

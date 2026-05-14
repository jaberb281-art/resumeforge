// =============================================================
// ResumeForge — Sign Out
// src/app/api/auth/signout/route.ts
// =============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
}

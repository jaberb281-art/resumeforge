// =============================================================
// ResumeForge — Auth Callback
// src/app/auth/callback/route.ts
//
// The magic-link flow (PKCE) lands here with a `code` query
// param. We exchange it for a session, which writes the auth
// cookie. Then redirect home.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
        console.error("[/auth/callback] exchange failed:", error.message);
    }

    return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}

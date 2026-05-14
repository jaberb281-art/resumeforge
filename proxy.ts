// =============================================================
// ResumeForge — Auth Proxy (Next.js 16)
// proxy.ts
//
// Refreshes the Supabase session on every request and forwards
// the cookies to the response. Without this, server components
// and route handlers will eventually see an expired token even
// while the user is actively using the app.
//
// IMPORTANT (per Supabase docs): do NOT put auth-required-or-
// redirect logic here. Let RLS + per-route checks handle that.
// This file only refreshes the session.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Triggers a token refresh if needed and writes the new cookie.
    await supabase.auth.getUser();

    return response;
}

export const config = {
    matcher: [
        // Run on every request except static assets and Next internals.
        "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
    ],
};

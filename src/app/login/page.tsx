"use client";

// =============================================================
// ResumeForge — Login
// src/app/login/page.tsx
//
// Magic-link auth. User enters their email, Supabase sends a
// one-time link, clicking it lands on /auth/callback which sets
// the session cookie and redirects home.
// =============================================================

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async () => {
        if (!email.trim()) return;
        setStatus("sending");
        setErrorMessage("");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setStatus("error");
            setErrorMessage(error.message);
        } else {
            setStatus("sent");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-1">ResumeForge</h1>
                    <p className="text-sm text-zinc-500">Sign in to continue</p>
                </div>

                {status === "sent" ? (
                    <div className="border border-zinc-800 rounded-xl p-6 text-center space-y-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-sm text-zinc-200">Check your email</p>
                        <p className="text-xs text-zinc-500">
                            We sent a sign-in link to <span className="text-zinc-300">{email}</span>.
                            Click it to continue.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                                placeholder="you@example.com"
                                disabled={status === "sending"}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={status === "sending" || !email.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 rounded-lg text-sm font-medium transition-colors"
                        >
                            {status === "sending"
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Mail className="w-4 h-4" />}
                            {status === "sending" ? "Sending…" : "Send sign-in link"}
                        </button>

                        {status === "error" && errorMessage && (
                            <p className="text-xs text-red-400 text-center">{errorMessage}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

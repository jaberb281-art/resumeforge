"use client";

// =============================================================
// ResumeForge — Login
// src/app/login/page.tsx
// =============================================================

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<
        "idle" | "sending" | "sent" | "error"
    >("idle");

    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const cleanEmail = email.trim();

        if (!cleanEmail || status === "sending") {
            return;
        }

        try {
            setStatus("sending");
            setErrorMessage("");

            const supabase = createClient();

            const { error } = await supabase.auth.signInWithOtp({
                email: cleanEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setStatus("error");
                setErrorMessage(error.message);
                return;
            }

            setStatus("sent");
        } catch (err) {
            setStatus("error");

            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        ResumeForge
                    </h1>

                    <p className="text-sm text-zinc-500">
                        Sign in to continue
                    </p>
                </div>

                {/* Success State */}
                {status === "sent" ? (
                    <div className="border border-zinc-800 bg-zinc-900/70 rounded-2xl p-6 text-center">
                        <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-4" />

                        <h2 className="text-sm font-medium text-zinc-100 mb-2">
                            Check your email
                        </h2>

                        <p className="text-xs leading-relaxed text-zinc-500">
                            We sent a secure sign-in link to{" "}
                            <span className="text-zinc-300">
                                {email}
                            </span>
                            .
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide">
                                Email
                            </label>

                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === "sending"}
                                placeholder="you@example.com"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        {/* Error */}
                        {status === "error" && errorMessage && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                                <p className="text-xs text-red-400">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={
                                status === "sending" ||
                                !email.trim()
                            }
                            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 rounded-xl text-sm font-medium transition-all"
                        >
                            {status === "sending" ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending link...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send sign-in link
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
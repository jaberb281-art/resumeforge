"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Wand2 } from "lucide-react";

const AI_USAGE_UPDATED_EVENT = "resumeforge:ai-usage-updated";

interface AiUsage {
    usedToday: number;
    dailyLimit: number;
    remaining: number | null;
    hasAiTailoringAccess: boolean;
}

type UsageState =
    | { status: "loading"; usage: null; error: null }
    | { status: "success"; usage: AiUsage; error: null }
    | { status: "error"; usage: null; error: string };

function getLimitLabel(usage: AiUsage): string {
    if (usage.dailyLimit > 0) return String(usage.dailyLimit);
    return usage.hasAiTailoringAccess ? "unlimited" : "0";
}

async function fetchAiUsage(signal?: AbortSignal): Promise<AiUsage> {
    const response = await fetch("/api/ai/usage", { signal });
    const body = (await response.json().catch(() => null)) as Partial<AiUsage> & { error?: unknown } | null;

    if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "Could not load AI usage");
    }

    return {
        usedToday: typeof body?.usedToday === "number" ? body.usedToday : 0,
        dailyLimit: typeof body?.dailyLimit === "number" ? body.dailyLimit : 0,
        remaining: typeof body?.remaining === "number" ? body.remaining : null,
        hasAiTailoringAccess: Boolean(body?.hasAiTailoringAccess),
    };
}

export function notifyAiUsageChanged() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AI_USAGE_UPDATED_EVENT));
    }
}

export function AiUsageBadge({ className = "" }: { className?: string }) {
    const [state, setState] = useState<UsageState>({
        status: "loading",
        usage: null,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();

        void fetchAiUsage(controller.signal)
            .then((usage) => {
                setState({ status: "success", usage, error: null });
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setState({
                    status: "error",
                    usage: null,
                    error: error instanceof Error ? error.message : "Could not load AI usage",
                });
            });

        const handleUsageChanged = () => {
            void fetchAiUsage()
                .then((usage) => {
                    setState({ status: "success", usage, error: null });
                })
                .catch((error) => {
                    setState({
                        status: "error",
                        usage: null,
                        error: error instanceof Error ? error.message : "Could not load AI usage",
                    });
                });
        };

        window.addEventListener(AI_USAGE_UPDATED_EVENT, handleUsageChanged);

        return () => {
            controller.abort();
            window.removeEventListener(AI_USAGE_UPDATED_EVENT, handleUsageChanged);
        };
    }, []);

    const baseClass = `inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs ${className}`;

    if (state.status === "loading") {
        return (
            <span className={`${baseClass} text-zinc-500`}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                AI usage...
            </span>
        );
    }

    if (state.status === "error") {
        return (
            <span className={`${baseClass} text-red-400`} title={state.error}>
                <AlertCircle className="h-3.5 w-3.5" />
                AI usage unavailable
            </span>
        );
    }

    const { usage } = state;
    const limitLabel = getLimitLabel(usage);
    const remainingLabel = usage.remaining === null ? null : `${usage.remaining} left`;

    return (
        <span
            className={`${baseClass} text-zinc-400`}
            title={remainingLabel ?? (usage.hasAiTailoringAccess ? "Unlimited AI tailoring uses" : "AI tailoring is not enabled")}
        >
            <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI uses today: {usage.usedToday}/{limitLabel}</span>
            {remainingLabel && <span className="text-zinc-600">{remainingLabel}</span>}
            {!usage.hasAiTailoringAccess && <span className="text-zinc-600">No access</span>}
        </span>
    );
}

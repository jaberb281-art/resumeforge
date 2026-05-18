import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type AiUsageFeature = "tailor" | "cover_letter";

interface ReserveAiUsageRow {
    allowed: boolean;
    reason: string;
    log_id: string | null;
    daily_limit: number;
    used_today: number;
    remaining: number | null;
    tier: "free" | "pro" | "team" | null;
}

export interface AiUsageReservation {
    logId: string;
    dailyLimit: number;
    usedToday: number;
    remaining: number | null;
    tier: "free" | "pro" | "team";
}

export interface AiUsageDenied {
    reason: string;
    status: number;
    error: string;
    upgradeRequired?: boolean;
}

function normalizeReserveRow(data: ReserveAiUsageRow[] | ReserveAiUsageRow | null): ReserveAiUsageRow | null {
    if (Array.isArray(data)) return data[0] ?? null;
    return data;
}

function quotaDenial(reason: string): AiUsageDenied {
    if (reason === "feature_disabled") {
        return {
            reason,
            status: 402,
            error: "AI features require a Pro subscription.",
            upgradeRequired: true,
        };
    }

    if (reason === "quota_exceeded") {
        return {
            reason,
            status: 429,
            error: "Daily AI usage limit reached. Try again tomorrow.",
        };
    }

    if (reason === "unauthorized") {
        return {
            reason,
            status: 401,
            error: "Unauthorized",
        };
    }

    return {
        reason,
        status: 500,
        error: "Could not reserve AI usage.",
    };
}

export async function reserveAiUsage(
    supabase: SupabaseClient,
    feature: AiUsageFeature
): Promise<{ ok: true; reservation: AiUsageReservation } | { ok: false; denied: AiUsageDenied }> {
    const { data, error } = await supabase.rpc("reserve_ai_usage", {
        p_feature: feature,
    });

    if (error) {
        console.error("[ai quota] reserve failed", error.message);
        return {
            ok: false,
            denied: {
                reason: "rpc_error",
                status: 500,
                error: "Could not reserve AI usage.",
            },
        };
    }

    const row = normalizeReserveRow(data as ReserveAiUsageRow[] | ReserveAiUsageRow | null);
    if (!row?.allowed || !row.log_id || !row.tier) {
        return {
            ok: false,
            denied: quotaDenial(row?.reason ?? "unknown"),
        };
    }

    return {
        ok: true,
        reservation: {
            logId: row.log_id,
            dailyLimit: row.daily_limit,
            usedToday: row.used_today,
            remaining: row.remaining,
            tier: row.tier,
        },
    };
}

export async function completeAiUsage(
    supabase: SupabaseClient,
    logId: string,
    matchScore?: number | null
): Promise<void> {
    const { data, error } = await supabase.rpc("complete_ai_usage", {
        p_log_id: logId,
        p_match_score: matchScore ?? null,
    });

    if (error || data !== true) {
        throw new Error(error?.message ?? "AI usage reservation could not be completed.");
    }
}

export async function releaseAiUsageReservation(
    supabase: SupabaseClient,
    logId: string
): Promise<void> {
    const { error } = await supabase.rpc("release_ai_usage_reservation", {
        p_log_id: logId,
    });

    if (error) {
        console.error("[ai quota] release failed", error.message);
    }
}

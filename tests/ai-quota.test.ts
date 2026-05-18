import { describe, expect, it, vi } from "vitest";
import {
    completeAiUsage,
    releaseAiUsageReservation,
    reserveAiUsage,
} from "@/features/ai/server/quota";

function mockSupabaseRpc(data: unknown, error: { message: string } | null = null) {
    return {
        rpc: vi.fn().mockResolvedValue({ data, error }),
    };
}

describe("AI quota helper", () => {
    it("reserves allowed usage and normalizes RPC rows", async () => {
        const supabase = mockSupabaseRpc([{
            allowed: true,
            reason: "reserved",
            log_id: "log-1",
            daily_limit: 3,
            used_today: 1,
            remaining: 2,
            tier: "pro",
        }]);

        const result = await reserveAiUsage(supabase as never, "tailor");

        expect(supabase.rpc).toHaveBeenCalledWith("reserve_ai_usage", { p_feature: "tailor" });
        expect(result).toEqual({
            ok: true,
            reservation: {
                logId: "log-1",
                dailyLimit: 3,
                usedToday: 1,
                remaining: 2,
                tier: "pro",
            },
        });
    });

    it("maps disabled feature and quota exceeded denials", async () => {
        await expect(reserveAiUsage(mockSupabaseRpc([{
            allowed: false,
            reason: "feature_disabled",
            log_id: null,
            daily_limit: 0,
            used_today: 0,
            remaining: 0,
            tier: "free",
        }]) as never, "cover_letter")).resolves.toMatchObject({
            ok: false,
            denied: { status: 402, upgradeRequired: true },
        });

        await expect(reserveAiUsage(mockSupabaseRpc({
            allowed: false,
            reason: "quota_exceeded",
            log_id: null,
            daily_limit: 1,
            used_today: 1,
            remaining: 0,
            tier: "pro",
        }) as never, "tailor")).resolves.toMatchObject({
            ok: false,
            denied: { status: 429 },
        });
    });

    it("completes usage reservations with optional match score", async () => {
        const supabase = mockSupabaseRpc(true);

        await completeAiUsage(supabase as never, "log-1", 88);

        expect(supabase.rpc).toHaveBeenCalledWith("complete_ai_usage", {
            p_log_id: "log-1",
            p_match_score: 88,
        });
    });

    it("throws when completion fails", async () => {
        const supabase = mockSupabaseRpc(false);

        await expect(completeAiUsage(supabase as never, "log-1")).rejects.toThrow(
            "AI usage reservation could not be completed."
        );
    });

    it("releases failed reservations", async () => {
        const supabase = mockSupabaseRpc(true);

        await releaseAiUsageReservation(supabase as never, "log-1");

        expect(supabase.rpc).toHaveBeenCalledWith("release_ai_usage_reservation", {
            p_log_id: "log-1",
        });
    });
});

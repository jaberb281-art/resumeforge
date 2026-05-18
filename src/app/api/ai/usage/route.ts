import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: limits, error: limitsError } = await supabase
        .from("plan_limits")
        .select("ai_tailoring, ai_daily_limit")
        .eq("user_id", user.id)
        .maybeSingle();

    if (limitsError) {
        return NextResponse.json({ error: "Could not load AI limits" }, { status: 500 });
    }

    const now = new Date();
    const todayStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    const { count, error: logsError } = await supabase
        .from("ai_tailor_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("created_at", todayStart.toISOString())
        .lt("created_at", tomorrowStart.toISOString());

    if (logsError) {
        return NextResponse.json({ error: "Could not load AI usage" }, { status: 500 });
    }

    const usedToday = count ?? 0;
    const dailyLimit = limits?.ai_daily_limit ?? 0;
    const hasAiTailoringAccess = Boolean(limits?.ai_tailoring);
    const remaining = dailyLimit > 0 ? Math.max(dailyLimit - usedToday, 0) : null;

    return NextResponse.json({
        usedToday,
        dailyLimit,
        remaining,
        hasAiTailoringAccess,
    });
}

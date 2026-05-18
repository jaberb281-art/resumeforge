import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
    completeAiUsage,
    releaseAiUsageReservation,
    reserveAiUsage,
} from "@/features/ai/server/quota";

export const dynamic = "force-dynamic";

const MAX_JOB_DESC_CHARS = 8_000;
const MAX_RESUME_BYTES = 20_000;

const requestSchema = z.object({
    data: z.object({
        contact: z.record(z.unknown()).optional(),
        summary: z.string().optional(),
        experience: z.array(z.record(z.unknown())).optional(),
        skills: z.array(z.record(z.unknown())).optional(),
        education: z.array(z.record(z.unknown())).optional(),
    }).passthrough(),
    jobTitle: z.string().min(1).max(160),
    companyName: z.string().min(1).max(160),
    jobDescription: z.string().max(MAX_JOB_DESC_CHARS).optional(),
    tone: z.enum(["professional", "confident", "warm"]).optional(),
});

function buildPrompt(params: {
    data: Record<string, unknown>;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    tone: "professional" | "confident" | "warm";
}): string {
    const toneGuidance = {
        professional: "Use a polished, formal, and concise business tone.",
        confident: "Use a direct and confident tone that emphasizes impact.",
        warm: "Use a human, warm, and personable tone while staying professional.",
    } as const;

    return `You are an expert career writer.

Write a one-page cover letter tailored to the role below.

Rules:
- Return plain text only. No markdown, no bullet list, no headings.
- Length: 280 to 420 words.
- Include greeting, strong opening, relevant body examples, and a concise closing.
- Use only resume information provided by the user. Do not fabricate facts or employers.
- Mention the target job title and company name naturally.
- ${toneGuidance[params.tone]}

Target role:
- Job Title: ${params.jobTitle}
- Company: ${params.companyName}

Job description (may be empty):
${params.jobDescription || "(not provided)"}

Candidate resume data:
${JSON.stringify(params.data, null, 2)}
`;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", issues: parsed.error.issues },
                { status: 400 }
            );
        }

        const resumeSize = JSON.stringify(parsed.data.data).length;
        if (resumeSize > MAX_RESUME_BYTES) {
            return NextResponse.json(
                { error: `Resume payload too large (${resumeSize} > ${MAX_RESUME_BYTES} bytes)` },
                { status: 413 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[/api/cv/cover-letter] Missing GEMINI_API_KEY");
            return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
        }

        const quota = await reserveAiUsage(supabase, "cover_letter");
        if (!quota.ok) {
            return NextResponse.json(
                {
                    error: quota.denied.error,
                    upgradeRequired: quota.denied.upgradeRequired,
                },
                { status: quota.denied.status }
            );
        }

        let quotaCompleted = false;
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: "You are a precise professional cover letter writer. Return plain text only.",
                generationConfig: {
                    temperature: 0.6,
                },
            });

            const prompt = buildPrompt({
                data: parsed.data.data,
                jobTitle: parsed.data.jobTitle.trim(),
                companyName: parsed.data.companyName.trim(),
                jobDescription: parsed.data.jobDescription?.trim() ?? "",
                tone: parsed.data.tone ?? "professional",
            });

            const result = await model.generateContent(prompt);
            const coverLetter = result.response.text().trim();

            if (!coverLetter) {
                return NextResponse.json({ error: "AI returned an empty response" }, { status: 502 });
            }

            await completeAiUsage(supabase, quota.reservation.logId);
            quotaCompleted = true;

            return NextResponse.json({ coverLetter });
        } finally {
            if (!quotaCompleted) {
                await releaseAiUsageReservation(supabase, quota.reservation.logId);
            }
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/cv/cover-letter]", message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

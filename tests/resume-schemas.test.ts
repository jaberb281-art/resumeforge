import { describe, expect, it } from "vitest";
import {
    createResumePayloadSchema,
    patchResumePayloadSchema,
} from "@/features/resumes/schemas";

const validResumeData = {
    contact: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+1 555 0100",
        location: "London",
        website: "https://example.com",
        linkedin: "https://linkedin.com/in/ada",
        github: "https://github.com/ada",
    },
    summary: "Analytical engineer with deep systems experience.",
    experience: [{
        id: "exp-1",
        role: "Senior Engineer",
        company: "Analytical Engines Ltd",
        location: "London",
        startDate: "2021-01",
        endDate: "2024-01",
        current: false,
        bullets: ["Built reliable calculation systems."],
        technologies: ["TypeScript", "PostgreSQL"],
    }],
    education: [{
        id: "edu-1",
        degree: "BS",
        field: "Mathematics",
        institution: "University",
        location: "London",
        graduationDate: "2020",
        gpa: "4.0",
        honors: "First class",
        coursework: ["Algorithms"],
    }],
    projects: [{
        id: "proj-1",
        name: "ResumeForge",
        description: "A resume builder.",
        url: "https://example.com",
        repoUrl: "https://github.com/example/repo",
        technologies: ["React"],
        highlights: ["Built PDF preview."],
    }],
    certifications: [{
        id: "cert-1",
        name: "Cloud Practitioner",
        issuer: "Cloud Co",
        date: "2024",
        credentialUrl: "https://example.com/cert",
    }],
    skills: [{ category: "Frontend", items: ["React", "TypeScript"] }],
    languages: [{ language: "English", proficiency: "Native" }],
    volunteer: [{ role: "Mentor", org: "Code Club", date: "2023", summary: "Helped learners." }],
};

const validThemeConfig = {
    template: "professional",
    colors: {
        primary: "#0F172A",
        secondary: "#334155",
        text: "#1E293B",
        background: "#FFFFFF",
    },
    typography: {
        headingFont: "Inter",
        bodyFont: "Lato",
        baseFontSize: 10,
        lineHeight: 1.45,
    },
    spacing: {
        pagePaddingX: 40,
        pagePaddingY: 40,
        sectionGap: 16,
        entryGap: 10,
    },
    layout: {
        columns: 1,
        showPhoto: false,
        dividerStyle: "line",
    },
};

describe("resume payload schemas", () => {
    it("accepts valid create and patch payloads", () => {
        const payload = {
            title: "Senior Engineer",
            resume_data: validResumeData,
            theme_config: validThemeConfig,
        };

        expect(createResumePayloadSchema.safeParse(payload).success).toBe(true);
        expect(patchResumePayloadSchema.safeParse(payload).success).toBe(true);
    });

    it("preserves compatibility with empty default resume and theme objects", () => {
        expect(createResumePayloadSchema.safeParse({
            resume_data: {},
            theme_config: {},
        }).success).toBe(true);
    });

    it("rejects unknown huge nested objects", () => {
        const parsed = patchResumePayloadSchema.safeParse({
            resume_data: {
                contact: { name: "Ada" },
                unknown: { nested: "x".repeat(10_000) },
            },
        });

        expect(parsed.success).toBe(false);
        expect(parsed.error?.issues.some((issue) => (
            issue.code === "unrecognized_keys" && issue.keys.includes("unknown")
        ))).toBe(true);
    });

    it("rejects oversized strings and arrays", () => {
        expect(patchResumePayloadSchema.safeParse({
            resume_data: { summary: "x".repeat(4_001) },
        }).success).toBe(false);

        expect(patchResumePayloadSchema.safeParse({
            resume_data: {
                experience: [{
                    id: "exp-1",
                    role: "Engineer",
                    company: "Acme",
                    startDate: "2020",
                    current: true,
                    bullets: Array.from({ length: 21 }, () => "Did work."),
                }],
            },
        }).success).toBe(false);
    });

    it("rejects invalid theme configs", () => {
        expect(patchResumePayloadSchema.safeParse({
            theme_config: {
                ...validThemeConfig,
                colors: {
                    ...validThemeConfig.colors,
                    primary: "blue",
                },
            },
        }).success).toBe(false);
    });
});

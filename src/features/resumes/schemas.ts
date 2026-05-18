import { z } from "zod";

const MAX_RESUME_DATA_BYTES = 50_000;
const MAX_THEME_CONFIG_BYTES = 10_000;

const shortText = z.string().max(200);
const mediumText = z.string().max(500);
const longText = z.string().max(4_000);
const colorValue = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Expected a hex color");

function maxJsonBytes(maxBytes: number) {
    return (value: unknown, ctx: z.RefinementCtx) => {
        const byteLength = new TextEncoder().encode(JSON.stringify(value)).length;
        if (byteLength > maxBytes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Payload is too large (${byteLength} bytes > ${maxBytes} bytes)`,
            });
        }
    };
}

const contactSchema = z.object({
    name: shortText.optional(),
    email: shortText.optional(),
    phone: shortText.optional(),
    location: shortText.optional(),
    website: mediumText.optional(),
    linkedin: mediumText.optional(),
    github: mediumText.optional(),
}).strict();

const experienceSchema = z.object({
    id: shortText,
    role: shortText,
    company: shortText,
    location: shortText.optional(),
    startDate: shortText,
    endDate: shortText.optional(),
    current: z.boolean(),
    bullets: z.array(mediumText).max(20),
    technologies: z.array(shortText).max(40).optional(),
}).strict();

const educationSchema = z.object({
    id: shortText,
    degree: shortText,
    field: shortText.optional(),
    institution: shortText,
    location: shortText.optional(),
    graduationDate: shortText,
    gpa: shortText.optional(),
    honors: mediumText.optional(),
    coursework: z.array(shortText).max(40).optional(),
}).strict();

const projectSchema = z.object({
    id: shortText,
    name: shortText,
    description: longText,
    url: mediumText.optional(),
    repoUrl: mediumText.optional(),
    technologies: z.array(shortText).max(40),
    highlights: z.array(mediumText).max(20),
}).strict();

const certificationSchema = z.object({
    id: shortText,
    name: shortText,
    issuer: shortText,
    date: shortText,
    credentialUrl: mediumText.optional(),
}).strict();

const skillGroupSchema = z.object({
    category: shortText,
    items: z.array(shortText).max(80),
}).strict();

const languageSchema = z.object({
    language: shortText,
    proficiency: shortText,
}).strict();

const volunteerSchema = z.object({
    role: shortText,
    org: shortText,
    date: shortText,
    summary: longText,
}).strict();

export const resumeDataSchema = z.object({
    contact: contactSchema.optional(),
    summary: longText.optional(),
    experience: z.array(experienceSchema).max(40).optional(),
    education: z.array(educationSchema).max(30).optional(),
    projects: z.array(projectSchema).max(30).optional(),
    certifications: z.array(certificationSchema).max(40).optional(),
    skills: z.array(skillGroupSchema).max(30).optional(),
    languages: z.array(languageSchema).max(20).optional(),
    volunteer: z.array(volunteerSchema).max(20).optional(),
}).strict().superRefine(maxJsonBytes(MAX_RESUME_DATA_BYTES));

const fullThemeConfigSchema = z.object({
    template: z.enum(["professional", "creative", "academic"]),
    colors: z.object({
        primary: colorValue,
        secondary: colorValue,
        text: colorValue,
        background: colorValue,
        accent: colorValue.optional(),
    }).strict(),
    typography: z.object({
        headingFont: z.enum([
            "Inter",
            "Lato",
            "Merriweather",
            "Playfair Display",
            "Source Serif Pro",
            "IBM Plex Sans",
        ]),
        bodyFont: z.enum([
            "Inter",
            "Lato",
            "Merriweather",
            "Playfair Display",
            "Source Serif Pro",
            "IBM Plex Sans",
        ]),
        baseFontSize: z.number().min(6).max(24),
        lineHeight: z.number().min(0.8).max(3),
    }).strict(),
    spacing: z.object({
        pagePaddingX: z.number().min(0).max(120),
        pagePaddingY: z.number().min(0).max(120),
        sectionGap: z.number().min(0).max(80),
        entryGap: z.number().min(0).max(80),
    }).strict(),
    layout: z.object({
        columns: z.union([z.literal(1), z.literal(2)]),
        sidebarWidth: z.number().min(10).max(60).optional(),
        showPhoto: z.boolean(),
        dividerStyle: z.enum(["line", "thick", "none"]),
    }).strict(),
}).strict();

export const themeConfigSchema = z.union([
    fullThemeConfigSchema,
    z.object({}).strict(),
]).superRefine(maxJsonBytes(MAX_THEME_CONFIG_BYTES));

export const createResumePayloadSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    resume_data: resumeDataSchema.optional(),
    theme_config: themeConfigSchema.optional(),
}).strict();

export const patchResumePayloadSchema = createResumePayloadSchema;

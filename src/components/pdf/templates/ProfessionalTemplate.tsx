// =============================================================
// ResumeForge — PDF Template: "Professional"
// src/components/pdf/templates/ProfessionalTemplate.tsx
// =============================================================

import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
    Link,
} from "@react-pdf/renderer";
import type { ResumeData, ThemeConfig } from "@/store/useResumeStore";

// ─────────────────────────────────────────────────────────────
// FONT REGISTRATION
// ─────────────────────────────────────────────────────────────

Font.register({
    family: "Inter", fonts: [
        { src: "/fonts/inter-400.woff", fontWeight: 400 },
        { src: "/fonts/inter-600.woff", fontWeight: 600 },
        { src: "/fonts/inter-700.woff", fontWeight: 700 },
    ]
});
Font.register({
    family: "Lato", fonts: [
        { src: "/fonts/lato-400.woff", fontWeight: 400 },
        { src: "/fonts/lato-700.woff", fontWeight: 700 },
    ]
});
Font.register({
    family: "Merriweather", fonts: [
        { src: "/fonts/merriweather-400.woff", fontWeight: 400 },
        { src: "/fonts/merriweather-700.woff", fontWeight: 700 },
    ]
});
Font.register({
    family: "Playfair Display", fonts: [
        { src: "/fonts/playfair-display-400.woff", fontWeight: 400 },
        { src: "/fonts/playfair-display-700.woff", fontWeight: 700 },
    ]
});
Font.register({
    family: "Source Serif Pro", fonts: [
        { src: "/fonts/source-serif-pro-400.woff", fontWeight: 400 },
        { src: "/fonts/source-serif-pro-700.woff", fontWeight: 700 },
    ]
});
Font.register({
    family: "IBM Plex Sans", fonts: [
        { src: "/fonts/ibm-plex-sans-400.woff", fontWeight: 400 },
        { src: "/fonts/ibm-plex-sans-700.woff", fontWeight: 700 },
    ]
});

// Disable hyphenation for ATS stability
Font.registerHyphenationCallback((word) => [word]);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "Present";
    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

// Ensures Link src is never empty — empty string crashes react-pdf renderer
function safeUrl(url?: string | null): string {
    return (url && url.trim()) ? url.trim() : "#";
}

// ─────────────────────────────────────────────────────────────
// STYLE FACTORY
// FIX: gap is NOT supported in react-pdf. Replaced with marginRight/marginBottom.
// FIX: lineHeight must be absolute pt values, not fractional multipliers.
//      Fractional lineHeight (e.g. 1.4) causes unpredictable page overflow
//      because react-pdf interprets it differently than browsers.
// ─────────────────────────────────────────────────────────────

function makeStyles(theme: ThemeConfig) {
    const { colors, typography, spacing } = theme;
    const { pagePaddingX: px, pagePaddingY: py, sectionGap, entryGap } = spacing;
    const fs = typography.baseFontSize;

    return StyleSheet.create({
        page: {
            fontFamily: typography.bodyFont,
            fontSize: fs,
            lineHeight: fs * typography.lineHeight, // absolute pt
            color: colors.text,
            backgroundColor: colors.background,
            paddingHorizontal: px,
            paddingVertical: py,
        },
        header: { marginBottom: sectionGap },
        headerName: {
            fontFamily: typography.headingFont,
            fontSize: fs + 14,
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: -0.5,
            marginBottom: 4,
            lineHeight: (fs + 14) * 1.15,
        },
        // NO gap — use marginRight on each contactItem
        contactRow: { flexDirection: "row", flexWrap: "wrap" },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            fontSize: fs - 0.5,
            color: colors.secondary,
            marginRight: 14,
            marginBottom: 2,
        },
        contactLink: {
            color: colors.primary,
            textDecoration: "none",
            fontSize: fs - 0.5,
        },
        divider: {
            borderBottomWidth: theme.layout.dividerStyle === "thick" ? 2 : 0.75,
            borderBottomColor: colors.primary,
            borderBottomStyle: "solid",
            marginBottom: 6,
        },
        section: { marginBottom: sectionGap },
        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: fs + 1,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 5,
            lineHeight: (fs + 1) * 1.3,
        },
        summary: {
            fontSize: fs,
            lineHeight: fs * typography.lineHeight,
            color: colors.text,
        },
        entry: { marginBottom: entryGap },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 1,
        },
        entryTitle: {
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: fs + 0.5,
            color: colors.primary,
            flex: 1,
            lineHeight: (fs + 0.5) * 1.3,
        },
        entryDate: {
            fontSize: fs - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
        },
        // NO gap — use marginRight on company text
        entrySubtitle: { flexDirection: "row", marginBottom: 4 },
        entryCompany: {
            fontSize: fs,
            fontWeight: 600,
            color: colors.secondary,
            marginRight: 6,
        },
        entryLocation: {
            fontSize: fs - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
        },
        bulletList: { paddingLeft: 4 },
        bulletRow: { flexDirection: "row", marginBottom: 2 },
        bulletDot: { width: 10, marginTop: 1, color: colors.primary, fontSize: fs - 1 },
        bulletText: {
            flex: 1,
            fontSize: fs - 0.5,
            lineHeight: (fs - 0.5) * 1.4,
            color: colors.text,
        },
        eduDegree: {
            fontWeight: 700,
            fontSize: fs + 0.5,
            color: colors.primary,
            lineHeight: (fs + 0.5) * 1.3,
        },
        eduInstitution: { fontSize: fs, color: colors.secondary },
        eduMeta: { fontSize: fs - 0.5, color: colors.secondary, fontStyle: "italic" },
        // NO gap — width 48% + marginRight 2%
        skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
        skillGroup: { width: "48%", marginBottom: 6, marginRight: "2%" },
        skillCategory: {
            fontWeight: 700,
            fontSize: fs - 0.5,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 2,
        },
        skillItems: {
            fontSize: fs - 0.5,
            color: colors.text,
            lineHeight: (fs - 0.5) * 1.4,
        },
        projectName: {
            fontWeight: 700,
            fontSize: fs,
            color: colors.primary,
            lineHeight: fs * 1.3,
        },
        // Link used as project title — must NOT be wrapped in Text
        projectLink: {
            fontWeight: 700,
            fontSize: fs,
            color: colors.primary,
            textDecoration: "none",
            lineHeight: fs * 1.3,
        },
        projectSourceLink: {
            fontSize: fs - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
            textDecoration: "none",
        },
        projectDescription: {
            fontSize: fs - 0.5,
            color: colors.text,
            lineHeight: (fs - 0.5) * 1.4,
            marginBottom: 2,
        },
        projectTech: {
            fontSize: fs - 1,
            color: colors.secondary,
            fontStyle: "italic",
        },
        // NO gap — marginRight + marginBottom on each tag
        tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
        tag: {
            fontSize: fs - 1.5,
            color: colors.primary,
            borderWidth: 0.5,
            borderColor: colors.primary,
            borderRadius: 3,
            paddingHorizontal: 5,
            paddingVertical: 1.5,
            marginRight: 4,
            marginBottom: 2,
        },
        certRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: entryGap - 4,
        },
        certName: { fontWeight: 600, fontSize: fs, color: colors.primary, flex: 1 },
        certMeta: { fontSize: fs - 0.5, color: colors.secondary, fontStyle: "italic" },
    });
}

// ─────────────────────────────────────────────────────────────
// SECTION WRAPPER
// REMOVED wrap={false} from the section View.
// wrap={false} on a section that contains multiple entries
// forces the ENTIRE section to a new page when any entry
// doesn't fit — the root cause of unexpected page splits.
// Individual entry Views also have wrap removed so react-pdf
// can break naturally across pages.
// ─────────────────────────────────────────────────────────────

interface SectionProps {
    title: string;
    styles: ReturnType<typeof makeStyles>;
    children: React.ReactNode;
    theme: ThemeConfig;
}

function Section({ title, styles, children, theme }: SectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeading}>{title}</Text>
            {theme.layout.dividerStyle !== "none" && <View style={styles.divider} />}
            {children}
        </View>
    );
}

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    if (!text?.trim()) return null;
    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>▸</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────

interface ProfessionalTemplateProps {
    data: ResumeData;
    theme: ThemeConfig;
}

export function ProfessionalTemplate({ data, theme }: ProfessionalTemplateProps) {
    const styles = makeStyles(theme);

    // Defensive: all arrays default to [] so .map() never throws on undefined
    const contact = data?.contact ?? { name: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" };
    const summary = data?.summary ?? "";
    const experience = data?.experience ?? [];
    const education = data?.education ?? [];
    const projects = data?.projects ?? [];
    const skills = data?.skills ?? [];
    const certifications = data?.certifications ?? [];

    return (
        <Document
            title={contact.name || "Resume"}
            author={contact.name || ""}
            keywords={skills.flatMap((g) => g.items ?? []).join(", ")}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>

                {/* ── HEADER ─────────────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.headerName}>{contact.name || "Your Name"}</Text>
                    <View style={styles.contactRow}>
                        {!!contact.email?.trim() && (
                            <View style={styles.contactItem}>
                                <Link src={`mailto:${contact.email.trim()}`} style={styles.contactLink}>
                                    {contact.email.trim()}
                                </Link>
                            </View>
                        )}
                        {!!contact.phone?.trim() && (
                            <View style={styles.contactItem}>
                                <Text>{contact.phone.trim()}</Text>
                            </View>
                        )}
                        {!!contact.location?.trim() && (
                            <View style={styles.contactItem}>
                                <Text>{contact.location.trim()}</Text>
                            </View>
                        )}
                        {!!contact.linkedin?.trim() && (
                            <View style={styles.contactItem}>
                                <Link src={safeUrl(contact.linkedin)} style={styles.contactLink}>
                                    LinkedIn
                                </Link>
                            </View>
                        )}
                        {!!contact.github?.trim() && (
                            <View style={styles.contactItem}>
                                <Link src={safeUrl(contact.github)} style={styles.contactLink}>
                                    GitHub
                                </Link>
                            </View>
                        )}
                        {!!contact.website?.trim() && (
                            <View style={styles.contactItem}>
                                <Link src={safeUrl(contact.website)} style={styles.contactLink}>
                                    {contact.website.trim().replace(/^https?:\/\//, "")}
                                </Link>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── SUMMARY ──────────────────────────────── */}
                {!!summary?.trim() && (
                    <Section title="Summary" styles={styles} theme={theme}>
                        <Text style={styles.summary}>{summary}</Text>
                    </Section>
                )}

                {/* ── EXPERIENCE ───────────────────────────── */}
                {experience.length > 0 && (
                    <Section title="Experience" styles={styles} theme={theme}>
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.role || ""}</Text>
                                    <Text style={styles.entryDate}>
                                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                    </Text>
                                </View>
                                <View style={styles.entrySubtitle}>
                                    <Text style={styles.entryCompany}>{exp.company || ""}</Text>
                                    {!!exp.location?.trim() && (
                                        <Text style={styles.entryLocation}>· {exp.location.trim()}</Text>
                                    )}
                                </View>
                                <View style={styles.bulletList}>
                                    {(exp.bullets ?? []).map((b, i) => (
                                        <Bullet key={i} text={b} styles={styles} />
                                    ))}
                                </View>
                                {(exp.technologies ?? []).length > 0 && (
                                    <View style={styles.tagRow}>
                                        {(exp.technologies ?? []).map((t) => (
                                            <Text key={t} style={styles.tag}>{t}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── PROJECTS ─────────────────────────────── */}
                {projects.length > 0 && (
                    <Section title="Projects" styles={styles} theme={theme}>
                        {projects.map((proj) => (
                            <View key={proj.id} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    {/*
                                     * FIX: Link must NOT be nested inside <Text>.
                                     * <Text><Link>...</Link></Text> is invalid in react-pdf
                                     * and crashes the renderer. Link is used standalone here.
                                     */}
                                    {proj.url?.trim()
                                        ? <Link src={safeUrl(proj.url)} style={styles.projectLink}>{proj.name || ""}</Link>
                                        : <Text style={styles.projectName}>{proj.name || ""}</Text>
                                    }
                                    {!!proj.repoUrl?.trim() && (
                                        <Link src={safeUrl(proj.repoUrl)} style={styles.projectSourceLink}>
                                            Source
                                        </Link>
                                    )}
                                </View>
                                {!!proj.description?.trim() && (
                                    <Text style={styles.projectDescription}>{proj.description}</Text>
                                )}
                                {(proj.highlights ?? []).map((h, i) => (
                                    <Bullet key={i} text={h} styles={styles} />
                                ))}
                                {(proj.technologies ?? []).length > 0 && (
                                    <Text style={styles.projectTech}>
                                        {(proj.technologies ?? []).join(" · ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── SKILLS ───────────────────────────────── */}
                {skills.length > 0 && (
                    <Section title="Skills" styles={styles} theme={theme}>
                        <View style={styles.skillsGrid}>
                            {skills.map((group) => (
                                <View key={group.category} style={styles.skillGroup}>
                                    <Text style={styles.skillCategory}>{group.category}</Text>
                                    <Text style={styles.skillItems}>
                                        {(group.items ?? []).join(", ")}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Section>
                )}

                {/* ── EDUCATION ────────────────────────────── */}
                {education.length > 0 && (
                    <Section title="Education" styles={styles} theme={theme}>
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.eduDegree}>
                                        {edu.degree || ""}{edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    <Text style={styles.entryDate}>{formatDate(edu.graduationDate)}</Text>
                                </View>
                                <Text style={styles.eduInstitution}>
                                    {edu.institution || ""}{edu.location ? ` · ${edu.location}` : ""}
                                </Text>
                                {!!edu.gpa?.trim() && <Text style={styles.eduMeta}>GPA: {edu.gpa}</Text>}
                                {!!edu.honors?.trim() && <Text style={styles.eduMeta}>{edu.honors}</Text>}
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── CERTIFICATIONS ───────────────────────── */}
                {certifications.length > 0 && (
                    <Section title="Certifications" styles={styles} theme={theme}>
                        {certifications.map((cert) => (
                            <View key={cert.id} style={styles.certRow}>
                                <Text style={styles.certName}>{cert.name || ""}</Text>
                                <Text style={styles.certMeta}>
                                    {cert.issuer || ""}{cert.date ? ` · ${formatDate(cert.date)}` : ""}
                                </Text>
                            </View>
                        ))}
                    </Section>
                )}

            </Page>
        </Document>
    );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE REGISTRY
// ─────────────────────────────────────────────────────────────

import type { ResumeTemplate } from "@/store/useResumeStore";
import { CreativeTemplate } from "./CreativeTemplate";

type TemplateComponent = (props: ProfessionalTemplateProps) => React.ReactElement;

export const TEMPLATE_REGISTRY: Record<ResumeTemplate, TemplateComponent> = {
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    academic: ProfessionalTemplate, // fallback until Academic template is built
};

export function getTemplate(template: ResumeTemplate): TemplateComponent {
    return TEMPLATE_REGISTRY[template] ?? ProfessionalTemplate;
}
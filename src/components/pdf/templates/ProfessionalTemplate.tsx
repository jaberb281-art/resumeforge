// =============================================================
// ResumeForge — PDF Template: "Professional"
// src/components/pdf/templates/ProfessionalTemplate.tsx
//
// Uses @react-pdf/renderer — ATS-safe (real selectable text,
// no canvas, no images for content). Pure vector layout.
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
    Svg,
    Path,
} from "@react-pdf/renderer";
import type { ResumeData, ThemeConfig } from "@/store/useResumeStore";


// ─────────────────────────────────────────────────────────────
// FONT REGISTRATION
// Register all fonts once at module level.
// Fonts are served locally from /public/fonts to avoid CORS/404
// issues with fonts.gstatic.com blocking non-browser user-agents.
// ─────────────────────────────────────────────────────────────

Font.register({
    family: "Inter",
    fonts: [
        { src: "/fonts/inter-400.woff", fontWeight: 400 },
        { src: "/fonts/inter-600.woff", fontWeight: 600 },
        { src: "/fonts/inter-700.woff", fontWeight: 700 },
    ],
});

Font.register({
    family: "Lato",
    fonts: [
        { src: "/fonts/lato-400.woff", fontWeight: 400 },
        { src: "/fonts/lato-700.woff", fontWeight: 700 },
    ],
});

Font.register({
    family: "Merriweather",
    fonts: [
        { src: "/fonts/merriweather-400.woff", fontWeight: 400 },
        { src: "/fonts/merriweather-700.woff", fontWeight: 700 },
    ],
});

Font.register({
    family: "Playfair Display",
    fonts: [
        { src: "/fonts/playfair-display-400.woff", fontWeight: 400 },
        { src: "/fonts/playfair-display-700.woff", fontWeight: 700 },
    ],
});

Font.register({
    family: "Source Serif Pro",
    fonts: [
        { src: "/fonts/source-serif-pro-400.woff", fontWeight: 400 },
        { src: "/fonts/source-serif-pro-700.woff", fontWeight: 700 },
    ],
});

Font.register({
    family: "IBM Plex Sans",
    fonts: [
        { src: "/fonts/ibm-plex-sans-400.woff", fontWeight: 400 },
        { src: "/fonts/ibm-plex-sans-700.woff", fontWeight: 700 },
    ],
});

// Hyphenation — disable for ATS compatibility
Font.registerHyphenationCallback((word) => [word]);

// ─────────────────────────────────────────────────────────────
// STYLE FACTORY
// Called with ThemeConfig → returns a StyleSheet.
// This is the "Data-Theme Split" in action.
// ─────────────────────────────────────────────────────────────

function makeStyles(theme: ThemeConfig) {
    const { colors, typography, spacing } = theme;
    const { pagePaddingX: px, pagePaddingY: py, sectionGap, entryGap } = spacing;

    return StyleSheet.create({
        // ── Page ──
        page: {
            fontFamily: typography.bodyFont,
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            color: colors.text,
            backgroundColor: colors.background,
            paddingHorizontal: px,
            paddingVertical: py,
        },

        // ── Header ──
        header: {
            marginBottom: sectionGap,
        },
        headerName: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 14,
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: -0.5,
            marginBottom: 3,
        },
        headerHeadline: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 2,
            fontWeight: 400,
            color: colors.secondary,
            marginBottom: 8,
        },
        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
        },
        contactItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            fontSize: typography.baseFontSize - 0.5,
            color: colors.secondary,
        },
        contactLink: {
            color: colors.primary,
            textDecoration: "none",
        },

        // ── Divider ──
        divider: {
            borderBottomWidth: theme.layout.dividerStyle === "thick" ? 2 : 0.75,
            borderBottomColor: colors.primary,
            borderBottomStyle: "solid",
            marginBottom: 6,
        },

        // ── Section ──
        section: {
            marginBottom: sectionGap,
        },
        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 1,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 5,
        },

        // ── Summary ──
        summary: {
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            color: colors.text,
        },

        // ── Experience entry ──
        entry: {
            marginBottom: entryGap,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 1,
        },
        entryTitle: {
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize + 0.5,
            color: colors.primary,
            flex: 1,
        },
        entryDate: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
        },
        entrySubtitle: {
            flexDirection: "row",
            gap: 6,
            marginBottom: 4,
        },
        entryCompany: {
            fontSize: typography.baseFontSize,
            fontWeight: 600,
            color: colors.secondary,
        },
        entryLocation: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
        },

        // ── Bullets ──
        bulletList: {
            paddingLeft: 12,
        },
        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },
        bulletDot: {
            width: 10,
            marginTop: 1.5,
            color: colors.primary,
            fontSize: typography.baseFontSize - 1,
        },
        bulletText: {
            flex: 1,
            fontSize: typography.baseFontSize - 0.5,
            lineHeight: typography.lineHeight,
            color: colors.text,
        },

        // ── Education ──
        eduDegree: {
            fontWeight: 700,
            fontSize: typography.baseFontSize + 0.5,
            color: colors.primary,
        },
        eduInstitution: {
            fontSize: typography.baseFontSize,
            color: colors.secondary,
        },

        // ── Skills ──
        skillsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
        },
        skillGroup: {
            width: "48%",
            marginBottom: 5,
        },
        skillCategory: {
            fontWeight: 700,
            fontSize: typography.baseFontSize - 0.5,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 2,
        },
        skillItems: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: 1.4,
        },

        // ── Projects ──
        projectName: {
            fontWeight: 700,
            fontSize: typography.baseFontSize,
            color: colors.primary,
        },
        projectDescription: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: typography.lineHeight,
            marginBottom: 2,
        },
        projectTech: {
            fontSize: typography.baseFontSize - 1,
            color: colors.secondary,
            fontStyle: "italic",
        },

        // ── Tags (for technologies) ──
        tagRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 3,
        },
        tag: {
            fontSize: typography.baseFontSize - 1.5,
            color: colors.primary,
            backgroundColor: colors.background,
            borderWidth: 0.5,
            borderColor: colors.primary,
            borderRadius: 3,
            paddingHorizontal: 5,
            paddingVertical: 1.5,
        },
    });
}

// ─────────────────────────────────────────────────────────────
// SMALL UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────

interface SectionProps {
    title: string;
    styles: ReturnType<typeof makeStyles>;
    children: React.ReactNode;
    theme: ThemeConfig;
}

function Section({ title, styles, children, theme }: SectionProps) {
    return (
        <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>{title}</Text>
            {theme.layout.dividerStyle !== "none" && (
                <View style={styles.divider} />
            )}
            {children}
        </View>
    );
}

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>▸</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Present";
    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

// ─────────────────────────────────────────────────────────────
// MAIN DOCUMENT COMPONENT
// ─────────────────────────────────────────────────────────────

interface ProfessionalTemplateProps {
    data: ResumeData;
    theme: ThemeConfig;
}

export function ProfessionalTemplate({ data, theme }: ProfessionalTemplateProps) {
    const styles = makeStyles(theme);
    const { contact, summary, experience, education, projects, skills, certifications } = data;

    return (
        <Document
            title={contact.name}
            author={contact.name}
            keywords={skills.flatMap((g) => g.items).join(", ")}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>
                {/* ── HEADER ───────────────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.headerName}>{contact.name || "Your Name"}</Text>

                    {/* Contact line */}
                    <View style={styles.contactRow}>
                        {contact.email && (
                            <View style={styles.contactItem}>
                                <Link src={`mailto:${contact.email}`} style={styles.contactLink}>
                                    <Text>{contact.email}</Text>
                                </Link>
                            </View>
                        )}
                        {contact.phone && (
                            <View style={styles.contactItem}>
                                <Text>{contact.phone}</Text>
                            </View>
                        )}
                        {contact.location && (
                            <View style={styles.contactItem}>
                                <Text>{contact.location}</Text>
                            </View>
                        )}
                        {contact.linkedin && (
                            <View style={styles.contactItem}>
                                <Link src={contact.linkedin} style={styles.contactLink}>
                                    <Text>LinkedIn</Text>
                                </Link>
                            </View>
                        )}
                        {contact.github && (
                            <View style={styles.contactItem}>
                                <Link src={contact.github} style={styles.contactLink}>
                                    <Text>GitHub</Text>
                                </Link>
                            </View>
                        )}
                        {contact.website && (
                            <View style={styles.contactItem}>
                                <Link src={contact.website} style={styles.contactLink}>
                                    <Text>{contact.website.replace(/^https?:\/\//, "")}</Text>
                                </Link>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── SUMMARY ──────────────────────────────────── */}
                {summary && (
                    <Section title="Summary" styles={styles} theme={theme}>
                        <Text style={styles.summary}>{summary}</Text>
                    </Section>
                )}

                {/* ── EXPERIENCE ───────────────────────────────── */}
                {experience.length > 0 && (
                    <Section title="Experience" styles={styles} theme={theme}>
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.role}</Text>
                                    <Text style={styles.entryDate}>
                                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                    </Text>
                                </View>
                                <View style={styles.entrySubtitle}>
                                    <Text style={styles.entryCompany}>{exp.company}</Text>
                                    {exp.location && (
                                        <Text style={styles.entryLocation}> · {exp.location}</Text>
                                    )}
                                </View>
                                <View style={styles.bulletList}>
                                    {exp.bullets.map((b, i) => (
                                        <Bullet key={i} text={b} styles={styles} />
                                    ))}
                                </View>
                                {exp.technologies && exp.technologies.length > 0 && (
                                    <View style={styles.tagRow}>
                                        {exp.technologies.map((t) => (
                                            <Text key={t} style={styles.tag}>{t}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── PROJECTS ─────────────────────────────────── */}
                {projects.length > 0 && (
                    <Section title="Projects" styles={styles} theme={theme}>
                        {projects.map((proj) => (
                            <View key={proj.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.projectName}>
                                        {proj.url
                                            ? <Link src={proj.url}>{proj.name}</Link>
                                            : proj.name}
                                    </Text>
                                    {proj.repoUrl && (
                                        <Link src={proj.repoUrl} style={styles.contactLink}>
                                            <Text style={styles.entryDate}>Source</Text>
                                        </Link>
                                    )}
                                </View>
                                <Text style={styles.projectDescription}>{proj.description}</Text>
                                {proj.highlights.map((h, i) => (
                                    <Bullet key={i} text={h} styles={styles} />
                                ))}
                                <Text style={styles.projectTech}>
                                    {proj.technologies.join(" · ")}
                                </Text>
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── SKILLS ───────────────────────────────────── */}
                {skills.length > 0 && (
                    <Section title="Skills" styles={styles} theme={theme}>
                        <View style={styles.skillsGrid}>
                            {skills.map((group) => (
                                <View key={group.category} style={styles.skillGroup}>
                                    <Text style={styles.skillCategory}>{group.category}</Text>
                                    <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
                                </View>
                            ))}
                        </View>
                    </Section>
                )}

                {/* ── EDUCATION ────────────────────────────────── */}
                {education.length > 0 && (
                    <Section title="Education" styles={styles} theme={theme}>
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.eduDegree}>
                                        {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    <Text style={styles.entryDate}>{formatDate(edu.graduationDate)}</Text>
                                </View>
                                <Text style={styles.eduInstitution}>
                                    {edu.institution}{edu.location ? ` · ${edu.location}` : ""}
                                </Text>
                                {edu.gpa && (
                                    <Text style={styles.entryLocation}>GPA: {edu.gpa}</Text>
                                )}
                                {edu.honors && (
                                    <Text style={styles.entryLocation}>{edu.honors}</Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* ── CERTIFICATIONS ───────────────────────────── */}
                {certifications.length > 0 && (
                    <Section title="Certifications" styles={styles} theme={theme}>
                        {certifications.map((cert) => (
                            <View key={cert.id} style={{ ...styles.entry, flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.entryCompany}>{cert.name}</Text>
                                <Text style={{ ...styles.entryDate }}>
                                    {cert.issuer} · {formatDate(cert.date)}
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
// Add new templates here — the store's ThemeConfig.template
// drives which component is rendered.
// ─────────────────────────────────────────────────────────────

import type { ResumeTemplate } from "@/store/useResumeStore";
import { CreativeTemplate } from "./CreativeTemplate";

type TemplateComponent = (props: ProfessionalTemplateProps) => React.ReactElement;

export const TEMPLATE_REGISTRY: Record<ResumeTemplate, TemplateComponent> = {
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    // academic:     AcademicTemplate,   // serif, wider margins — add when built
    academic: ProfessionalTemplate,
};

export function getTemplate(template: ResumeTemplate): TemplateComponent {
    return TEMPLATE_REGISTRY[template] ?? ProfessionalTemplate;
}
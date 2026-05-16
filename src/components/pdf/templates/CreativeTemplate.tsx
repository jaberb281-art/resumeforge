// =============================================================
// ResumeForge — PDF Template: "Creative"
// src/components/pdf/templates/CreativeTemplate.tsx
//
// Two-column sidebar layout.
// Left (dark sidebar ~180pt): name, contact, skills, education, certs.
// Right (main column): summary, experience, projects.
// =============================================================

import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Link,
} from "@react-pdf/renderer";
import type { ResumeData, ThemeConfig } from "@/store/useResumeStore";

// Fonts registered by ProfessionalTemplate at module load — no re-registration needed.

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "Present";
    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

function safeUrl(url?: string | null): string {
    return (url && url.trim()) ? url.trim() : "#";
}

// ─────────────────────────────────────────────────────────────
// STYLE FACTORY
// FIX: All gap usages replaced with marginRight/marginBottom.
// FIX: All fractional lineHeights converted to absolute pt values.
// FIX: wrap={false} removed from section wrappers.
// ─────────────────────────────────────────────────────────────

function makeStyles(theme: ThemeConfig) {
    const { colors, typography } = theme;
    const { sectionGap, entryGap } = theme.spacing;
    const fs = typography.baseFontSize;

    const sidebarBg = colors.accent ?? "#1E3A5F";
    const sidebarText = colors.primary;
    const sidebarMute = colors.secondary;
    const SIDEBAR_W = 180;
    const PAGE_H = 792;

    return StyleSheet.create({
        page: {
            fontFamily: typography.bodyFont,
            fontSize: fs,
            lineHeight: fs * typography.lineHeight, // absolute pt
            backgroundColor: colors.background,
            flexDirection: "row",
            width: 612,
            minHeight: PAGE_H,
        },
        sidebar: {
            width: SIDEBAR_W,
            minHeight: PAGE_H,
            backgroundColor: sidebarBg,
            paddingHorizontal: 20,
            paddingTop: 36,
            paddingBottom: 36,
            flexShrink: 0,
        },
        sidebarName: {
            fontFamily: typography.headingFont,
            fontSize: fs + 10,
            fontWeight: 700,
            color: sidebarText,
            lineHeight: (fs + 10) * 1.2, // absolute
            marginBottom: 4,
        },
        sidebarSectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: fs - 0.5,
            fontWeight: 700,
            color: sidebarText,
            textTransform: "uppercase",
            letterSpacing: 1.4,
            marginBottom: 6,
            marginTop: sectionGap,
            lineHeight: (fs - 0.5) * 1.3,
        },
        sidebarDivider: {
            borderBottomWidth: 0.5,
            borderBottomColor: sidebarMute,
            borderBottomStyle: "solid",
            marginBottom: 8,
            opacity: 0.4,
        },
        sidebarContactItem: {
            fontSize: fs - 1,
            color: sidebarMute,
            marginBottom: 5,
            lineHeight: (fs - 1) * 1.4, // absolute
        },
        sidebarLink: {
            color: sidebarText,
            textDecoration: "none",
            fontSize: fs - 1,
            marginBottom: 5,
            lineHeight: (fs - 1) * 1.4, // absolute
        },
        sidebarSkillCategory: {
            fontFamily: typography.headingFont,
            fontSize: fs - 1,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 2,
            marginTop: 7,
        },
        sidebarSkillItems: {
            fontSize: fs - 1,
            color: sidebarMute,
            lineHeight: (fs - 1) * 1.5, // absolute
        },
        sidebarEduEntry: { marginBottom: entryGap - 2 },
        sidebarEduDegree: {
            fontSize: fs - 0.5,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 1,
            lineHeight: (fs - 0.5) * 1.3,
        },
        sidebarEduInstitution: {
            fontSize: fs - 1,
            color: sidebarMute,
            lineHeight: (fs - 1) * 1.4, // absolute
        },
        sidebarEduDate: {
            fontSize: fs - 1.5,
            color: sidebarMute,
            fontStyle: "italic",
            marginTop: 1,
        },
        sidebarCertName: {
            fontSize: fs - 1,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 1,
        },
        sidebarCertMeta: {
            fontSize: fs - 1.5,
            color: sidebarMute,
            lineHeight: (fs - 1.5) * 1.4, // absolute
        },
        main: {
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 36,
            paddingBottom: 36,
            color: colors.text,
        },
        section: { marginBottom: sectionGap },
        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: fs + 2,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 3,
            lineHeight: (fs + 2) * 1.3,
        },
        sectionUnderline: {
            borderBottomWidth: 2,
            borderBottomColor: sidebarBg,
            borderBottomStyle: "solid",
            marginBottom: 8,
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
            color: colors.text,
            flex: 1,
            lineHeight: (fs + 0.5) * 1.3,
        },
        entryDate: {
            fontSize: fs - 1,
            color: sidebarBg,
            fontStyle: "italic",
        },
        entryCompany: {
            fontSize: fs,
            fontWeight: 600,
            color: sidebarBg,
            marginBottom: 4,
        },
        bulletRow: { flexDirection: "row", marginBottom: 2 },
        bulletDot: { width: 10, marginTop: 1, color: sidebarBg, fontSize: fs - 1 },
        bulletText: {
            flex: 1,
            fontSize: fs - 0.5,
            lineHeight: (fs - 0.5) * 1.4, // absolute
            color: colors.text,
        },
        // NO gap — marginRight + marginBottom on each tag
        tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
        tag: {
            fontSize: fs - 1.5,
            color: sidebarBg,
            borderWidth: 0.5,
            borderColor: sidebarBg,
            borderRadius: 3,
            paddingHorizontal: 5,
            paddingVertical: 1.5,
            marginRight: 4,
            marginBottom: 2,
        },
        projectName: {
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: fs,
            color: colors.text,
            lineHeight: fs * 1.3,
        },
        projectLink: {
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: fs,
            color: colors.text,
            textDecoration: "none",
            lineHeight: fs * 1.3,
        },
        projectSourceLink: {
            fontSize: fs - 0.5,
            color: sidebarBg,
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
            color: sidebarBg,
            fontStyle: "italic",
        },
    });
}

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    if (!text?.trim()) return null;
    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>▸</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

// REMOVED wrap={false} — causes whole sections to be pushed to new pages
function MainSection({
    title,
    styles,
    children,
}: {
    title: string;
    styles: ReturnType<typeof makeStyles>;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeading}>{title}</Text>
            <View style={styles.sectionUnderline} />
            {children}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────

interface CreativeTemplateProps {
    data: ResumeData;
    theme: ThemeConfig;
}

export function CreativeTemplate({ data, theme }: CreativeTemplateProps) {
    const styles = makeStyles(theme);

    // Defensive defaults — all arrays fall back to [] so .map() never throws
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

                {/* ═══ LEFT SIDEBAR ═══════════════════════════ */}
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarName}>{contact.name || "Your Name"}</Text>

                    {/* Contact */}
                    <Text style={styles.sidebarSectionHeading}>Contact</Text>
                    <View style={styles.sidebarDivider} />

                    {!!contact.email?.trim() && (
                        <Link src={`mailto:${contact.email.trim()}`} style={styles.sidebarLink}>
                            {contact.email.trim()}
                        </Link>
                    )}
                    {!!contact.phone?.trim() && (
                        <Text style={styles.sidebarContactItem}>{contact.phone.trim()}</Text>
                    )}
                    {!!contact.location?.trim() && (
                        <Text style={styles.sidebarContactItem}>{contact.location.trim()}</Text>
                    )}
                    {!!contact.linkedin?.trim() && (
                        <Link src={safeUrl(contact.linkedin)} style={styles.sidebarLink}>
                            LinkedIn
                        </Link>
                    )}
                    {!!contact.github?.trim() && (
                        <Link src={safeUrl(contact.github)} style={styles.sidebarLink}>
                            GitHub
                        </Link>
                    )}
                    {!!contact.website?.trim() && (
                        <Link src={safeUrl(contact.website)} style={styles.sidebarLink}>
                            {contact.website.trim().replace(/^https?:\/\//, "")}
                        </Link>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <View>
                            <Text style={styles.sidebarSectionHeading}>Skills</Text>
                            <View style={styles.sidebarDivider} />
                            {skills.map((group) => (
                                <View key={group.category}>
                                    <Text style={styles.sidebarSkillCategory}>{group.category}</Text>
                                    <Text style={styles.sidebarSkillItems}>
                                        {(group.items ?? []).join(" · ")}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <View>
                            <Text style={styles.sidebarSectionHeading}>Education</Text>
                            <View style={styles.sidebarDivider} />
                            {education.map((edu) => (
                                <View key={edu.id} style={styles.sidebarEduEntry}>
                                    <Text style={styles.sidebarEduDegree}>
                                        {edu.degree || ""}{edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    <Text style={styles.sidebarEduInstitution}>{edu.institution || ""}</Text>
                                    {!!edu.location?.trim() && (
                                        <Text style={styles.sidebarEduInstitution}>{edu.location}</Text>
                                    )}
                                    <Text style={styles.sidebarEduDate}>
                                        {formatDate(edu.graduationDate)}{edu.gpa ? `  ·  GPA ${edu.gpa}` : ""}
                                    </Text>
                                    {!!edu.honors?.trim() && (
                                        <Text style={styles.sidebarEduDate}>{edu.honors}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <View>
                            <Text style={styles.sidebarSectionHeading}>Certifications</Text>
                            <View style={styles.sidebarDivider} />
                            {certifications.map((cert) => (
                                <View key={cert.id} style={styles.sidebarEduEntry}>
                                    <Text style={styles.sidebarCertName}>{cert.name || ""}</Text>
                                    <Text style={styles.sidebarCertMeta}>{cert.issuer || ""}</Text>
                                    <Text style={styles.sidebarCertMeta}>{formatDate(cert.date)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* ═══ RIGHT MAIN COLUMN ══════════════════════ */}
                <View style={styles.main}>

                    {/* Summary */}
                    {!!summary?.trim() && (
                        <MainSection title="Profile" styles={styles}>
                            <Text style={styles.summary}>{summary}</Text>
                        </MainSection>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <MainSection title="Experience" styles={styles}>
                            {experience.map((exp) => (
                                <View key={exp.id} style={styles.entry}>
                                    <View style={styles.entryHeader}>
                                        <Text style={styles.entryTitle}>{exp.role || ""}</Text>
                                        <Text style={styles.entryDate}>
                                            {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                        </Text>
                                    </View>
                                    <Text style={styles.entryCompany}>
                                        {exp.company || ""}{exp.location?.trim() ? `  ·  ${exp.location.trim()}` : ""}
                                    </Text>
                                    {(exp.bullets ?? []).map((b, i) => (
                                        <Bullet key={i} text={b} styles={styles} />
                                    ))}
                                    {(exp.technologies ?? []).length > 0 && (
                                        <View style={styles.tagRow}>
                                            {(exp.technologies ?? []).map((t) => (
                                                <Text key={t} style={styles.tag}>{t}</Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </MainSection>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <MainSection title="Projects" styles={styles}>
                            {projects.map((proj) => (
                                <View key={proj.id} style={styles.entry}>
                                    <View style={styles.entryHeader}>
                                        {/*
                                         * FIX: Link must NOT be nested inside <Text>.
                                         * Use Link standalone or fall back to Text.
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
                        </MainSection>
                    )}
                </View>

            </Page>
        </Document>
    );
}
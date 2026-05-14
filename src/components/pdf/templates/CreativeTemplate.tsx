// =============================================================
// ResumeForge — PDF Template: "Creative"
// src/components/pdf/templates/CreativeTemplate.tsx
//
// Two-column sidebar layout.
// Left column (dark, ~35%): name, contact, skills, education,
//   certifications — anything compact.
// Right column (light, ~65%): summary, experience, projects.
//
// Uses the same shared font registrations as ProfessionalTemplate
// (fonts are registered once globally by @react-pdf/renderer).
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

// ─────────────────────────────────────────────────────────────
// STYLE FACTORY
// ─────────────────────────────────────────────────────────────

function makeStyles(theme: ThemeConfig) {
    const { colors, typography } = theme;
    const { sectionGap, entryGap } = theme.spacing;

    // Sidebar colour — fall back to a deep navy if accent not set
    const sidebarBg = colors.accent ?? "#1E3A5F";
    const sidebarText = colors.primary;          // white in the default preset
    const sidebarMute = colors.secondary;        // light slate

    // Sidebar is 35 % of the LETTER page (612pt wide)
    const SIDEBAR_W = 180;   // ≈ 29.4% — gives comfortable reading on both cols
    const PAGE_H = 792;   // LETTER height in pt

    return StyleSheet.create({
        // ── Page: no outer padding — sidebar bleeds to edges ──
        page: {
            fontFamily: typography.bodyFont,
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            backgroundColor: colors.background,
            flexDirection: "row",
            width: 612,
            minHeight: PAGE_H,
        },

        // ── Sidebar (left column) ──────────────────────────────
        sidebar: {
            width: SIDEBAR_W,
            minHeight: PAGE_H,
            backgroundColor: sidebarBg,
            paddingHorizontal: 20,
            paddingTop: 36,
            paddingBottom: 36,
            flexShrink: 0,
        },

        // Name block at top of sidebar
        sidebarName: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 10,
            fontWeight: 700,
            color: sidebarText,
            lineHeight: 1.2,
            marginBottom: 4,
        },
        // Sidebar section heading
        sidebarSectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize - 0.5,
            fontWeight: 700,
            color: sidebarText,
            textTransform: "uppercase",
            letterSpacing: 1.4,
            marginBottom: 6,
            marginTop: sectionGap,
        },
        sidebarDivider: {
            borderBottomWidth: 0.5,
            borderBottomColor: sidebarMute,
            borderBottomStyle: "solid",
            marginBottom: 8,
            opacity: 0.4,
        },

        // Contact items in sidebar
        sidebarContactItem: {
            fontSize: typography.baseFontSize - 1,
            color: sidebarMute,
            marginBottom: 5,
            lineHeight: 1.4,
        },
        sidebarLink: {
            color: sidebarText,
            textDecoration: "none",
            fontSize: typography.baseFontSize - 1,
        },

        // Skill items in sidebar
        sidebarSkillCategory: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize - 1,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 2,
            marginTop: 7,
        },
        sidebarSkillItems: {
            fontSize: typography.baseFontSize - 1,
            color: sidebarMute,
            lineHeight: 1.5,
        },

        // Education in sidebar
        sidebarEduDegree: {
            fontSize: typography.baseFontSize - 0.5,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 1,
        },
        sidebarEduInstitution: {
            fontSize: typography.baseFontSize - 1,
            color: sidebarMute,
            lineHeight: 1.4,
        },
        sidebarEduDate: {
            fontSize: typography.baseFontSize - 1.5,
            color: sidebarMute,
            fontStyle: "italic",
            marginTop: 1,
        },
        sidebarEduEntry: {
            marginBottom: entryGap - 2,
        },

        // Cert in sidebar
        sidebarCertName: {
            fontSize: typography.baseFontSize - 1,
            fontWeight: 700,
            color: sidebarText,
            marginBottom: 1,
        },
        sidebarCertMeta: {
            fontSize: typography.baseFontSize - 1.5,
            color: sidebarMute,
            lineHeight: 1.4,
        },

        // ── Main column (right) ────────────────────────────────
        main: {
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 36,
            paddingBottom: 36,
            color: colors.text,
        },

        // Main section
        section: {
            marginBottom: sectionGap,
        },
        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 2,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 3,
        },
        sectionUnderline: {
            borderBottomWidth: 2,
            borderBottomColor: sidebarBg,
            borderBottomStyle: "solid",
            marginBottom: 8,
        },

        // Summary
        summary: {
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            color: colors.text,
        },

        // Experience entry
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
            color: colors.text,
            flex: 1,
        },
        entryDate: {
            fontSize: typography.baseFontSize - 1,
            color: sidebarBg,
            fontStyle: "italic",
        },
        entryCompany: {
            fontSize: typography.baseFontSize,
            fontWeight: 600,
            color: sidebarBg,
            marginBottom: 4,
        },
        entryLocation: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.secondary,
            fontStyle: "italic",
        },

        // Bullets
        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },
        bulletDot: {
            width: 10,
            marginTop: 1.5,
            color: sidebarBg,
            fontSize: typography.baseFontSize - 1,
        },
        bulletText: {
            flex: 1,
            fontSize: typography.baseFontSize - 0.5,
            lineHeight: typography.lineHeight,
            color: colors.text,
        },

        // Tech tags
        tagRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 3,
        },
        tag: {
            fontSize: typography.baseFontSize - 1.5,
            color: sidebarBg,
            borderWidth: 0.5,
            borderColor: sidebarBg,
            borderRadius: 3,
            paddingHorizontal: 5,
            paddingVertical: 1.5,
        },

        // Project
        projectName: {
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize,
            color: colors.text,
        },
        projectDescription: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: typography.lineHeight,
            marginBottom: 2,
        },
        projectTech: {
            fontSize: typography.baseFontSize - 1,
            color: sidebarBg,
            fontStyle: "italic",
        },
    });
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Present";
    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>▸</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

// Section heading with a thick bottom border in the sidebar colour
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
        <View style={styles.section} wrap={false}>
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
    const { contact, summary, experience, education, projects, skills, certifications } = data;

    return (
        <Document
            title={contact.name}
            author={contact.name}
            keywords={skills.flatMap((g) => g.items).join(", ")}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>

                {/* ═══════════════════════════════════════════════
                    LEFT SIDEBAR
                ═══════════════════════════════════════════════ */}
                <View style={styles.sidebar}>

                    {/* Name */}
                    <Text style={styles.sidebarName}>{contact.name || "Your Name"}</Text>

                    {/* Contact */}
                    <Text style={styles.sidebarSectionHeading}>Contact</Text>
                    <View style={styles.sidebarDivider} />

                    {contact.email && (
                        <Link src={`mailto:${contact.email}`}>
                            <Text style={styles.sidebarLink}>{contact.email}</Text>
                        </Link>
                    )}
                    {contact.phone && (
                        <Text style={styles.sidebarContactItem}>{contact.phone}</Text>
                    )}
                    {contact.location && (
                        <Text style={styles.sidebarContactItem}>{contact.location}</Text>
                    )}
                    {contact.linkedin && (
                        <Link src={contact.linkedin}>
                            <Text style={styles.sidebarLink}>LinkedIn</Text>
                        </Link>
                    )}
                    {contact.github && (
                        <Link src={contact.github}>
                            <Text style={styles.sidebarLink}>GitHub</Text>
                        </Link>
                    )}
                    {contact.website && (
                        <Link src={contact.website}>
                            <Text style={styles.sidebarLink}>
                                {contact.website.replace(/^https?:\/\//, "")}
                            </Text>
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
                                        {group.items.join(" · ")}
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
                                        {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    <Text style={styles.sidebarEduInstitution}>{edu.institution}</Text>
                                    {edu.location && (
                                        <Text style={styles.sidebarEduInstitution}>{edu.location}</Text>
                                    )}
                                    <Text style={styles.sidebarEduDate}>
                                        {formatDate(edu.graduationDate)}
                                        {edu.gpa ? `  ·  GPA ${edu.gpa}` : ""}
                                    </Text>
                                    {edu.honors && (
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
                                    <Text style={styles.sidebarCertName}>{cert.name}</Text>
                                    <Text style={styles.sidebarCertMeta}>
                                        {cert.issuer}
                                    </Text>
                                    <Text style={styles.sidebarCertMeta}>
                                        {formatDate(cert.date)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* ═══════════════════════════════════════════════
                    RIGHT MAIN COLUMN
                ═══════════════════════════════════════════════ */}
                <View style={styles.main}>

                    {/* Summary */}
                    {summary && (
                        <MainSection title="Profile" styles={styles}>
                            <Text style={styles.summary}>{summary}</Text>
                        </MainSection>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <MainSection title="Experience" styles={styles}>
                            {experience.map((exp) => (
                                <View key={exp.id} style={styles.entry} wrap={false}>
                                    <View style={styles.entryHeader}>
                                        <Text style={styles.entryTitle}>{exp.role}</Text>
                                        <Text style={styles.entryDate}>
                                            {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                        </Text>
                                    </View>
                                    <Text style={styles.entryCompany}>
                                        {exp.company}{exp.location ? `  ·  ${exp.location}` : ""}
                                    </Text>
                                    {exp.bullets.map((b, i) => (
                                        <Bullet key={i} text={b} styles={styles} />
                                    ))}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <View style={styles.tagRow}>
                                            {exp.technologies.map((t) => (
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
                                <View key={proj.id} style={styles.entry} wrap={false}>
                                    <View style={styles.entryHeader}>
                                        <Text style={styles.projectName}>
                                            {proj.url
                                                ? <Link src={proj.url}>{proj.name}</Link>
                                                : proj.name}
                                        </Text>
                                        {proj.repoUrl && (
                                            <Link src={proj.repoUrl}>
                                                <Text style={styles.entryDate}>Source</Text>
                                            </Link>
                                        )}
                                    </View>
                                    <Text style={styles.projectDescription}>{proj.description}</Text>
                                    {proj.highlights.map((h, i) => (
                                        <Bullet key={i} text={h} styles={styles} />
                                    ))}
                                    {proj.technologies.length > 0 && (
                                        <Text style={styles.projectTech}>
                                            {proj.technologies.join(" · ")}
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
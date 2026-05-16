// =============================================================
// ResumeForge — PDF Template Registry + Professional Template
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
import type {
    ResumeData,
    ThemeConfig,
    ResumeTemplate,
} from "@/store/useResumeStore";
import { CreativeTemplate } from "./CreativeTemplate";
import { AcademicTemplate } from "./AcademicTemplate";


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

Font.registerHyphenationCallback((word) => [word]);

interface ProfessionalTemplateProps {
    data: ResumeData;
    theme: ThemeConfig;
}

function safeArray<T>(value: T[] | undefined | null): T[] {
    return Array.isArray(value) ? value : [];
}

function safeText(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Present";

    const [year, month] = dateStr.split("-");
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthIndex = Number.parseInt(month ?? "", 10) - 1;

    if (Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${year}`;
    }

    return year || "";
}

function makeStyles(theme: ThemeConfig) {
    const { colors, typography, spacing } = theme;

    const base = typography.baseFontSize || 10;

    return StyleSheet.create({
        page: {
            fontFamily: typography.bodyFont,
            fontSize: base,
            color: colors.text,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.pagePaddingX || 40,
            paddingVertical: spacing.pagePaddingY || 40,
        },

        header: {
            marginBottom: spacing.sectionGap || 16,
        },

        headerName: {
            fontFamily: typography.headingFont,
            fontSize: base + 14,
            lineHeight: base + 18,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 4,
        },

        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
        },

        contactItem: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.secondary,
            marginRight: 12,
            marginBottom: 4,
        },

        contactLink: {
            color: colors.primary,
            textDecoration: "none",
        },

        section: {
            marginBottom: spacing.sectionGap || 16,
        },

        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: base + 1,
            lineHeight: base + 5,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 1.1,
            marginBottom: 5,
        },

        divider: {
            borderBottomWidth: theme.layout.dividerStyle === "thick" ? 2 : 0.75,
            borderBottomColor: colors.primary,
            borderBottomStyle: "solid",
            marginBottom: 7,
        },

        summary: {
            fontSize: base,
            lineHeight: base + 5,
            color: colors.text,
        },

        entry: {
            marginBottom: spacing.entryGap || 10,
        },

        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 2,
        },

        entryTitle: {
            flex: 1,
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base + 0.5,
            lineHeight: base + 5,
            color: colors.primary,
            marginRight: 10,
        },

        entryDate: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.secondary,
            fontStyle: "italic",
        },

        entrySubtitle: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 4,
        },

        entryCompany: {
            fontSize: base,
            lineHeight: base + 4,
            fontWeight: 600,
            color: colors.secondary,
            marginRight: 6,
        },

        entryLocation: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.secondary,
            fontStyle: "italic",
        },

        bulletList: {
            marginTop: 2,
        },

        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },

        bulletDot: {
            width: 10,
            fontSize: base - 1,
            lineHeight: base + 4,
            color: colors.primary,
        },

        bulletText: {
            flex: 1,
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
        },

        tagRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 4,
        },

        tag: {
            fontSize: base - 1.5,
            lineHeight: base + 3,
            color: colors.primary,
            borderWidth: 0.5,
            borderColor: colors.primary,
            borderRadius: 3,
            paddingHorizontal: 5,
            paddingVertical: 1,
            marginRight: 4,
            marginBottom: 4,
        },

        projectName: {
            flex: 1,
            fontWeight: 700,
            fontSize: base,
            lineHeight: base + 5,
            color: colors.primary,
            marginRight: 10,
        },

        projectDescription: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
            marginBottom: 2,
        },

        projectTech: {
            fontSize: base - 1,
            lineHeight: base + 4,
            color: colors.secondary,
            fontStyle: "italic",
            marginTop: 2,
        },

        skillsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
        },

        skillGroup: {
            width: "48%",
            marginRight: 8,
            marginBottom: 6,
        },

        skillCategory: {
            fontWeight: 700,
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 0.7,
            marginBottom: 2,
        },

        skillItems: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
        },

        eduDegree: {
            flex: 1,
            fontWeight: 700,
            fontSize: base + 0.5,
            lineHeight: base + 5,
            color: colors.primary,
            marginRight: 10,
        },

        eduInstitution: {
            fontSize: base,
            lineHeight: base + 4,
            color: colors.secondary,
        },

        certRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
        },

        certName: {
            flex: 1,
            fontSize: base,
            lineHeight: base + 4,
            fontWeight: 600,
            color: colors.secondary,
            marginRight: 10,
        },

        certMeta: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.secondary,
            fontStyle: "italic",
        },
    });
}

function Section({
    title,
    styles,
    theme,
    children,
}: {
    title: string;
    styles: ReturnType<typeof makeStyles>;
    theme: ThemeConfig;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeading}>{title}</Text>
            {theme.layout.dividerStyle !== "none" && <View style={styles.divider} />}
            {children}
        </View>
    );
}

function Bullet({
    text,
    styles,
}: {
    text: string;
    styles: ReturnType<typeof makeStyles>;
}) {
    const clean = safeText(text).trim();
    if (!clean) return null;

    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>-</Text>
            <Text style={styles.bulletText}>{clean}</Text>
        </View>
    );
}

export function ProfessionalTemplate({ data, theme }: ProfessionalTemplateProps) {
    const styles = makeStyles(theme);

    const contact = data.contact ?? {
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
    };

    const summary = safeText(data.summary);
    const experience = safeArray(data.experience);
    const education = safeArray(data.education);
    const projects = safeArray(data.projects);
    const skills = safeArray(data.skills);
    const certifications = safeArray(data.certifications);

    const keywords = skills
        .flatMap((group) => safeArray(group.items))
        .filter(Boolean)
        .join(", ");

    return (
        <Document
            title={contact.name || "Resume"}
            author={contact.name || "ResumeForge"}
            keywords={keywords}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>
                <View style={styles.header} wrap={false}>
                    <Text style={styles.headerName}>{contact.name || "Your Name"}</Text>

                    <View style={styles.contactRow}>
                        {contact.email && (
                            <Link
                                src={`mailto:${contact.email}`}
                                style={[styles.contactItem, styles.contactLink]}
                            >
                                {contact.email}
                            </Link>
                        )}

                        {contact.phone && (
                            <Text style={styles.contactItem}>{contact.phone}</Text>
                        )}

                        {contact.location && (
                            <Text style={styles.contactItem}>{contact.location}</Text>
                        )}

                        {contact.linkedin && (
                            <Link
                                src={contact.linkedin}
                                style={[styles.contactItem, styles.contactLink]}
                            >
                                LinkedIn
                            </Link>
                        )}

                        {contact.github && (
                            <Link
                                src={contact.github}
                                style={[styles.contactItem, styles.contactLink]}
                            >
                                GitHub
                            </Link>
                        )}

                        {contact.website && (
                            <Link
                                src={contact.website}
                                style={[styles.contactItem, styles.contactLink]}
                            >
                                {contact.website.replace(/^https?:\/\//, "")}
                            </Link>
                        )}
                    </View>
                </View>

                {summary && (
                    <Section title="Summary" styles={styles} theme={theme}>
                        <Text style={styles.summary}>{summary}</Text>
                    </Section>
                )}

                {experience.length > 0 && (
                    <Section title="Experience" styles={styles} theme={theme}>
                        {experience.map((exp, index) => {
                            const bullets = safeArray(exp.bullets);
                            const technologies = safeArray(exp.technologies);

                            return (
                                <View key={exp.id || `experience-${index}`} style={styles.entry}>
                                    <View style={styles.entryHeader}>
                                        <Text style={styles.entryTitle}>{exp.role || "Role"}</Text>
                                        <Text style={styles.entryDate}>
                                            {formatDate(exp.startDate)} -{" "}
                                            {exp.current ? "Present" : formatDate(exp.endDate)}
                                        </Text>
                                    </View>

                                    <View style={styles.entrySubtitle}>
                                        <Text style={styles.entryCompany}>
                                            {exp.company || "Organization"}
                                        </Text>

                                        {exp.location && (
                                            <Text style={styles.entryLocation}>{exp.location}</Text>
                                        )}
                                    </View>

                                    {bullets.length > 0 && (
                                        <View style={styles.bulletList}>
                                            {bullets.map((bullet, bulletIndex) => (
                                                <Bullet
                                                    key={bulletIndex}
                                                    text={bullet}
                                                    styles={styles}
                                                />
                                            ))}
                                        </View>
                                    )}

                                    {technologies.length > 0 && (
                                        <View style={styles.tagRow}>
                                            {technologies.map((tech, techIndex) => (
                                                <Text key={`${tech}-${techIndex}`} style={styles.tag}>
                                                    {tech}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </Section>
                )}

                {projects.length > 0 && (
                    <Section title="Projects" styles={styles} theme={theme}>
                        {projects.map((project, index) => {
                            const highlights = safeArray(project.highlights);
                            const technologies = safeArray(project.technologies);

                            return (
                                <View key={project.id || `project-${index}`} style={styles.entry}>
                                    <View style={styles.entryHeader}>
                                        {project.url ? (
                                            <Link src={project.url} style={styles.projectName}>
                                                {project.name || "Project"}
                                            </Link>
                                        ) : (
                                            <Text style={styles.projectName}>
                                                {project.name || "Project"}
                                            </Text>
                                        )}

                                        {project.repoUrl && (
                                            <Link
                                                src={project.repoUrl}
                                                style={[styles.entryDate, styles.contactLink]}
                                            >
                                                Source
                                            </Link>
                                        )}
                                    </View>

                                    {project.description && (
                                        <Text style={styles.projectDescription}>
                                            {project.description}
                                        </Text>
                                    )}

                                    {highlights.map((highlight, highlightIndex) => (
                                        <Bullet
                                            key={highlightIndex}
                                            text={highlight}
                                            styles={styles}
                                        />
                                    ))}

                                    {technologies.length > 0 && (
                                        <Text style={styles.projectTech}>
                                            {technologies.join(" · ")}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </Section>
                )}

                {skills.length > 0 && (
                    <Section title="Skills" styles={styles} theme={theme}>
                        <View style={styles.skillsGrid}>
                            {skills.map((group, index) => (
                                <View
                                    key={group.category || `skill-${index}`}
                                    style={styles.skillGroup}
                                >
                                    <Text style={styles.skillCategory}>
                                        {group.category || "Skills"}
                                    </Text>
                                    <Text style={styles.skillItems}>
                                        {safeArray(group.items).join(", ")}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Section>
                )}

                {education.length > 0 && (
                    <Section title="Education" styles={styles} theme={theme}>
                        {education.map((edu, index) => (
                            <View key={edu.id || `education-${index}`} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.eduDegree}>
                                        {edu.degree || "Degree"}
                                        {edu.field ? `, ${edu.field}` : ""}
                                    </Text>

                                    <Text style={styles.entryDate}>
                                        {formatDate(edu.graduationDate)}
                                    </Text>
                                </View>

                                <Text style={styles.eduInstitution}>
                                    {edu.institution || "Institution"}
                                    {edu.location ? ` · ${edu.location}` : ""}
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

                {certifications.length > 0 && (
                    <Section title="Certifications" styles={styles} theme={theme}>
                        {certifications.map((cert, index) => (
                            <View key={cert.id || `cert-${index}`} style={styles.certRow}>
                                <Text style={styles.certName}>{cert.name || "Certification"}</Text>
                                <Text style={styles.certMeta}>
                                    {[cert.issuer, formatDate(cert.date)].filter(Boolean).join(" · ")}
                                </Text>
                            </View>
                        ))}
                    </Section>
                )}
            </Page>
        </Document>
    );
}

type TemplateComponent = (
    props: ProfessionalTemplateProps
) => React.ReactElement;

export const TEMPLATE_REGISTRY: Record<ResumeTemplate, TemplateComponent> = {
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    academic: AcademicTemplate,
};

export function getTemplate(template: ResumeTemplate): TemplateComponent {
    return TEMPLATE_REGISTRY[template] ?? ProfessionalTemplate;
}

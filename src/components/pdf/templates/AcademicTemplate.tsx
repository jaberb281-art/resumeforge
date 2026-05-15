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

interface AcademicTemplateProps {
    data: ResumeData;
    theme: ThemeConfig;
}

function arrayOrEmpty<T>(items: T[] | undefined): T[] {
    return Array.isArray(items) ? items : [];
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Present";

    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = Number.parseInt(month ?? "", 10) - 1;

    return Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < months.length
        ? `${months[monthIndex]} ${year}`
        : year;
}

function makeStyles(theme: ThemeConfig) {
    const { colors, typography, spacing } = theme;

    return StyleSheet.create({
        page: {
            fontFamily: typography.bodyFont,
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            color: colors.text,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.pagePaddingX,
            paddingVertical: spacing.pagePaddingY,
        },
        header: {
            marginBottom: 16,
            paddingBottom: 10,
            borderBottomWidth: 1.5,
            borderBottomColor: colors.primary,
            borderBottomStyle: "solid",
        },
        name: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 15,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 5,
        },
        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 9,
        },
        contactText: {
            fontSize: typography.baseFontSize - 1,
            color: colors.secondary,
        },
        contactLink: {
            fontSize: typography.baseFontSize - 1,
            color: colors.primary,
            textDecoration: "none",
        },
        section: {
            marginBottom: spacing.sectionGap,
        },
        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 2,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 5,
        },
        sectionRule: {
            borderBottomWidth: 0.75,
            borderBottomColor: colors.secondary,
            borderBottomStyle: "solid",
            marginBottom: 8,
        },
        paragraph: {
            fontSize: typography.baseFontSize,
            color: colors.text,
            lineHeight: typography.lineHeight,
        },
        entry: {
            marginBottom: spacing.entryGap,
        },
        entryHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 2,
        },
        entryTitle: {
            flex: 1,
            fontFamily: typography.headingFont,
            fontSize: typography.baseFontSize + 0.5,
            fontWeight: 700,
            color: colors.primary,
        },
        entryDate: {
            fontSize: typography.baseFontSize - 1,
            color: colors.secondary,
            fontStyle: "italic",
        },
        entryMeta: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.secondary,
            marginBottom: 4,
        },
        detail: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: typography.lineHeight,
            marginBottom: 2,
        },
        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },
        bulletMarker: {
            width: 10,
            fontSize: typography.baseFontSize - 1,
            color: colors.primary,
        },
        bulletText: {
            flex: 1,
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: typography.lineHeight,
        },
        skillsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        skillGroup: {
            width: "48%",
            marginBottom: 4,
        },
        skillCategory: {
            fontSize: typography.baseFontSize - 0.5,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 1,
        },
        skillItems: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: 1.4,
        },
        compactList: {
            fontSize: typography.baseFontSize - 0.5,
            color: colors.text,
            lineHeight: 1.4,
        },
    });
}

function Section({
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
            <View style={styles.sectionRule} />
            {children}
        </View>
    );
}

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    if (!text) return null;

    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletMarker}>-</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

export function AcademicTemplate({ data, theme }: AcademicTemplateProps) {
    const styles = makeStyles(theme);
    const contact = data.contact ?? { name: "" };
    const experience = arrayOrEmpty(data.experience);
    const education = arrayOrEmpty(data.education);
    const projects = arrayOrEmpty(data.projects);
    const skills = arrayOrEmpty(data.skills);
    const certifications = arrayOrEmpty(data.certifications);
    const languages = arrayOrEmpty(data.languages);
    const volunteer = arrayOrEmpty(data.volunteer);
    const keywords = skills.flatMap((group) => arrayOrEmpty(group.items)).join(", ");

    return (
        <Document
            title={contact.name || "Academic CV"}
            author={contact.name || "ResumeForge"}
            keywords={keywords}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{contact.name || "Your Name"}</Text>
                    <View style={styles.contactRow}>
                        {contact.email && (
                            <Link src={`mailto:${contact.email}`} style={styles.contactLink}>
                                <Text>{contact.email}</Text>
                            </Link>
                        )}
                        {contact.phone && <Text style={styles.contactText}>{contact.phone}</Text>}
                        {contact.location && <Text style={styles.contactText}>{contact.location}</Text>}
                        {contact.linkedin && (
                            <Link src={contact.linkedin} style={styles.contactLink}>
                                <Text>LinkedIn</Text>
                            </Link>
                        )}
                        {contact.github && (
                            <Link src={contact.github} style={styles.contactLink}>
                                <Text>GitHub</Text>
                            </Link>
                        )}
                        {contact.website && (
                            <Link src={contact.website} style={styles.contactLink}>
                                <Text>{contact.website.replace(/^https?:\/\//, "")}</Text>
                            </Link>
                        )}
                    </View>
                </View>

                {data.summary && (
                    <Section title="Research Profile" styles={styles}>
                        <Text style={styles.paragraph}>{data.summary}</Text>
                    </Section>
                )}

                {education.length > 0 && (
                    <Section title="Education" styles={styles}>
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    <Text style={styles.entryDate}>{formatDate(edu.graduationDate)}</Text>
                                </View>
                                <Text style={styles.entryMeta}>
                                    {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                                </Text>
                                {edu.gpa && <Text style={styles.detail}>GPA: {edu.gpa}</Text>}
                                {edu.honors && <Text style={styles.detail}>{edu.honors}</Text>}
                                {arrayOrEmpty(edu.coursework).length > 0 && (
                                    <Text style={styles.detail}>
                                        Relevant coursework: {arrayOrEmpty(edu.coursework).join(", ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {experience.length > 0 && (
                    <Section title="Appointments and Experience" styles={styles}>
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.role || "Role"}</Text>
                                    <Text style={styles.entryDate}>
                                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                                    </Text>
                                </View>
                                <Text style={styles.entryMeta}>
                                    {exp.company || "Organization"}{exp.location ? `, ${exp.location}` : ""}
                                </Text>
                                {arrayOrEmpty(exp.bullets).map((bullet, index) => (
                                    <Bullet key={index} text={bullet} styles={styles} />
                                ))}
                                {arrayOrEmpty(exp.technologies).length > 0 && (
                                    <Text style={styles.detail}>
                                        Methods and tools: {arrayOrEmpty(exp.technologies).join(", ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {projects.length > 0 && (
                    <Section title="Research and Projects" styles={styles}>
                        {projects.map((project) => (
                            <View key={project.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {project.url ? <Link src={project.url}>{project.name}</Link> : project.name}
                                    </Text>
                                    {project.repoUrl && (
                                        <Link src={project.repoUrl} style={styles.contactLink}>
                                            <Text>Repository</Text>
                                        </Link>
                                    )}
                                </View>
                                {project.description && <Text style={styles.detail}>{project.description}</Text>}
                                {arrayOrEmpty(project.highlights).map((highlight, index) => (
                                    <Bullet key={index} text={highlight} styles={styles} />
                                ))}
                                {arrayOrEmpty(project.technologies).length > 0 && (
                                    <Text style={styles.detail}>
                                        Keywords: {arrayOrEmpty(project.technologies).join(", ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {skills.length > 0 && (
                    <Section title="Methods, Tools, and Skills" styles={styles}>
                        <View style={styles.skillsGrid}>
                            {skills.map((group) => (
                                <View key={group.category} style={styles.skillGroup}>
                                    <Text style={styles.skillCategory}>{group.category}</Text>
                                    <Text style={styles.skillItems}>{arrayOrEmpty(group.items).join(", ")}</Text>
                                </View>
                            ))}
                        </View>
                    </Section>
                )}

                {certifications.length > 0 && (
                    <Section title="Certifications and Training" styles={styles}>
                        {certifications.map((cert) => (
                            <View key={cert.id} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {cert.credentialUrl
                                            ? <Link src={cert.credentialUrl}>{cert.name}</Link>
                                            : cert.name}
                                    </Text>
                                    <Text style={styles.entryDate}>{formatDate(cert.date)}</Text>
                                </View>
                                <Text style={styles.entryMeta}>{cert.issuer}</Text>
                            </View>
                        ))}
                    </Section>
                )}

                {languages.length > 0 && (
                    <Section title="Languages" styles={styles}>
                        <Text style={styles.compactList}>
                            {languages.map((item) => `${item.language} (${item.proficiency})`).join("; ")}
                        </Text>
                    </Section>
                )}

                {volunteer.length > 0 && (
                    <Section title="Service" styles={styles}>
                        {volunteer.map((item) => (
                            <View key={`${item.role}-${item.org}-${item.date}`} style={styles.entry} wrap={false}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{item.role}</Text>
                                    <Text style={styles.entryDate}>{item.date}</Text>
                                </View>
                                <Text style={styles.entryMeta}>{item.org}</Text>
                                {item.summary && <Text style={styles.detail}>{item.summary}</Text>}
                            </View>
                        ))}
                    </Section>
                )}
            </Page>
        </Document>
    );
}

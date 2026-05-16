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

function safeArray<T>(value: T[] | undefined | null): T[] {
    return Array.isArray(value) ? value : [];
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
    const base = typography.baseFontSize || 11;

    return StyleSheet.create({
        page: {
            fontFamily: typography.bodyFont,
            fontSize: base,
            color: colors.text,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.pagePaddingX || 50,
            paddingVertical: spacing.pagePaddingY || 45,
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
            fontSize: base + 15,
            lineHeight: base + 20,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 5,
        },

        contactRow: {
            flexDirection: "row",
            flexWrap: "wrap",
        },

        contactText: {
            fontSize: base - 1,
            lineHeight: base + 4,
            color: colors.secondary,
            marginRight: 9,
            marginBottom: 4,
        },

        contactLink: {
            fontSize: base - 1,
            lineHeight: base + 4,
            color: colors.primary,
            textDecoration: "none",
            marginRight: 9,
            marginBottom: 4,
        },

        section: {
            marginBottom: spacing.sectionGap || 18,
        },

        sectionHeading: {
            fontFamily: typography.headingFont,
            fontSize: base + 2,
            lineHeight: base + 6,
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
            fontSize: base,
            lineHeight: base + 5,
            color: colors.text,
        },

        entry: {
            marginBottom: spacing.entryGap || 12,
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
            fontSize: base + 0.5,
            lineHeight: base + 5,
            fontWeight: 700,
            color: colors.primary,
            marginRight: 12,
        },

        entryDate: {
            fontSize: base - 1,
            lineHeight: base + 4,
            color: colors.secondary,
            fontStyle: "italic",
        },

        entryMeta: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.secondary,
            marginBottom: 4,
        },

        detail: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
            marginBottom: 2,
        },

        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },

        bulletMarker: {
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
            fontSize: base - 0.5,
            lineHeight: base + 4,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 1,
        },

        skillItems: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
        },

        compactList: {
            fontSize: base - 0.5,
            lineHeight: base + 4,
            color: colors.text,
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

function Bullet({
    text,
    styles,
}: {
    text: string;
    styles: ReturnType<typeof makeStyles>;
}) {
    const clean = typeof text === "string" ? text.trim() : "";
    if (!clean) return null;

    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletMarker}>-</Text>
            <Text style={styles.bulletText}>{clean}</Text>
        </View>
    );
}

export function AcademicTemplate({ data, theme }: AcademicTemplateProps) {
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

    const summary = typeof data.summary === "string" ? data.summary : "";
    const experience = safeArray(data.experience);
    const education = safeArray(data.education);
    const projects = safeArray(data.projects);
    const skills = safeArray(data.skills);
    const certifications = safeArray(data.certifications);
    const languages = safeArray(data.languages);
    const volunteer = safeArray(data.volunteer);

    const keywords = skills
        .flatMap((group) => safeArray(group.items))
        .filter(Boolean)
        .join(", ");

    return (
        <Document
            title={contact.name || "Academic CV"}
            author={contact.name || "ResumeForge"}
            keywords={keywords}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>
                <View style={styles.header} wrap={false}>
                    <Text style={styles.name}>{contact.name || "Your Name"}</Text>

                    <View style={styles.contactRow}>
                        {contact.email && (
                            <Link src={`mailto:${contact.email}`} style={styles.contactLink}>
                                {contact.email}
                            </Link>
                        )}

                        {contact.phone && (
                            <Text style={styles.contactText}>{contact.phone}</Text>
                        )}

                        {contact.location && (
                            <Text style={styles.contactText}>{contact.location}</Text>
                        )}

                        {contact.linkedin && (
                            <Link
                                src={contact.linkedin}
                                style={styles.contactLink}
                            >
                                {contact.linkedin.replace(/^https?:\/\//, "")}
                            </Link>
                        )}

                        {contact.github && (
                            <Link
                                src={contact.github}
                                style={styles.contactLink}
                            >
                                {contact.github.replace(/^https?:\/\//, "")}
                            </Link>
                        )}

                        {contact.website && (
                            <Link src={contact.website} style={styles.contactLink}>
                                {contact.website.replace(/^https?:\/\//, "")}
                            </Link>
                        )}
                    </View>
                </View>

                {summary && (
                    <Section title="Research Profile" styles={styles}>
                        <Text style={styles.paragraph}>{summary}</Text>
                    </Section>
                )}

                {education.length > 0 && (
                    <Section title="Education" styles={styles}>
                        {education.map((edu, index) => (
                            <View key={edu.id || `education-${index}`} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {edu.degree || "Degree"}
                                        {edu.field ? `, ${edu.field}` : ""}
                                    </Text>

                                    <Text style={styles.entryDate}>
                                        {formatDate(edu.graduationDate)}
                                    </Text>
                                </View>

                                <Text style={styles.entryMeta}>
                                    {edu.institution || "Institution"}
                                    {edu.location ? `, ${edu.location}` : ""}
                                </Text>

                                {edu.gpa && <Text style={styles.detail}>GPA: {edu.gpa}</Text>}

                                {edu.honors && (
                                    <Text style={styles.detail}>{edu.honors}</Text>
                                )}

                                {safeArray(edu.coursework).length > 0 && (
                                    <Text style={styles.detail}>
                                        Relevant coursework: {safeArray(edu.coursework).join(", ")}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {experience.length > 0 && (
                    <Section title="Appointments and Experience" styles={styles}>
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

                                    <Text style={styles.entryMeta}>
                                        {exp.company || "Organization"}
                                        {exp.location ? `, ${exp.location}` : ""}
                                    </Text>

                                    {bullets.map((bullet, bulletIndex) => (
                                        <Bullet
                                            key={bulletIndex}
                                            text={bullet}
                                            styles={styles}
                                        />
                                    ))}

                                    {technologies.length > 0 && (
                                        <Text style={styles.detail}>
                                            Methods and tools: {technologies.join(", ")}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </Section>
                )}

                {projects.length > 0 && (
                    <Section title="Research and Projects" styles={styles}>
                        {projects.map((project, index) => {
                            const highlights = safeArray(project.highlights);
                            const technologies = safeArray(project.technologies);

                            return (
                                <View key={project.id || `project-${index}`} style={styles.entry}>
                                    <View style={styles.entryHeader}>
                                        {project.url ? (
                                            <Link src={project.url} style={styles.entryTitle}>
                                                {project.name || "Project"}
                                            </Link>
                                        ) : (
                                            <Text style={styles.entryTitle}>
                                                {project.name || "Project"}
                                            </Text>
                                        )}

                                        {project.repoUrl && (
                                            <Link src={project.repoUrl} style={styles.contactLink}>
                                                Repository
                                            </Link>
                                        )}
                                    </View>

                                    {project.description && (
                                        <Text style={styles.detail}>{project.description}</Text>
                                    )}

                                    {highlights.map((highlight, highlightIndex) => (
                                        <Bullet
                                            key={highlightIndex}
                                            text={highlight}
                                            styles={styles}
                                        />
                                    ))}

                                    {technologies.length > 0 && (
                                        <Text style={styles.detail}>
                                            Keywords: {technologies.join(", ")}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </Section>
                )}

                {skills.length > 0 && (
                    <Section title="Methods, Tools, and Skills" styles={styles}>
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

                {certifications.length > 0 && (
                    <Section title="Certifications and Training" styles={styles}>
                        {certifications.map((cert, index) => (
                            <View key={cert.id || `cert-${index}`} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    {cert.credentialUrl ? (
                                        <Link
                                            src={cert.credentialUrl}
                                            style={styles.entryTitle}
                                        >
                                            {cert.name || "Certification"}
                                        </Link>
                                    ) : (
                                        <Text style={styles.entryTitle}>
                                            {cert.name || "Certification"}
                                        </Text>
                                    )}

                                    <Text style={styles.entryDate}>
                                        {formatDate(cert.date)}
                                    </Text>
                                </View>

                                {cert.issuer && (
                                    <Text style={styles.entryMeta}>{cert.issuer}</Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {languages.length > 0 && (
                    <Section title="Languages" styles={styles}>
                        <Text style={styles.compactList}>
                            {languages
                                .map((item) =>
                                    `${item.language || "Language"}${item.proficiency ? ` (${item.proficiency})` : ""
                                    }`
                                )
                                .join("; ")}
                        </Text>
                    </Section>
                )}

                {volunteer.length > 0 && (
                    <Section title="Service" styles={styles}>
                        {volunteer.map((item, index) => (
                            <View
                                key={`${item.role || "role"}-${item.org || "org"}-${index}`}
                                style={styles.entry}
                            >
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>
                                        {item.role || "Volunteer Role"}
                                    </Text>
                                    <Text style={styles.entryDate}>{item.date || ""}</Text>
                                </View>

                                {item.org && <Text style={styles.entryMeta}>{item.org}</Text>}

                                {item.summary && (
                                    <Text style={styles.detail}>{item.summary}</Text>
                                )}
                            </View>
                        ))}
                    </Section>
                )}
            </Page>
        </Document>
    );
}

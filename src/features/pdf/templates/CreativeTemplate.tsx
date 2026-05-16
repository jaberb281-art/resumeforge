import React from "react";
import {
    Document,
    Link,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";
import type { ResumeData, ThemeConfig } from "@/store/useResumeStore";

interface CreativeTemplateProps {
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
    const { colors, typography } = theme;
    const base = typography.baseFontSize || 10;
    const sidebarBg = colors.accent ?? "#1E3A5F";

    return StyleSheet.create({
        page: {
            flexDirection: "row",
            backgroundColor: colors.background,
            color: colors.text,
            fontFamily: typography.bodyFont,
            fontSize: base,
        },

        sidebar: {
            width: 190,
            backgroundColor: sidebarBg,
            paddingTop: 34,
            paddingBottom: 34,
            paddingHorizontal: 18,
        },

        sidebarName: {
            color: "#FFFFFF",
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base + 10,
            lineHeight: base + 15,
            marginBottom: 10,
        },

        sidebarHeading: {
            marginTop: 14,
            marginBottom: 5,
            color: "#FFFFFF",
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base - 0.5,
            lineHeight: base + 4,
            textTransform: "uppercase",
            letterSpacing: 1.1,
        },

        sidebarRule: {
            borderBottomWidth: 0.75,
            borderBottomColor: "#D1D5DB",
            borderBottomStyle: "solid",
            marginBottom: 7,
        },

        sidebarText: {
            color: "#E2E8F0",
            fontSize: base - 1,
            lineHeight: base + 4,
            marginBottom: 4,
        },

        sidebarLink: {
            color: "#FFFFFF",
            fontSize: base - 1,
            lineHeight: base + 4,
            textDecoration: "none",
            marginBottom: 4,
        },

        sidebarBlock: {
            marginBottom: 8,
        },

        skillCategory: {
            color: "#FFFFFF",
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base - 1,
            lineHeight: base + 4,
            marginBottom: 1,
            marginTop: 4,
        },

        skillItems: {
            color: "#E2E8F0",
            fontSize: base - 1,
            lineHeight: base + 4,
            marginBottom: 3,
        },

        main: {
            flex: 1,
            paddingTop: 34,
            paddingBottom: 34,
            paddingHorizontal: 26,
        },

        section: {
            marginBottom: 14,
        },

        mainHeading: {
            color: sidebarBg,
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base + 2,
            lineHeight: base + 6,
            textTransform: "uppercase",
            letterSpacing: 0.9,
            marginBottom: 4,
        },

        mainRule: {
            borderBottomWidth: 1.5,
            borderBottomColor: sidebarBg,
            borderBottomStyle: "solid",
            marginBottom: 8,
        },

        summary: {
            fontSize: base,
            lineHeight: base + 5,
            color: colors.text,
        },

        entry: {
            marginBottom: 10,
        },

        rowBetween: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 2,
        },

        entryTitle: {
            flex: 1,
            color: colors.text,
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: base + 0.5,
            lineHeight: base + 5,
            marginRight: 10,
        },

        entryDate: {
            color: sidebarBg,
            fontSize: base - 1,
            lineHeight: base + 4,
            fontStyle: "italic",
        },

        entryMeta: {
            color: colors.secondary,
            fontSize: base - 0.5,
            lineHeight: base + 4,
            marginBottom: 4,
        },

        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },

        bulletMark: {
            width: 9,
            color: sidebarBg,
            fontSize: base - 1,
            lineHeight: base + 4,
        },

        bulletText: {
            flex: 1,
            color: colors.text,
            fontSize: base - 0.5,
            lineHeight: base + 4,
        },

        techLine: {
            color: sidebarBg,
            fontSize: base - 1,
            lineHeight: base + 4,
            fontStyle: "italic",
            marginTop: 3,
        },
    });
}

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
            <Text style={styles.mainHeading}>{title}</Text>
            <View style={styles.mainRule} />
            {children}
        </View>
    );
}

function SidebarSection({
    title,
    styles,
    children,
}: {
    title: string;
    styles: ReturnType<typeof makeStyles>;
    children: React.ReactNode;
}) {
    return (
        <>
            <Text style={styles.sidebarHeading}>{title}</Text>
            <View style={styles.sidebarRule} />
            {children}
        </>
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
            <Text style={styles.bulletMark}>-</Text>
            <Text style={styles.bulletText}>{clean}</Text>
        </View>
    );
}

export function CreativeTemplate({ data, theme }: CreativeTemplateProps) {
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
    const projects = safeArray(data.projects);
    const skills = safeArray(data.skills);
    const education = safeArray(data.education);
    const certifications = safeArray(data.certifications);
    const languages = safeArray(data.languages);

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
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarName}>{contact.name || "Your Name"}</Text>

                    <SidebarSection title="Contact" styles={styles}>
                        {contact.email && (
                            <Link src={`mailto:${contact.email}`} style={styles.sidebarLink}>
                                {contact.email}
                            </Link>
                        )}

                        {contact.phone && (
                            <Text style={styles.sidebarText}>{contact.phone}</Text>
                        )}

                        {contact.location && (
                            <Text style={styles.sidebarText}>{contact.location}</Text>
                        )}

                        {contact.linkedin && (
                            <Link src={contact.linkedin} style={styles.sidebarLink}>
                                LinkedIn
                            </Link>
                        )}

                        {contact.github && (
                            <Link src={contact.github} style={styles.sidebarLink}>
                                GitHub
                            </Link>
                        )}

                        {contact.website && (
                            <Link src={contact.website} style={styles.sidebarLink}>
                                {contact.website.replace(/^https?:\/\//, "")}
                            </Link>
                        )}
                    </SidebarSection>

                    {skills.length > 0 && (
                        <SidebarSection title="Skills" styles={styles}>
                            {skills.map((group, index) => (
                                <View
                                    key={group.category || `skill-${index}`}
                                    style={styles.sidebarBlock}
                                >
                                    <Text style={styles.skillCategory}>
                                        {group.category || "Skills"}
                                    </Text>
                                    <Text style={styles.skillItems}>
                                        {safeArray(group.items).join(", ")}
                                    </Text>
                                </View>
                            ))}
                        </SidebarSection>
                    )}

                    {education.length > 0 && (
                        <SidebarSection title="Education" styles={styles}>
                            {education.map((item, index) => (
                                <View
                                    key={item.id || `education-${index}`}
                                    style={styles.sidebarBlock}
                                >
                                    <Text style={styles.skillCategory}>
                                        {item.degree || "Degree"}
                                        {item.field ? `, ${item.field}` : ""}
                                    </Text>
                                    {item.institution && (
                                        <Text style={styles.sidebarText}>{item.institution}</Text>
                                    )}
                                    {item.location && (
                                        <Text style={styles.sidebarText}>{item.location}</Text>
                                    )}
                                    <Text style={styles.sidebarText}>
                                        {formatDate(item.graduationDate)}
                                    </Text>
                                </View>
                            ))}
                        </SidebarSection>
                    )}

                    {certifications.length > 0 && (
                        <SidebarSection title="Certifications" styles={styles}>
                            {certifications.map((item, index) => (
                                <View
                                    key={item.id || `cert-${index}`}
                                    style={styles.sidebarBlock}
                                >
                                    <Text style={styles.skillCategory}>
                                        {item.name || "Certification"}
                                    </Text>
                                    {item.issuer && (
                                        <Text style={styles.sidebarText}>{item.issuer}</Text>
                                    )}
                                    <Text style={styles.sidebarText}>
                                        {formatDate(item.date)}
                                    </Text>
                                </View>
                            ))}
                        </SidebarSection>
                    )}

                    {languages.length > 0 && (
                        <SidebarSection title="Languages" styles={styles}>
                            {languages.map((item, index) => (
                                <Text
                                    key={`${item.language || "language"}-${index}`}
                                    style={styles.sidebarText}
                                >
                                    {item.language || "Language"}
                                    {item.proficiency ? ` (${item.proficiency})` : ""}
                                </Text>
                            ))}
                        </SidebarSection>
                    )}
                </View>

                <View style={styles.main}>
                    {summary && (
                        <MainSection title="Profile" styles={styles}>
                            <Text style={styles.summary}>{summary}</Text>
                        </MainSection>
                    )}

                    {experience.length > 0 && (
                        <MainSection title="Experience" styles={styles}>
                            {experience.map((item, index) => {
                                const bullets = safeArray(item.bullets);
                                const technologies = safeArray(item.technologies);

                                return (
                                    <View key={item.id || `experience-${index}`} style={styles.entry}>
                                        <View style={styles.rowBetween}>
                                            <Text style={styles.entryTitle}>
                                                {item.role || "Role"}
                                            </Text>
                                            <Text style={styles.entryDate}>
                                                {formatDate(item.startDate)} -{" "}
                                                {item.current ? "Present" : formatDate(item.endDate)}
                                            </Text>
                                        </View>

                                        <Text style={styles.entryMeta}>
                                            {item.company || "Organization"}
                                            {item.location ? `, ${item.location}` : ""}
                                        </Text>

                                        {bullets.map((bullet, bulletIndex) => (
                                            <Bullet
                                                key={bulletIndex}
                                                text={bullet}
                                                styles={styles}
                                            />
                                        ))}

                                        {technologies.length > 0 && (
                                            <Text style={styles.techLine}>
                                                {technologies.join(" | ")}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection title="Projects" styles={styles}>
                            {projects.map((project, index) => {
                                const highlights = safeArray(project.highlights);
                                const technologies = safeArray(project.technologies);

                                return (
                                    <View key={project.id || `project-${index}`} style={styles.entry}>
                                        <View style={styles.rowBetween}>
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
                                                <Link
                                                    src={project.repoUrl}
                                                    style={styles.entryDate}
                                                >
                                                    Source
                                                </Link>
                                            )}
                                        </View>

                                        {project.description && (
                                            <Text style={styles.entryMeta}>
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
                                            <Text style={styles.techLine}>
                                                {technologies.join(" | ")}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </MainSection>
                    )}
                </View>
            </Page>
        </Document>
    );
}

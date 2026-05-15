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

function arrayOrEmpty<T>(items: T[] | undefined): T[] {
    return Array.isArray(items) ? items : [];
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Present";

    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNumber = Number.parseInt(month ?? "", 10);

    if (!Number.isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        return `${months[monthNumber - 1]} ${year}`;
    }

    return year;
}

function makeStyles(theme: ThemeConfig) {
    const { colors, typography } = theme;
    const sidebarBg = colors.accent ?? "#1E3A5F";

    return StyleSheet.create({
        page: {
            flexDirection: "row",
            backgroundColor: colors.background,
            color: colors.text,
            fontFamily: typography.bodyFont,
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
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
            fontSize: typography.baseFontSize + 10,
            lineHeight: 1.25,
            marginBottom: 10,
        },
        sidebarHeading: {
            marginTop: 14,
            marginBottom: 5,
            color: "#FFFFFF",
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize - 0.5,
            textTransform: "uppercase",
            letterSpacing: 1.1,
        },
        sidebarRule: {
            borderBottomWidth: 0.75,
            borderBottomColor: "#D1D5DB",
            borderBottomStyle: "solid",
            opacity: 0.55,
            marginBottom: 7,
        },
        sidebarText: {
            color: "#E2E8F0",
            fontSize: typography.baseFontSize - 1,
            lineHeight: 1.45,
            marginBottom: 4,
        },
        sidebarLink: {
            color: "#FFFFFF",
            fontSize: typography.baseFontSize - 1,
            textDecoration: "none",
            marginBottom: 4,
        },
        main: {
            flex: 1,
            paddingTop: 34,
            paddingBottom: 34,
            paddingHorizontal: 26,
        },
        mainHeading: {
            color: colors.primary,
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize + 2,
            textTransform: "uppercase",
            letterSpacing: 0.9,
            marginBottom: 4,
        },
        mainRule: {
            borderBottomWidth: 1.75,
            borderBottomColor: sidebarBg,
            borderBottomStyle: "solid",
            marginBottom: 8,
        },
        summary: {
            fontSize: typography.baseFontSize,
            lineHeight: typography.lineHeight,
            color: colors.text,
        },
        section: {
            marginBottom: 14,
        },
        entry: {
            marginBottom: 9,
        },
        rowBetween: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        entryTitle: {
            flex: 1,
            color: colors.text,
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize + 0.5,
        },
        entryDate: {
            color: sidebarBg,
            fontSize: typography.baseFontSize - 1,
            fontStyle: "italic",
        },
        entryMeta: {
            color: colors.secondary,
            fontSize: typography.baseFontSize - 0.5,
            marginTop: 1,
            marginBottom: 3,
        },
        bulletRow: {
            flexDirection: "row",
            marginBottom: 2,
        },
        bulletMark: {
            width: 9,
            color: sidebarBg,
            fontSize: typography.baseFontSize - 1,
        },
        bulletText: {
            flex: 1,
            color: colors.text,
            fontSize: typography.baseFontSize - 0.5,
            lineHeight: typography.lineHeight,
        },
        techLine: {
            color: sidebarBg,
            fontSize: typography.baseFontSize - 1,
            fontStyle: "italic",
            marginTop: 3,
        },
        skillCategory: {
            color: "#FFFFFF",
            fontFamily: typography.headingFont,
            fontWeight: 700,
            fontSize: typography.baseFontSize - 1,
            marginBottom: 1,
            marginTop: 4,
        },
        skillItems: {
            color: "#E2E8F0",
            fontSize: typography.baseFontSize - 1,
            lineHeight: 1.4,
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

function Bullet({ text, styles }: { text: string; styles: ReturnType<typeof makeStyles> }) {
    if (!text) return null;

    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletMark}>-</Text>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

export function CreativeTemplate({ data, theme }: CreativeTemplateProps) {
    const styles = makeStyles(theme);
    const contact = data.contact ?? { name: "" };
    const summary = data.summary ?? "";
    const experience = arrayOrEmpty(data.experience);
    const projects = arrayOrEmpty(data.projects);
    const skills = arrayOrEmpty(data.skills);
    const education = arrayOrEmpty(data.education);
    const certifications = arrayOrEmpty(data.certifications);
    const languages = arrayOrEmpty(data.languages);

    return (
        <Document
            title={contact.name || "Resume"}
            author={contact.name || "ResumeForge"}
            keywords={skills.flatMap((group) => arrayOrEmpty(group.items)).join(", ")}
            creator="ResumeForge"
        >
            <Page size="LETTER" style={styles.page}>
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarName}>{contact.name || "Your Name"}</Text>

                    <Text style={styles.sidebarHeading}>Contact</Text>
                    <View style={styles.sidebarRule} />
                    {contact.email && (
                        <Link src={`mailto:${contact.email}`} style={styles.sidebarLink}>
                            <Text>{contact.email}</Text>
                        </Link>
                    )}
                    {contact.phone && <Text style={styles.sidebarText}>{contact.phone}</Text>}
                    {contact.location && <Text style={styles.sidebarText}>{contact.location}</Text>}
                    {contact.linkedin && (
                        <Link src={contact.linkedin} style={styles.sidebarLink}>
                            <Text>LinkedIn</Text>
                        </Link>
                    )}
                    {contact.github && (
                        <Link src={contact.github} style={styles.sidebarLink}>
                            <Text>GitHub</Text>
                        </Link>
                    )}
                    {contact.website && (
                        <Link src={contact.website} style={styles.sidebarLink}>
                            <Text>{contact.website.replace(/^https?:\/\//, "")}</Text>
                        </Link>
                    )}

                    {skills.length > 0 && (
                        <>
                            <Text style={styles.sidebarHeading}>Skills</Text>
                            <View style={styles.sidebarRule} />
                            {skills.map((group) => (
                                <View key={group.category}>
                                    <Text style={styles.skillCategory}>{group.category}</Text>
                                    <Text style={styles.skillItems}>{arrayOrEmpty(group.items).join(", ")}</Text>
                                </View>
                            ))}
                        </>
                    )}

                    {education.length > 0 && (
                        <>
                            <Text style={styles.sidebarHeading}>Education</Text>
                            <View style={styles.sidebarRule} />
                            {education.map((item) => (
                                <View key={item.id} style={styles.entry}>
                                    <Text style={styles.skillCategory}>
                                        {item.degree}{item.field ? `, ${item.field}` : ""}
                                    </Text>
                                    <Text style={styles.sidebarText}>{item.institution}</Text>
                                    {item.location && <Text style={styles.sidebarText}>{item.location}</Text>}
                                    <Text style={styles.sidebarText}>{formatDate(item.graduationDate)}</Text>
                                </View>
                            ))}
                        </>
                    )}

                    {certifications.length > 0 && (
                        <>
                            <Text style={styles.sidebarHeading}>Certifications</Text>
                            <View style={styles.sidebarRule} />
                            {certifications.map((item) => (
                                <View key={item.id} style={styles.entry}>
                                    <Text style={styles.skillCategory}>{item.name}</Text>
                                    <Text style={styles.sidebarText}>{item.issuer}</Text>
                                    <Text style={styles.sidebarText}>{formatDate(item.date)}</Text>
                                </View>
                            ))}
                        </>
                    )}

                    {languages.length > 0 && (
                        <>
                            <Text style={styles.sidebarHeading}>Languages</Text>
                            <View style={styles.sidebarRule} />
                            {languages.map((item) => (
                                <Text key={`${item.language}-${item.proficiency}`} style={styles.sidebarText}>
                                    {item.language} ({item.proficiency})
                                </Text>
                            ))}
                        </>
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
                            {experience.map((item) => (
                                <View key={item.id} style={styles.entry} wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.entryTitle}>{item.role || "Role"}</Text>
                                        <Text style={styles.entryDate}>
                                            {formatDate(item.startDate)} - {item.current ? "Present" : formatDate(item.endDate)}
                                        </Text>
                                    </View>
                                    <Text style={styles.entryMeta}>
                                        {item.company || "Organization"}{item.location ? `, ${item.location}` : ""}
                                    </Text>
                                    {arrayOrEmpty(item.bullets).map((bullet, index) => (
                                        <Bullet key={index} text={bullet} styles={styles} />
                                    ))}
                                    {arrayOrEmpty(item.technologies).length > 0 && (
                                        <Text style={styles.techLine}>
                                            {arrayOrEmpty(item.technologies).join(" | ")}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </MainSection>
                    )}

                    {projects.length > 0 && (
                        <MainSection title="Projects" styles={styles}>
                            {projects.map((project) => (
                                <View key={project.id} style={styles.entry} wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.entryTitle}>
                                            {project.url ? <Link src={project.url}>{project.name}</Link> : project.name}
                                        </Text>
                                        {project.repoUrl && (
                                            <Link src={project.repoUrl} style={styles.entryDate}>
                                                <Text>Source</Text>
                                            </Link>
                                        )}
                                    </View>
                                    {project.description && <Text style={styles.entryMeta}>{project.description}</Text>}
                                    {arrayOrEmpty(project.highlights).map((highlight, index) => (
                                        <Bullet key={index} text={highlight} styles={styles} />
                                    ))}
                                    {arrayOrEmpty(project.technologies).length > 0 && (
                                        <Text style={styles.techLine}>
                                            {arrayOrEmpty(project.technologies).join(" | ")}
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

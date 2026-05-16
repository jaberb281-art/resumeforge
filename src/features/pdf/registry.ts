import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { AcademicTemplate } from "./templates/AcademicTemplate";
import type { ResumeTemplate, ResumeData, ThemeConfig } from "@/store/useResumeStore";
import type React from "react";

type TemplateComponent = (props: { data: ResumeData; theme: ThemeConfig }) => React.ReactElement;

export const TEMPLATE_REGISTRY: Record<ResumeTemplate, TemplateComponent> = {
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    academic: AcademicTemplate,
};

export function getTemplate(template: ResumeTemplate): TemplateComponent {
    return TEMPLATE_REGISTRY[template] ?? ProfessionalTemplate;
}
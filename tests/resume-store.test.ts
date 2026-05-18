import { beforeEach, describe, expect, it } from "vitest";
import {
    EMPTY_RESUME_DATA,
    THEME_PRESETS,
    useResumeStore,
    type ResumeData,
} from "@/store/useResumeStore";

const hydratedData: ResumeData = {
    ...EMPTY_RESUME_DATA,
    contact: {
        ...EMPTY_RESUME_DATA.contact,
        name: "Ada Lovelace",
        email: "ada@example.com",
    },
    summary: "Writes careful software.",
};

describe("resume store hydration", () => {
    beforeEach(() => {
        useResumeStore.getState().resetToEmpty();
    });

    it("hydrates server data without marking the resume dirty", () => {
        useResumeStore.getState().hydrateResume(
            "resume-1",
            "Ada Resume",
            hydratedData,
            THEME_PRESETS.academic
        );

        const state = useResumeStore.getState();
        expect(state.resumeId).toBe("resume-1");
        expect(state.resumeTitle).toBe("Ada Resume");
        expect(state.data.contact.name).toBe("Ada Lovelace");
        expect(state.theme.template).toBe("academic");
        expect(state.isDirty).toBe(false);
        expect(state.isSaving).toBe(false);
    });

    it("marks real user edits dirty after hydration", () => {
        useResumeStore.getState().hydrateResume(
            "resume-1",
            "Ada Resume",
            hydratedData,
            THEME_PRESETS.professional
        );

        useResumeStore.getState().setResumeTitle("Ada Resume v2");
        expect(useResumeStore.getState().isDirty).toBe(true);

        useResumeStore.getState().markSaved();
        useResumeStore.getState().setSummary("Updated summary.");
        expect(useResumeStore.getState().isDirty).toBe(true);

        useResumeStore.getState().markSaved();
        useResumeStore.getState().setTemplate("creative");
        expect(useResumeStore.getState().isDirty).toBe(true);
    });
});

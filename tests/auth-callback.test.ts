import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "@/app/auth/callback/route";

describe("auth callback next-path sanitizer", () => {
    it("allows same-origin relative paths", () => {
        expect(getSafeNextPath("/")).toBe("/");
        expect(getSafeNextPath("/editor/resume-1")).toBe("/editor/resume-1");
        expect(getSafeNextPath("/dashboard?tab=resumes")).toBe("/dashboard?tab=resumes");
    });

    it("falls back for unsafe or malformed paths", () => {
        expect(getSafeNextPath(null)).toBe("/");
        expect(getSafeNextPath("https://evil.example")).toBe("/");
        expect(getSafeNextPath("//evil.example/path")).toBe("/");
        expect(getSafeNextPath("editor/resume-1")).toBe("/");
    });
});

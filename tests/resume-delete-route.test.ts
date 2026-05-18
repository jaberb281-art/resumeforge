import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
    createClient: createClientMock,
}));

async function callDelete(id = "resume-1") {
    const { DELETE } = await import("@/app/api/resumes/[id]/route");
    return DELETE(new Request(`https://resumeforge.test/api/resumes/${id}`), {
        params: Promise.resolve({ id }),
    });
}

function mockSupabase(params: {
    user?: { id: string } | null;
    deleteData?: { id: string } | null;
    deleteError?: { message: string } | null;
}) {
    const maybeSingle = vi.fn().mockResolvedValue({
        data: params.deleteData ?? null,
        error: params.deleteError ?? null,
    });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ select });
    const deleteFn = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ delete: deleteFn });
    const user = "user" in params ? params.user : { id: "user-1" };
    const getUser = vi.fn().mockResolvedValue({
        data: { user },
    });

    createClientMock.mockResolvedValue({
        auth: { getUser },
        from,
    });

    return { from, deleteFn, eq, select, maybeSingle };
}

describe("DELETE /api/resumes/[id]", () => {
    beforeEach(() => {
        vi.resetModules();
        createClientMock.mockReset();
    });

    it("returns 401 for unauthenticated users", async () => {
        mockSupabase({ user: null });

        const response = await callDelete();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    });

    it("returns 404 when no row was deleted", async () => {
        const chain = mockSupabase({ deleteData: null });

        const response = await callDelete("missing-resume");

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({ error: "Not found" });
        expect(chain.from).toHaveBeenCalledWith("resumes");
        expect(chain.eq).toHaveBeenCalledWith("id", "missing-resume");
    });

    it("returns ok only when a row was deleted", async () => {
        mockSupabase({ deleteData: { id: "resume-1" } });

        const response = await callDelete("resume-1");

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
    });
});

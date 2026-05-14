"use client";

import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import { AlertCircle, Check, Copy, FileText, Loader2, Pencil, Trash2, X } from "lucide-react";

export interface ResumeRow {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
}

interface ResumeApiRow {
    id?: unknown;
    title?: unknown;
    updated_at?: unknown;
    created_at?: unknown;
}

interface ConfirmModalProps {
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

function removeRecordKey(record: Record<string, string>, key: string): Record<string, string> {
    if (!(key in record)) return record;

    const next = { ...record };
    delete next[key];
    return next;
}

async function readResponseError(response: Response, fallback: string): Promise<string> {
    const body = (await response.json().catch(() => null)) as { error?: unknown } | null;

    return typeof body?.error === "string" ? body.error : fallback;
}

function formatRelative(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    return d.toLocaleDateString();
}

function ConfirmModal({ title, onConfirm, onCancel, loading }: ConfirmModalProps) {
    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!loading && event.target === event.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-resume-title"
                aria-describedby="delete-resume-description"
            >
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Cancel delete"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <Trash2 className="h-5 w-5 text-red-400" />
                </div>

                <h2 id="delete-resume-title" className="mb-1 text-sm font-semibold text-zinc-100">
                    Delete resume?
                </h2>
                <p id="delete-resume-description" className="mb-6 text-xs leading-relaxed text-zinc-400">
                    <span className="font-medium text-zinc-300">&quot;{title}&quot;</span> will be permanently
                    deleted. This cannot be undone.
                </p>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ResumeList({ initialResumes }: { initialResumes: ResumeRow[] }) {
    const [resumes, setResumes] = useState<ResumeRow[]>(initialResumes);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
    const [duplicatingIds, setDuplicatingIds] = useState<Record<string, boolean>>({});
    const [duplicateErrors, setDuplicateErrors] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [savingTitleIds, setSavingTitleIds] = useState<Record<string, boolean>>({});
    const [renameErrors, setRenameErrors] = useState<Record<string, string>>({});

    const confirmResume = resumes.find((resume) => resume.id === confirmId);

    const handleRenameClick = useCallback((event: MouseEvent<HTMLButtonElement>, resume: ResumeRow) => {
        event.preventDefault();
        event.stopPropagation();
        setEditingId(resume.id);
        setDraftTitle(resume.title || "Untitled Resume");
        setRenameErrors((prev) => removeRecordKey(prev, resume.id));
    }, []);

    const handleRenameCancel = useCallback(() => {
        if (editingId && savingTitleIds[editingId]) return;

        setEditingId(null);
        setDraftTitle("");

        if (editingId) {
            setRenameErrors((prev) => removeRecordKey(prev, editingId));
        }
    }, [editingId, savingTitleIds]);

    const handleRenameSave = useCallback(async (id: string) => {
        if (savingTitleIds[id]) return;

        const nextTitle = draftTitle.trim();
        const currentResume = resumes.find((resume) => resume.id === id);
        if (!currentResume) return;

        if (!nextTitle) {
            setRenameErrors((prev) => ({
                ...prev,
                [id]: "Enter a resume title before saving.",
            }));
            return;
        }

        if (nextTitle === currentResume.title) {
            setEditingId(null);
            setDraftTitle("");
            setRenameErrors((prev) => removeRecordKey(prev, id));
            return;
        }

        setSavingTitleIds((prev) => ({ ...prev, [id]: true }));
        setRenameErrors((prev) => removeRecordKey(prev, id));

        try {
            const response = await fetch(`/api/resumes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: nextTitle }),
            });

            if (!response.ok) {
                const message = await readResponseError(response, `Rename failed with status ${response.status}`);
                throw new Error(message);
            }

            const body = (await response.json().catch(() => null)) as {
                resume?: { title?: unknown; updated_at?: unknown };
            } | null;
            const savedTitle = typeof body?.resume?.title === "string" ? body.resume.title : nextTitle;
            const updatedAt = typeof body?.resume?.updated_at === "string"
                ? body.resume.updated_at
                : currentResume.updated_at;

            setResumes((prev) => prev.map((resume) => (
                resume.id === id
                    ? { ...resume, title: savedTitle, updated_at: updatedAt }
                    : resume
            )));
            setEditingId(null);
            setDraftTitle("");
        } catch (error) {
            console.error("[rename resume]", error);
            setRenameErrors((prev) => ({
                ...prev,
                [id]: error instanceof Error
                    ? error.message
                    : "Unable to rename this resume. Please try again.",
            }));
        } finally {
            setSavingTitleIds((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    }, [draftTitle, resumes, savingTitleIds]);

    const handleRenameKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>, id: string) => {
        if (event.key === "Enter") {
            event.preventDefault();
            void handleRenameSave(id);
        }

        if (event.key === "Escape") {
            event.preventDefault();
            handleRenameCancel();
        }
    }, [handleRenameCancel, handleRenameSave]);

    const handleDeleteClick = useCallback((event: MouseEvent<HTMLButtonElement>, id: string) => {
        event.preventDefault();
        event.stopPropagation();
        setDeleteErrors((prev) => removeRecordKey(prev, id));
        setConfirmId(id);
    }, []);

    const handleDuplicateClick = useCallback(async (event: MouseEvent<HTMLButtonElement>, id: string) => {
        event.preventDefault();
        event.stopPropagation();

        if (duplicatingIds[id] || deletingId === id || savingTitleIds[id] || editingId === id) {
            return;
        }

        setDuplicateErrors((prev) => removeRecordKey(prev, id));
        setDuplicatingIds((prev) => ({ ...prev, [id]: true }));

        try {
            const response = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
            if (!response.ok) {
                const message = await readResponseError(response, `Duplicate failed with status ${response.status}`);
                throw new Error(message);
            }

            const body = (await response.json().catch(() => null)) as { resume?: ResumeApiRow } | null;
            const duplicated = body?.resume;

            if (
                !duplicated
                || typeof duplicated.id !== "string"
                || typeof duplicated.title !== "string"
                || typeof duplicated.updated_at !== "string"
                || typeof duplicated.created_at !== "string"
            ) {
                throw new Error("Duplicate response was missing fields.");
            }

            const duplicatedResume: ResumeRow = {
                id: duplicated.id,
                title: duplicated.title,
                updated_at: duplicated.updated_at,
                created_at: duplicated.created_at,
            };

            setResumes((prev) => [
                duplicatedResume,
                ...prev,
            ]);
        } catch (error) {
            console.error("[duplicate resume]", error);
            setDuplicateErrors((prev) => ({
                ...prev,
                [id]: error instanceof Error
                    ? error.message
                    : "Unable to duplicate this resume. Please try again.",
            }));
        } finally {
            setDuplicatingIds((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    }, [deletingId, duplicatingIds, editingId, savingTitleIds]);

    const handleCancel = useCallback(() => {
        if (!deletingId) {
            setConfirmId(null);
        }
    }, [deletingId]);

    const handleConfirm = useCallback(async () => {
        if (!confirmId || deletingId) return;

        setDeletingId(confirmId);

        try {
            const response = await fetch(`/api/resumes/${confirmId}`, { method: "DELETE" });

            if (!response.ok) {
                const message = await readResponseError(response, `Delete failed with status ${response.status}`);
                throw new Error(message);
            }

            setResumes((prev) => prev.filter((resume) => resume.id !== confirmId));
            setDeleteErrors((prev) => removeRecordKey(prev, confirmId));
            setDuplicateErrors((prev) => removeRecordKey(prev, confirmId));
            setRenameErrors((prev) => removeRecordKey(prev, confirmId));
            setConfirmId(null);
        } catch (error) {
            console.error("[delete resume]", error);
            setDeleteErrors((prev) => ({
                ...prev,
                [confirmId]: error instanceof Error
                    ? error.message
                    : "Unable to delete this resume. Please try again.",
            }));
            setConfirmId(null);
        } finally {
            setDeletingId(null);
        }
    }, [confirmId, deletingId]);

    if (resumes.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
                <p className="mb-1 text-sm text-zinc-400">No resumes yet</p>
                <p className="text-xs text-zinc-600">Click &quot;New resume&quot; to create your first one.</p>
            </div>
        );
    }

    return (
        <>
            {confirmId && confirmResume && (
                <ConfirmModal
                    title={confirmResume.title || "Untitled Resume"}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    loading={deletingId === confirmId}
                />
            )}

            <ul className="space-y-2">
                {resumes.map((resume) => {
                    const isDeleting = deletingId === resume.id;
                    const isDuplicating = Boolean(duplicatingIds[resume.id]);
                    const isEditing = editingId === resume.id;
                    const isSavingTitle = Boolean(savingTitleIds[resume.id]);
                    const deleteError = deleteErrors[resume.id];
                    const duplicateError = duplicateErrors[resume.id];
                    const renameError = renameErrors[resume.id];
                    const title = resume.title || "Untitled Resume";
                    const isRowBusy = isDeleting || isSavingTitle || isDuplicating;

                    return (
                        <li key={resume.id}>
                            <div
                                className={`rounded-xl border transition-all ${
                                    isDeleting
                                        ? "border-zinc-800 opacity-50"
                                        : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="min-w-0 flex-1 p-4">
                                        {isEditing ? (
                                            <>
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <input
                                                        value={draftTitle}
                                                        onChange={(event) => setDraftTitle(event.target.value)}
                                                        onKeyDown={(event) => handleRenameKeyDown(event, resume.id)}
                                                        disabled={isSavingTitle || isDeleting || isDuplicating}
                                                        autoFocus
                                                        className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-1.5 text-sm font-medium text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                        aria-label={`Rename ${title}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleRenameSave(resume.id)}
                                                        disabled={isSavingTitle || isDeleting || isDuplicating}
                                                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Save ${title} title`}
                                                    >
                                                        {isSavingTitle ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Check className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRenameCancel}
                                                        disabled={isSavingTitle}
                                                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Cancel renaming ${title}`}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Updated {formatRelative(resume.updated_at)}
                                                </p>
                                            </>
                                        ) : (
                                            <div className="flex min-w-0 items-start gap-2">
                                                <Link
                                                    href={`/editor/${resume.id}`}
                                                    className={`min-w-0 flex-1 ${
                                                        isRowBusy ? "pointer-events-none" : ""
                                                    }`}
                                                    aria-disabled={isRowBusy}
                                                >
                                                    <p className="truncate text-sm font-medium text-zinc-200">
                                                        {title}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        Updated {formatRelative(resume.updated_at)}
                                                    </p>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(event) => handleRenameClick(event, resume)}
                                                    disabled={isRowBusy}
                                                    aria-label={`Rename ${title}`}
                                                    className="mt-0.5 rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {isSavingTitle ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(event) => void handleDuplicateClick(event, resume.id)}
                                        disabled={isRowBusy}
                                        aria-label={`Duplicate ${title}`}
                                        className="shrink-0 p-4 text-zinc-600 transition-colors hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isDuplicating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(event) => handleDeleteClick(event, resume.id)}
                                        disabled={isRowBusy}
                                        aria-label={`Delete ${title}`}
                                        className="shrink-0 p-4 text-zinc-600 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {renameError && (
                                    <p className="flex items-center gap-1.5 border-t border-zinc-800 px-4 py-2 text-xs text-red-400">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Could not rename this resume: {renameError}</span>
                                    </p>
                                )}

                                {deleteError && (
                                    <p className="flex items-center gap-1.5 border-t border-zinc-800 px-4 py-2 text-xs text-red-400">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Could not delete this resume: {deleteError}</span>
                                    </p>
                                )}

                                {duplicateError && (
                                    <p className="flex items-center gap-1.5 border-t border-zinc-800 px-4 py-2 text-xs text-red-400">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Could not duplicate this resume: {duplicateError}</span>
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

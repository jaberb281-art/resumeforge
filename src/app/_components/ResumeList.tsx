"use client";

// =============================================================
// ResumeForge — ResumeList (client component)
//
// Renders the resume list with per-row delete buttons.
// Owns local state so deletes update instantly without a
// full server round-trip. Shows a confirmation modal before
// deleting and surfaces errors inline without breaking the UI.
// =============================================================

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileText, Trash2, Loader2, AlertCircle, X } from "lucide-react";

export interface ResumeRow {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
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

// ── Confirmation modal ────────────────────────────────────────

interface ConfirmModalProps {
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

function ConfirmModal({ title, onConfirm, onCancel, loading }: ConfirmModalProps) {
    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className="relative w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                {/* Close */}
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
                    aria-label="Cancel"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-4">
                    <Trash2 className="w-5 h-5 text-red-400" />
                </div>

                <h2 className="text-sm font-semibold text-zinc-100 mb-1">Delete resume?</h2>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    <span className="text-zinc-300 font-medium">&ldquo;{title}&rdquo;</span> will be
                    permanently deleted. This cannot be undone.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs text-white font-medium transition-colors disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main list component ───────────────────────────────────────

export function ResumeList({ initialResumes }: { initialResumes: ResumeRow[] }) {
    const [resumes, setResumes] = useState<ResumeRow[]>(initialResumes);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorId, setErrorId] = useState<string | null>(null);

    const confirmResume = resumes.find((r) => r.id === confirmId);

    const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault();   // don't navigate to editor
        e.stopPropagation();
        setErrorId(null);
        setConfirmId(id);
    }, []);

    const handleCancel = useCallback(() => {
        setConfirmId(null);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!confirmId) return;
        setDeletingId(confirmId);

        try {
            const res = await fetch(`/api/resumes/${confirmId}`, { method: "DELETE" });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? `Server error ${res.status}`);
            }

            // Optimistic remove from local state
            setResumes((prev) => prev.filter((r) => r.id !== confirmId));
            setConfirmId(null);
        } catch (err) {
            console.error("[delete resume]", err);
            setErrorId(confirmId);
            setConfirmId(null);
        } finally {
            setDeletingId(null);
        }
    }, [confirmId]);

    // Empty state
    if (resumes.length === 0) {
        return (
            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
                <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 mb-1">No resumes yet</p>
                <p className="text-xs text-zinc-600">Click &quot;New resume&quot; to create your first one.</p>
            </div>
        );
    }

    return (
        <>
            {/* Confirmation modal */}
            {confirmId && confirmResume && (
                <ConfirmModal
                    title={confirmResume.title || "Untitled Resume"}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    loading={deletingId === confirmId}
                />
            )}

            <ul className="space-y-2">
                {resumes.map((r) => {
                    const isDeleting = deletingId === r.id;
                    const hasError = errorId === r.id;

                    return (
                        <li key={r.id}>
                            <div className={`
                                flex items-center gap-3 rounded-xl border transition-all
                                ${isDeleting
                                    ? "border-zinc-800 opacity-50 pointer-events-none"
                                    : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40"
                                }
                            `}>
                                {/* Clickable resume link — takes up most of the row */}
                                <Link
                                    href={`/editor/${r.id}`}
                                    className="flex-1 min-w-0 p-4"
                                >
                                    <p className="text-sm font-medium text-zinc-200 truncate">
                                        {r.title || "Untitled Resume"}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Updated {formatRelative(r.updated_at)}
                                    </p>
                                </Link>

                                {/* Error indicator */}
                                {hasError && (
                                    <div
                                        className="flex items-center gap-1 text-xs text-red-400 pr-2 shrink-0"
                                        title="Delete failed — please try again"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Failed</span>
                                    </div>
                                )}

                                {/* Delete / loading button */}
                                <button
                                    onClick={(e) => handleDeleteClick(e, r.id)}
                                    disabled={isDeleting}
                                    aria-label={`Delete ${r.title || "Untitled Resume"}`}
                                    className="p-4 text-zinc-600 hover:text-red-400 transition-colors shrink-0 disabled:opacity-40"
                                >
                                    {isDeleting
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Trash2 className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
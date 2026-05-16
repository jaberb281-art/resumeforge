"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { DocumentProps } from "@react-pdf/renderer";

function PDFSkeleton() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs tracking-wide">Loading preview…</span>
            </div>
        </div>
    );
}

const BlobProvider = dynamic(
    () => import("@react-pdf/renderer").then((m) => ({ default: m.BlobProvider })),
    { ssr: false, loading: () => <PDFSkeleton /> }
);

function PDFPreview({ document: doc }: { document: React.ReactElement<DocumentProps> }) {
    return (
        <BlobProvider document={doc}>
            {({ url, loading, error }) => {
                if (loading || !url) return <PDFSkeleton />;
                if (error) {
                    return (
                        <div className="h-full flex items-center justify-center text-red-400 text-xs px-4 text-center">
                            Preview failed to render. Try exporting directly.
                        </div>
                    );
                }
                return (
                    <iframe
                        src={url}
                        title="Resume preview"
                        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    />
                );
            }}
        </BlobProvider>
    );
}

interface PreviewPaneProps {
    documentElement: React.ReactElement<DocumentProps>;
    template: string;
    previewMode: "split" | "form" | "preview";
}

export function PreviewPane({ documentElement, template, previewMode }: PreviewPaneProps) {
    return (
        <div className={`${previewMode === "split" ? "w-[500px]" : "flex-1"} flex-shrink-0 border-l border-zinc-800/60 bg-zinc-900/40 flex flex-col`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Live Preview</span>
                <span className="text-xs text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-md capitalize">
                    {template}
                </span>
            </div>
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                <Suspense fallback={<PDFSkeleton />}>
                    <PDFPreview document={documentElement} />
                </Suspense>
            </div>
        </div>
    );
}
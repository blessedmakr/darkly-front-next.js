"use client";

import { useState } from "react";
import { PUBLIC_API_BASE } from "../../lib/config";
import type { Submission } from "./types";

interface SubmissionsTabProps {
    initialSubmissions: Submission[];
    getToken: () => Promise<string | null>;
    onPendingCountChange: (count: number) => void;
}

export default function SubmissionsTab({ initialSubmissions, getToken, onPendingCountChange }: SubmissionsTabProps) {
    const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
    const [busy, setBusy] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function handleSubmission(id: number, action: "approve" | "reject") {
        setBusy(String(id));
        setActionError(null);
        try {
            const token = await getToken();
            const res = await fetch(`${PUBLIC_API_BASE}/admin/submissions/${id}/${action}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { setActionError(`Failed to ${action} submission (${res.status})`); return; }
            const updated = submissions.map((s) =>
                s.id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s
            );
            setSubmissions(updated);
            onPendingCountChange(updated.filter((s) => s.status === "pending").length);
        } catch {
            setActionError("Network error — could not reach the backend.");
        } finally {
            setBusy(null);
        }
    }

    return (
        <div>
            {actionError && (
                <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {actionError}
                    <button onClick={() => setActionError(null)} className="ml-3 text-red-500 hover:text-red-300">✕</button>
                </div>
            )}
            <div className="space-y-3">
                {submissions.length === 0 && (
                    <p className="text-sm text-zinc-500">No submissions yet.</p>
                )}
                {submissions.map((sub) => (
                    <div key={sub.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-zinc-100">
                                    {sub.title}{sub.releaseYear ? ` (${sub.releaseYear})` : ""}
                                </p>
                                {sub.overview && (
                                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{sub.overview}</p>
                                )}
                                <p className="mt-1 text-xs text-zinc-600">
                                    Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                                    {sub.tmdbId ? ` · TMDB #${sub.tmdbId}` : ""}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {sub.status === "pending" ? (
                                    <>
                                        <button
                                            onClick={() => handleSubmission(sub.id, "approve")}
                                            disabled={busy === String(sub.id)}
                                            className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-300 transition-colors hover:bg-lime-400/20 disabled:opacity-40"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleSubmission(sub.id, "reject")}
                                            disabled={busy === String(sub.id)}
                                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-40"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`text-xs uppercase tracking-wider ${sub.status === "approved" ? "text-lime-400/60" : "text-red-400/60"}`}>
                                        {sub.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

interface Invitation {
    id: string;
    emailAddress: string;
    status: InvitationStatus;
    createdAt: number;
    url: string;
}

const STATUS_STYLES: Record<InvitationStatus, string> = {
    pending:  "border-amber-400/30 bg-amber-400/10 text-amber-300",
    accepted: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    revoked:  "border-zinc-700 bg-zinc-800/60 text-zinc-500",
    expired:  "border-zinc-700 bg-zinc-800/60 text-zinc-500",
};

function formatSent(ms: number): string {
    return new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function InviteTab() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invitations, setInvitations] = useState<Invitation[] | null>(null);
    const [loadingList, setLoadingList] = useState(true);

    async function loadInvitations() {
        try {
            const res = await fetch("/api/admin/invite", { cache: "no-store" });
            if (!res.ok) {
                setInvitations([]);
                return;
            }
            const data: { invitations: Invitation[] } = await res.json();
            // Newest first
            setInvitations(
                [...data.invitations].sort((a, b) => b.createdAt - a.createdAt)
            );
        } catch {
            setInvitations([]);
        } finally {
            setLoadingList(false);
        }
    }

    useEffect(() => {
        loadInvitations();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Failed to send invitation");
                return;
            }

            setEmail("");
            await loadInvitations();
        } catch {
            setError("Network error — could not send invitation");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-lg space-y-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Email address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="someone@example.com"
                        required
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting || !email}
                    className="rounded-md border border-lime-400/30 bg-lime-400/10 px-5 py-2 text-sm text-lime-300 transition-colors hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? "Sending…" : "Send invitation"}
                </button>
            </form>

            <div>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Invitations</p>

                {loadingList && (
                    <p className="text-sm text-zinc-500">Loading…</p>
                )}

                {!loadingList && invitations !== null && invitations.length === 0 && (
                    <p className="text-sm text-zinc-500">No invitations yet.</p>
                )}

                {!loadingList && invitations !== null && invitations.length > 0 && (
                    <div className="space-y-2">
                        {invitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm text-zinc-300">{inv.emailAddress}</p>
                                    <p className="text-xs text-zinc-600">{formatSent(inv.createdAt)}</p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${STATUS_STYLES[inv.status] ?? STATUS_STYLES.expired}`}
                                >
                                    {inv.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

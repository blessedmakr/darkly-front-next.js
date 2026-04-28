"use client";

import { useState } from "react";

interface SentInvite {
    email: string;
    sentAt: string;
}

export default function InviteTab() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState<SentInvite[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

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

            setSent((prev) => [{ email, sentAt: new Date().toLocaleTimeString() }, ...prev]);
            setEmail("");
        } catch {
            setError("Network error — could not send invitation");
        } finally {
            setLoading(false);
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
                    disabled={loading || !email}
                    className="rounded-md border border-lime-400/30 bg-lime-400/10 px-5 py-2 text-sm text-lime-300 transition-colors hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading ? "Sending…" : "Send invitation"}
                </button>
            </form>

            {sent.length > 0 && (
                <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Sent this session</p>
                    <div className="space-y-2">
                        {sent.map((invite, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                            >
                                <span className="text-sm text-zinc-300">{invite.email}</span>
                                <span className="text-xs text-zinc-600">{invite.sentAt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

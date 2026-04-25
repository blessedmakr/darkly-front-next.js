"use client";

import { useState } from "react";
import CuratorBadge from "../CuratorBadge";
import { PUBLIC_API_BASE } from "../../lib/config";
import type { AdminUser } from "./types";

interface UsersTabProps {
    initialUsers: AdminUser[];
    getToken: () => Promise<string | null>;
}

export default function UsersTab({ initialUsers, getToken }: UsersTabProps) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [busy, setBusy] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function grantCurator(userId: string) {
        setBusy(userId);
        setActionError(null);
        try {
            const token = await getToken();
            const res = await fetch(`${PUBLIC_API_BASE}/admin/users/${userId}/curator`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { setActionError(`Failed to grant curator (${res.status})`); return; }
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "trusted_curator" } : u)));
        } catch {
            setActionError("Network error — could not reach the backend.");
        } finally {
            setBusy(null);
        }
    }

    async function revokeCurator(userId: string) {
        setBusy(userId);
        setActionError(null);
        try {
            const token = await getToken();
            const res = await fetch(`${PUBLIC_API_BASE}/admin/users/${userId}/curator`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { setActionError(`Failed to revoke curator (${res.status})`); return; }
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: "member" } : u)));
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
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-zinc-100">
                                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                                </span>
                                {(user.role === "trusted_curator" || user.role === "admin") && <CuratorBadge />}
                                {user.role === "admin" && (
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-red-400/70">Admin</span>
                                )}
                            </div>
                            <p className="truncate text-xs text-zinc-500">{user.email}</p>
                        </div>

                        {user.role !== "admin" && (
                            <div className="shrink-0">
                                {user.role === "trusted_curator" ? (
                                    <button
                                        onClick={() => revokeCurator(user.id)}
                                        disabled={busy === user.id}
                                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-40"
                                    >
                                        Revoke curator
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => grantCurator(user.id)}
                                        disabled={busy === user.id}
                                        className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-300 transition-colors hover:bg-lime-400/20 disabled:opacity-40"
                                    >
                                        Grant curator
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

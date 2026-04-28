"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import UsersTab from "./admin/UsersTab";
import SubmissionsTab from "./admin/SubmissionsTab";
import AnalyticsTab from "./admin/AnalyticsTab";
import MetadataTab from "./admin/MetadataTab";
import InviteTab from "./admin/InviteTab";
import type { AdminUser, Submission } from "./admin/types";

interface AdminPanelProps {
    initialUsers: AdminUser[];
    initialSubmissions: Submission[];
}

type Tab = "users" | "submissions" | "analytics" | "scores" | "metadata" | "invite";

export default function AdminPanel({ initialUsers, initialSubmissions }: AdminPanelProps) {
    const { getToken } = useAuth();
    const [tab, setTab] = useState<Tab>("users");
    const [pendingCount, setPendingCount] = useState(
        initialSubmissions.filter((s) => s.status === "pending").length
    );

    return (
        <div>
            <div className="mb-8 flex gap-1 border-b border-zinc-800">
                {(["users", "submissions", "analytics", "scores", "metadata", "invite"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm capitalize transition-colors ${
                            tab === t
                                ? "border-b-2 border-lime-400 text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        {t}
                        {t === "submissions" && pendingCount > 0 && (
                            <span className="ml-2 rounded-full bg-red-500/80 px-1.5 py-0.5 text-[10px] text-white">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {tab === "users" && (
                <UsersTab initialUsers={initialUsers} getToken={getToken} />
            )}
            {tab === "submissions" && (
                <SubmissionsTab
                    initialSubmissions={initialSubmissions}
                    getToken={getToken}
                    onPendingCountChange={setPendingCount}
                />
            )}
            {tab === "analytics" && <AnalyticsTab getToken={getToken} />}
            {tab === "metadata" && <MetadataTab getToken={getToken} />}
            {tab === "invite" && <InviteTab getToken={getToken} />}
        </div>
    );
}

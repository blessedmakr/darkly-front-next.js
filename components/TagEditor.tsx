"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { TagDto } from "../types/motion-picture";

interface TagEditorProps {
    motionPictureId: number;
    initialTags: TagDto[];
}

export default function TagEditor({ motionPictureId, initialTags }: TagEditorProps) {
    const { isSignedIn, getToken } = useAuth();
    const [isCurator, setIsCurator] = useState(false);
    const [allTags, setAllTags] = useState<TagDto[]>([]);
    const [currentTags, setCurrentTags] = useState<TagDto[]>(initialTags);
    const [selectedTagId, setSelectedTagId] = useState<string>("");
    const [busy, setBusy] = useState(false);

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        if (!isSignedIn) return;

        let cancelled = false;

        const cached = sessionStorage.getItem("darkly:role");
        if (cached) {
            if (cached === "trusted_curator" || cached === "admin") setIsCurator(true);
        } else {
            getToken()
                .then((token) =>
                    fetch(`${base}/auth/role`, { headers: { Authorization: `Bearer ${token}` } })
                        .then((r) => r.json())
                        .then((data) => {
                            sessionStorage.setItem("darkly:role", data.role ?? "");
                            if (!cancelled && (data.role === "trusted_curator" || data.role === "admin")) {
                                setIsCurator(true);
                            }
                        })
                )
                .catch(() => null);
        }

        fetch(`${base}/tags`)
            .then((r) => r.json())
            .then((data) => { if (!cancelled) setAllTags(data); })
            .catch(() => null);

        return () => { cancelled = true; };
    }, [isSignedIn, getToken, base]);

    if (!isCurator) return null;

    const currentTagIds = new Set(currentTags.map((t) => t.id));
    const available = allTags.filter((t) => !currentTagIds.has(t.id));

    async function handleAdd() {
        if (!selectedTagId) return;
        const tagId = Number(selectedTagId);
        setBusy(true);
        const token = await getToken();
        const res = await fetch(`${base}/motion-pictures/${motionPictureId}/tags/${tagId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 409) {
            const tag = allTags.find((t) => t.id === tagId);
            if (tag && !currentTagIds.has(tagId)) {
                setCurrentTags((prev) => [...prev, tag]);
            }
        }
        setSelectedTagId("");
        setBusy(false);
    }

    async function handleRemove(tagId: number) {
        setBusy(true);
        const token = await getToken();
        const res = await fetch(`${base}/motion-pictures/${motionPictureId}/tags/${tagId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 404) {
            setCurrentTags((prev) => prev.filter((t) => t.id !== tagId));
        }
        setBusy(false);
    }

    return (
        <div className="mt-8 rounded-xl border border-lime-400/20 bg-lime-400/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-lime-400/60 mb-3">
                ◆ Tag Editor
            </p>

            {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {currentTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 rounded-full border border-lime-400/20 bg-zinc-900 px-3 py-1 text-sm text-zinc-200"
                        >
                            {tag.name}
                            <button
                                onClick={() => handleRemove(tag.id)}
                                disabled={busy}
                                className="ml-1 text-zinc-500 hover:text-red-400 transition-colors"
                                aria-label={`Remove tag ${tag.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {available.length > 0 && (
                <div className="flex gap-2">
                    <select
                        value={selectedTagId}
                        onChange={(e) => setSelectedTagId(e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-lime-400/40 focus:outline-none"
                    >
                        <option value="">Add a tag…</option>
                        {available.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name} ({tag.tagType})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedTagId || busy}
                        className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm text-lime-300 transition-colors hover:bg-lime-400/20 disabled:opacity-40"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}

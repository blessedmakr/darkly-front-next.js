"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import CuratorBadge from "./CuratorBadge";

interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: number;
    role: string;
}

interface Submission {
    id: number;
    title: string;
    releaseYear: number | null;
    overview: string | null;
    tmdbId: number | null;
    userId: string;
    submittedAt: string;
    status: string;
}

interface FilmViewStat {
    motionPictureId: number;
    originalTitle: string;
    views7d: number;
    views30d: number;
    viewsTotal: number;
}

interface TagDto {
    id: number;
    name: string;
    tagType: string;
}

interface FilmMeta {
    id: number;
    originalTitle: string;
    releaseDate: string | null;
    alternativeTitle: string | null;
    runningTime: number | null;
    motionPictureRating: string | null;
    tagline: string | null;
    hook: string | null;
    overview: string | null;
    synopsis: string | null;
}

interface FilmDetails {
    tags: TagDto[];
    genres: string[];
}

interface MetaEdit {
    originalTitle: string;
    alternativeTitle: string;
    releaseDate: string;
    runningTime: string;
    motionPictureRating: string;
    tagline: string;
    hook: string;
    overview: string;
    synopsis: string;
}

interface AdminPanelProps {
    initialUsers: AdminUser[];
    initialSubmissions: Submission[];
}

const base = process.env.NEXT_PUBLIC_API_BASE_URL;
const SAVE_SUCCESS_DURATION_MS = 2000;

const MPAA_RATINGS = ["", "G", "PG", "PG-13", "R", "NC-17", "NR", "TV-MA", "TV-14", "Unrated"];

export default function AdminPanel({ initialUsers, initialSubmissions }: AdminPanelProps) {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
    const [topFilms, setTopFilms] = useState<FilmViewStat[] | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Metadata tab
    const [metaFilms, setMetaFilms] = useState<FilmMeta[] | null>(null);
    const [loadingMetaFilms, setLoadingMetaFilms] = useState(false);
    const [metaEdits, setMetaEdits] = useState<Record<number, MetaEdit>>({});
    const [expandedMetaId, setExpandedMetaId] = useState<number | null>(null);
    const [savingMetaId, setSavingMetaId] = useState<number | null>(null);
    const [savedMetaIds, setSavedMetaIds] = useState<Set<number>>(new Set());
    const [metaError, setMetaError] = useState<string | null>(null);
    const [metaSearch, setMetaSearch] = useState("");
    // Per-film details (tags + genres), loaded on expand
    const [filmDetails, setFilmDetails] = useState<Record<number, FilmDetails>>({});
    const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
    // All available tags, loaded once
    const [allTags, setAllTags] = useState<TagDto[] | null>(null);
    // Per-film add-tag selection and add-genre input
    const [selectedTagId, setSelectedTagId] = useState<Record<number, string>>({});
    const [newGenre, setNewGenre] = useState<Record<number, string>>({});

    const [busy, setBusy] = useState<string | null>(null);
    const [tab, setTab] = useState<"users" | "submissions" | "analytics" | "scores" | "metadata">("users");

    async function loadAnalytics() {
        if (topFilms !== null) return;
        setLoadingAnalytics(true);
        const token = await getToken();
        const res = await fetch(`${base}/admin/analytics/top-films`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setTopFilms(await res.json());
        setLoadingAnalytics(false);
    }

    async function loadMetaFilms() {
        if (metaFilms !== null) return;
        setLoadingMetaFilms(true);
        const token = await getToken();
        const res = await fetch(`${base}/admin/films/metadata`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data: FilmMeta[] = await res.json();
            setMetaFilms(data);
            const initial: Record<number, MetaEdit> = {};
            data.forEach((f) => {
                initial[f.id] = {
                    originalTitle:        f.originalTitle ?? "",
                    alternativeTitle:     f.alternativeTitle ?? "",
                    releaseDate:          f.releaseDate ?? "",
                    runningTime:          f.runningTime != null ? String(f.runningTime) : "",
                    motionPictureRating:  f.motionPictureRating ?? "",
                    tagline:              f.tagline ?? "",
                    hook:                 f.hook ?? "",
                    overview:             f.overview ?? "",
                    synopsis:             f.synopsis ?? "",
                };
            });
            setMetaEdits(initial);
        }
        setLoadingMetaFilms(false);
    }

    async function saveMetadata(filmId: number) {
        setSavingMetaId(filmId);
        setMetaError(null);
        try {
            const token = await getToken();
            const edit = metaEdits[filmId];
            const res = await fetch(`${base}/admin/films/${filmId}/metadata`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalTitle:        edit.originalTitle       || null,
                    alternativeTitle:     edit.alternativeTitle    || null,
                    releaseDate:          edit.releaseDate         || null,
                    runningTime:          edit.runningTime !== "" ? parseInt(edit.runningTime, 10) : null,
                    motionPictureRating:  edit.motionPictureRating || null,
                    tagline:              edit.tagline             || null,
                    hook:                 edit.hook                || null,
                    overview:             edit.overview            || null,
                    synopsis:             edit.synopsis            || null,
                }),
            });
            if (!res.ok) {
                setMetaError(`Save failed (${res.status}). Has the backend been restarted?`);
                return;
            }
            setSavedMetaIds((prev) => new Set([...prev, filmId]));
            setTimeout(() => setSavedMetaIds((prev) => { const next = new Set(prev); next.delete(filmId); return next; }), SAVE_SUCCESS_DURATION_MS);
        } catch {
            setMetaError("Network error — could not reach the backend.");
        } finally {
            setSavingMetaId(null);
        }
    }

    function setMetaEdit(filmId: number, field: keyof MetaEdit, value: string) {
        setMetaEdits((prev) => ({ ...prev, [filmId]: { ...prev[filmId], [field]: value } }));
    }

    async function loadFilmDetails(filmId: number) {
        if (filmDetails[filmId]) return;
        setLoadingDetails((prev) => ({ ...prev, [filmId]: true }));
        const token = await getToken();
        const [detailsRes, tagsRes] = await Promise.all([
            fetch(`${base}/admin/films/${filmId}/details`, { headers: { Authorization: `Bearer ${token}` } }),
            allTags === null
                ? fetch(`${base}/tags`)
                : Promise.resolve(null),
        ]);
        if (detailsRes.ok) {
            const data: FilmDetails = await detailsRes.json();
            setFilmDetails((prev) => ({ ...prev, [filmId]: data }));
        }
        if (tagsRes && tagsRes.ok) {
            setAllTags(await tagsRes.json());
        }
        setLoadingDetails((prev) => ({ ...prev, [filmId]: false }));
    }

    async function addTag(filmId: number) {
        const tagId = selectedTagId[filmId];
        if (!tagId) return;
        const token = await getToken();
        const res = await fetch(`${base}/motion-pictures/${filmId}/tags/${tagId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 409) {
            const tag = allTags?.find((t) => t.id === Number(tagId));
            if (tag) {
                setFilmDetails((prev) => ({
                    ...prev,
                    [filmId]: {
                        ...prev[filmId],
                        tags: prev[filmId]?.tags.some((t) => t.id === tag.id)
                            ? prev[filmId]?.tags ?? []
                            : [...(prev[filmId]?.tags ?? []), tag],
                    },
                }));
            }
            setSelectedTagId((prev) => ({ ...prev, [filmId]: "" }));
        }
    }

    async function removeTag(filmId: number, tagId: number) {
        const token = await getToken();
        const res = await fetch(`${base}/motion-pictures/${filmId}/tags/${tagId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 404) {
            setFilmDetails((prev) => ({
                ...prev,
                [filmId]: { ...prev[filmId], tags: prev[filmId].tags.filter((t) => t.id !== tagId) },
            }));
        }
    }

    async function addGenre(filmId: number) {
        const genre = newGenre[filmId]?.trim();
        if (!genre) return;
        const token = await getToken();
        const res = await fetch(`${base}/admin/films/${filmId}/genres`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ genre }),
        });
        if (res.ok || res.status === 409) {
            setFilmDetails((prev) => ({
                ...prev,
                [filmId]: {
                    ...prev[filmId],
                    genres: prev[filmId]?.genres.includes(genre)
                        ? prev[filmId].genres
                        : [...(prev[filmId]?.genres ?? []), genre].sort(),
                },
            }));
            setNewGenre((prev) => ({ ...prev, [filmId]: "" }));
        }
    }

    async function removeGenre(filmId: number, genre: string) {
        const token = await getToken();
        const res = await fetch(`${base}/admin/films/${filmId}/genres/${encodeURIComponent(genre)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok || res.status === 404) {
            setFilmDetails((prev) => ({
                ...prev,
                [filmId]: { ...prev[filmId], genres: prev[filmId].genres.filter((g) => g !== genre) },
            }));
        }
    }

    async function grantCurator(userId: string) {
        setBusy(userId);
        const token = await getToken();
        await fetch(`${base}/admin/users/${userId}/curator`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: "trusted_curator" } : u))
        );
        setBusy(null);
    }

    async function revokeCurator(userId: string) {
        setBusy(userId);
        const token = await getToken();
        await fetch(`${base}/admin/users/${userId}/curator`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: "member" } : u))
        );
        setBusy(null);
    }

    async function handleSubmission(id: number, action: "approve" | "reject") {
        setBusy(String(id));
        const token = await getToken();
        await fetch(`${base}/admin/submissions/${id}/${action}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s
            )
        );
        setBusy(null);
    }

    const pending = submissions.filter((s) => s.status === "pending");

    const filteredMetaFilms = metaFilms?.filter((f) =>
        metaSearch.trim() === "" ||
        f.originalTitle.toLowerCase().includes(metaSearch.toLowerCase())
    ) ?? [];

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-zinc-800">
                {(["users", "submissions", "analytics", "scores", "metadata"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => {
                            setTab(t);
                            if (t === "analytics") loadAnalytics();
                            if (t === "metadata") loadMetaFilms();
                        }}
                        className={`px-4 py-2 text-sm capitalize transition-colors ${
                            tab === t
                                ? "border-b-2 border-lime-400 text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        {t}
                        {t === "submissions" && pending.length > 0 && (
                            <span className="ml-2 rounded-full bg-red-500/80 px-1.5 py-0.5 text-[10px] text-white">
                                {pending.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Users tab */}
            {tab === "users" && (
                <div className="space-y-3">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-100 truncate">
                                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                                    </span>
                                    {(user.role === "trusted_curator" || user.role === "admin") && (
                                        <CuratorBadge />
                                    )}
                                    {user.role === "admin" && (
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-red-400/70">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
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
            )}

            {/* Submissions tab */}
            {tab === "submissions" && (
                <div className="space-y-3">
                    {submissions.length === 0 && (
                        <p className="text-sm text-zinc-500">No submissions yet.</p>
                    )}
                    {submissions.map((sub) => (
                        <div
                            key={sub.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4"
                        >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-100">
                                        {sub.title}
                                        {sub.releaseYear ? ` (${sub.releaseYear})` : ""}
                                    </p>
                                    {sub.overview && (
                                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                                            {sub.overview}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                                        {sub.tmdbId ? ` · TMDB #${sub.tmdbId}` : ""}
                                    </p>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
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
                                        <span
                                            className={`text-xs uppercase tracking-wider ${
                                                sub.status === "approved"
                                                    ? "text-lime-400/60"
                                                    : "text-red-400/60"
                                            }`}
                                        >
                                            {sub.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics tab */}
            {tab === "analytics" && (
                <div>
                    <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Top films by views — last 7 days
                    </p>

                    {loadingAnalytics && (
                        <p className="text-sm text-zinc-500">Loading…</p>
                    )}

                    {!loadingAnalytics && topFilms !== null && topFilms.length === 0 && (
                        <p className="text-sm text-zinc-500">
                            No view data yet. Counts aggregate hourly.
                        </p>
                    )}

                    {!loadingAnalytics && topFilms && topFilms.length > 0 && (
                        <div className="space-y-1">
                            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-4 px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                <span>Film</span>
                                <span className="text-right">7d</span>
                                <span className="text-right">30d</span>
                                <span className="text-right">Total</span>
                            </div>

                            {topFilms.map((film, i) => {
                                const maxViews = topFilms[0].views7d || 1;
                                const barWidth = Math.max(4, Math.round((film.views7d / maxViews) * 100));

                                return (
                                    <div
                                        key={film.motionPictureId}
                                        className="relative grid grid-cols-[1fr_80px_80px_80px] items-center gap-4 overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3"
                                    >
                                        <div
                                            className="pointer-events-none absolute inset-y-0 left-0 bg-lime-400/5"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                        <span className="relative truncate text-sm text-zinc-200">
                                            <span className="mr-2 text-xs text-zinc-600">{i + 1}.</span>
                                            {film.originalTitle}
                                        </span>
                                        <span className="relative text-right text-sm font-semibold tabular-nums text-zinc-100">
                                            {film.views7d.toLocaleString()}
                                        </span>
                                        <span className="relative text-right text-sm tabular-nums text-zinc-400">
                                            {film.views30d.toLocaleString()}
                                        </span>
                                        <span className="relative text-right text-sm tabular-nums text-zinc-500">
                                            {film.viewsTotal.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Metadata tab */}
            {tab === "metadata" && (
                <div>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Film metadata</p>
                        <input
                            type="text"
                            placeholder="Search films…"
                            value={metaSearch}
                            onChange={(e) => setMetaSearch(e.target.value)}
                            className="w-56 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
                        />
                    </div>

                    {loadingMetaFilms && <p className="text-sm text-zinc-500">Loading…</p>}

                    {!loadingMetaFilms && metaFilms !== null && (
                        <div className="space-y-2">
                            {filteredMetaFilms.map((film) => {
                                const isExpanded = expandedMetaId === film.id;
                                const edit = metaEdits[film.id];
                                const isSaving = savingMetaId === film.id;
                                const isSaved = savedMetaIds.has(film.id);

                                return (
                                    <div
                                        key={film.id}
                                        className="rounded-xl border border-zinc-800 bg-zinc-900/50"
                                    >
                                        {/* Collapsed row */}
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-zinc-100">
                                                    {film.originalTitle}
                                                </p>
                                                <p className="text-xs text-zinc-600">
                                                    {film.releaseDate ?? "—"}
                                                    {film.runningTime && (
                                                        <span className="ml-2">{film.runningTime} min</span>
                                                    )}
                                                    {film.motionPictureRating && (
                                                        <span className="ml-2">{film.motionPictureRating}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (isExpanded) {
                                                        setExpandedMetaId(null);
                                                    } else {
                                                        setExpandedMetaId(film.id);
                                                        loadFilmDetails(film.id);
                                                    }
                                                }}
                                                className="ml-3 shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                                            >
                                                {isExpanded ? "Close" : "Edit"}
                                            </button>
                                        </div>

                                        {/* Expanded form */}
                                        {isExpanded && edit && (
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); saveMetadata(film.id); }}
                                                className="border-t border-zinc-800 px-4 pb-5 pt-4 space-y-4"
                                            >
                                                {/* Title / Alt title */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                            Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={edit.originalTitle}
                                                            onChange={(e) => setMetaEdit(film.id, "originalTitle", e.target.value)}
                                                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                            Alt title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={edit.alternativeTitle}
                                                            onChange={(e) => setMetaEdit(film.id, "alternativeTitle", e.target.value)}
                                                            placeholder="—"
                                                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Release date / Running time / Rating */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                            Release date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={edit.releaseDate}
                                                            onChange={(e) => setMetaEdit(film.id, "releaseDate", e.target.value)}
                                                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                            Running time (min)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={edit.runningTime}
                                                            onChange={(e) => setMetaEdit(film.id, "runningTime", e.target.value)}
                                                            placeholder="—"
                                                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                            Rating
                                                        </label>
                                                        <select
                                                            value={edit.motionPictureRating}
                                                            onChange={(e) => setMetaEdit(film.id, "motionPictureRating", e.target.value)}
                                                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                                                        >
                                                            {MPAA_RATINGS.map((r) => (
                                                                <option key={r} value={r}>{r || "— Select —"}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Tagline */}
                                                <div>
                                                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                        Tagline
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={edit.tagline}
                                                        onChange={(e) => setMetaEdit(film.id, "tagline", e.target.value)}
                                                        placeholder="—"
                                                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                    />
                                                </div>

                                                {/* Hook */}
                                                <div>
                                                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                        Hook{" "}
                                                        <span className="normal-case tracking-normal text-zinc-600">
                                                            (shown on cards)
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={edit.hook}
                                                        onChange={(e) => setMetaEdit(film.id, "hook", e.target.value)}
                                                        placeholder="—"
                                                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                    />
                                                </div>

                                                {/* Overview */}
                                                <div>
                                                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                        Overview
                                                    </label>
                                                    <textarea
                                                        value={edit.overview}
                                                        onChange={(e) => setMetaEdit(film.id, "overview", e.target.value)}
                                                        rows={4}
                                                        placeholder="—"
                                                        className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                    />
                                                </div>

                                                {/* Synopsis */}
                                                <div>
                                                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                        Synopsis{" "}
                                                        <span className="normal-case tracking-normal text-amber-400/60">
                                                            ⚠ spoilers — use paragraph breaks
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        value={edit.synopsis}
                                                        onChange={(e) => setMetaEdit(film.id, "synopsis", e.target.value)}
                                                        rows={8}
                                                        placeholder="—"
                                                        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500"
                                                    />
                                                </div>

                                                {/* Genres */}
                                                <div>
                                                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Genres</p>
                                                    {loadingDetails[film.id] && <p className="text-xs text-zinc-500">Loading…</p>}
                                                    {filmDetails[film.id] && (
                                                        <>
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {filmDetails[film.id].genres.map((g) => (
                                                                    <span key={g} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
                                                                        {g}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeGenre(film.id, g)}
                                                                            className="ml-1 text-zinc-500 hover:text-red-400 transition-colors"
                                                                        >×</button>
                                                                    </span>
                                                                ))}
                                                                {filmDetails[film.id].genres.length === 0 && (
                                                                    <span className="text-xs text-zinc-600">No genres</span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={newGenre[film.id] ?? ""}
                                                                    onChange={(e) => setNewGenre((prev) => ({ ...prev, [film.id]: e.target.value }))}
                                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGenre(film.id); } }}
                                                                    placeholder="Add genre…"
                                                                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addGenre(film.id)}
                                                                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                                                                >Add</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Tags */}
                                                <div>
                                                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Tags</p>
                                                    {loadingDetails[film.id] && <p className="text-xs text-zinc-500">Loading…</p>}
                                                    {filmDetails[film.id] && (
                                                        <>
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {filmDetails[film.id].tags.map((t) => (
                                                                    <span key={t.id} className="inline-flex items-center gap-1 rounded-full border border-lime-400/20 bg-lime-400/5 px-3 py-1 text-xs text-zinc-200">
                                                                        {t.name}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeTag(film.id, t.id)}
                                                                            className="ml-1 text-zinc-500 hover:text-red-400 transition-colors"
                                                                        >×</button>
                                                                    </span>
                                                                ))}
                                                                {filmDetails[film.id].tags.length === 0 && (
                                                                    <span className="text-xs text-zinc-600">No tags</span>
                                                                )}
                                                            </div>
                                                            {allTags && (() => {
                                                                const currentIds = new Set(filmDetails[film.id].tags.map((t) => t.id));
                                                                const available = allTags.filter((t) => !currentIds.has(t.id));
                                                                return available.length > 0 ? (
                                                                    <div className="flex gap-2">
                                                                        <select
                                                                            value={selectedTagId[film.id] ?? ""}
                                                                            onChange={(e) => setSelectedTagId((prev) => ({ ...prev, [film.id]: e.target.value }))}
                                                                            className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                                                                        >
                                                                            <option value="">Add a tag…</option>
                                                                            {available.map((t) => (
                                                                                <option key={t.id} value={t.id}>{t.name} ({t.tagType})</option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addTag(film.id)}
                                                                            disabled={!selectedTagId[film.id]}
                                                                            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
                                                                        >Add</button>
                                                                    </div>
                                                                ) : null;
                                                            })()}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {metaError && (
                                                    <p className="text-sm text-red-400">{metaError}</p>
                                                )}
                                                <div className="flex items-center gap-3 pt-1">
                                                    <button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                                                            isSaved
                                                                ? "border border-lime-400/30 bg-lime-400/10 text-lime-400"
                                                                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                                        }`}
                                                    >
                                                        {isSaving ? "Saving…" : isSaved ? "Saved ✓" : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedMetaId(null)}
                                                        disabled={isSaving}
                                                        className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredMetaFilms.length === 0 && metaSearch.trim() !== "" && (
                                <p className="text-sm text-zinc-500">No films match "{metaSearch}".</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

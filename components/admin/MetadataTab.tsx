"use client";

import { useEffect, useState } from "react";
import RemovablePill from "../RemovablePill";
import { PUBLIC_API_BASE } from "../../lib/config";

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

interface MetadataTabProps {
    getToken: () => Promise<string | null>;
}

const MPAA_RATINGS = ["", "G", "PG", "PG-13", "R", "NC-17", "NR", "TV-MA", "TV-14", "Unrated"];
const SAVE_SUCCESS_DURATION_MS = 2000;

function toMetaEdit(f: FilmMeta): MetaEdit {
    return {
        originalTitle:       f.originalTitle ?? "",
        alternativeTitle:    f.alternativeTitle ?? "",
        releaseDate:         f.releaseDate ?? "",
        runningTime:         f.runningTime != null ? String(f.runningTime) : "",
        motionPictureRating: f.motionPictureRating ?? "",
        tagline:             f.tagline ?? "",
        hook:                f.hook ?? "",
        overview:            f.overview ?? "",
        synopsis:            f.synopsis ?? "",
    };
}

export default function MetadataTab({ getToken }: MetadataTabProps) {
    const [metaFilms, setMetaFilms] = useState<FilmMeta[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [metaEdits, setMetaEdits] = useState<Record<number, MetaEdit>>({});
    const [expandedMetaId, setExpandedMetaId] = useState<number | null>(null);
    const [savingMetaId, setSavingMetaId] = useState<number | null>(null);
    const [savedMetaIds, setSavedMetaIds] = useState<Set<number>>(new Set());
    const [metaError, setMetaError] = useState<string | null>(null);
    const [metaSearch, setMetaSearch] = useState("");
    const [filmDetails, setFilmDetails] = useState<Record<number, FilmDetails>>({});
    const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
    const [allTags, setAllTags] = useState<TagDto[] | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<Record<number, string>>({});
    const [newGenre, setNewGenre] = useState<Record<number, string>>({});

    useEffect(() => {
        async function load() {
            const token = await getToken();
            const res = await fetch(`${PUBLIC_API_BASE}/admin/films/metadata`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data: FilmMeta[] = await res.json();
                setMetaFilms(data);
                const initial: Record<number, MetaEdit> = {};
                data.forEach((f) => { initial[f.id] = toMetaEdit(f); });
                setMetaEdits(initial);
            }
            setLoading(false);
        }
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function saveMetadata(filmId: number) {
        setSavingMetaId(filmId);
        setMetaError(null);
        try {
            const token = await getToken();
            const edit = metaEdits[filmId];
            const res = await fetch(`${PUBLIC_API_BASE}/admin/films/${filmId}/metadata`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalTitle:       edit.originalTitle       || null,
                    alternativeTitle:    edit.alternativeTitle    || null,
                    releaseDate:         edit.releaseDate         || null,
                    runningTime:         edit.runningTime !== "" ? parseInt(edit.runningTime, 10) : null,
                    motionPictureRating: edit.motionPictureRating || null,
                    tagline:             edit.tagline             || null,
                    hook:                edit.hook                || null,
                    overview:            edit.overview            || null,
                    synopsis:            edit.synopsis            || null,
                }),
            });
            if (!res.ok) { setMetaError(`Save failed (${res.status}). Has the backend been restarted?`); return; }
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
            fetch(`${PUBLIC_API_BASE}/admin/films/${filmId}/details`, { headers: { Authorization: `Bearer ${token}` } }),
            allTags === null ? fetch(`${PUBLIC_API_BASE}/tags`) : Promise.resolve(null),
        ]);
        if (detailsRes.ok) {
            const details: FilmDetails = await detailsRes.json();
            setFilmDetails((prev) => ({ ...prev, [filmId]: details }));
        }
        if (tagsRes && tagsRes.ok) setAllTags(await tagsRes.json());
        setLoadingDetails((prev) => ({ ...prev, [filmId]: false }));
    }

    async function addTag(filmId: number) {
        const tagId = selectedTagId[filmId];
        if (!tagId) return;
        const token = await getToken();
        const res = await fetch(`${PUBLIC_API_BASE}/motion-pictures/${filmId}/tags/${tagId}`, {
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
        const res = await fetch(`${PUBLIC_API_BASE}/motion-pictures/${filmId}/tags/${tagId}`, {
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
        const res = await fetch(`${PUBLIC_API_BASE}/admin/films/${filmId}/genres`, {
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
        const res = await fetch(`${PUBLIC_API_BASE}/admin/films/${filmId}/genres/${encodeURIComponent(genre)}`, {
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

    const filteredMetaFilms = metaFilms?.filter((f) =>
        metaSearch.trim() === "" || f.originalTitle.toLowerCase().includes(metaSearch.toLowerCase())
    ) ?? [];

    return (
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

            {loading && <p className="text-sm text-zinc-500">Loading…</p>}

            {!loading && metaFilms !== null && (
                <div className="space-y-2">
                    {filteredMetaFilms.map((film) => {
                        const isExpanded = expandedMetaId === film.id;
                        const edit = metaEdits[film.id];
                        const isSaving = savingMetaId === film.id;
                        const isSaved = savedMetaIds.has(film.id);

                        return (
                            <div key={film.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-100">{film.originalTitle}</p>
                                        <p className="text-xs text-zinc-600">
                                            {film.releaseDate ?? "—"}
                                            {film.runningTime && <span className="ml-2">{film.runningTime} min</span>}
                                            {film.motionPictureRating && <span className="ml-2">{film.motionPictureRating}</span>}
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

                                {isExpanded && edit && (
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); saveMetadata(film.id); }}
                                        className="space-y-4 border-t border-zinc-800 px-4 pb-5 pt-4"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Title</label>
                                                <input type="text" value={edit.originalTitle} onChange={(e) => setMetaEdit(film.id, "originalTitle", e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500" />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Alt title</label>
                                                <input type="text" value={edit.alternativeTitle} onChange={(e) => setMetaEdit(film.id, "alternativeTitle", e.target.value)} placeholder="—" className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Release date</label>
                                                <input type="date" value={edit.releaseDate} onChange={(e) => setMetaEdit(film.id, "releaseDate", e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500" />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Running time (min)</label>
                                                <input type="number" min={1} value={edit.runningTime} onChange={(e) => setMetaEdit(film.id, "runningTime", e.target.value)} placeholder="—" className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Rating</label>
                                                <select value={edit.motionPictureRating} onChange={(e) => setMetaEdit(film.id, "motionPictureRating", e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500">
                                                    {MPAA_RATINGS.map((r) => <option key={r} value={r}>{r || "— Select —"}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Tagline</label>
                                            <input type="text" value={edit.tagline} onChange={(e) => setMetaEdit(film.id, "tagline", e.target.value)} placeholder="—" className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                Hook{" "}<span className="normal-case tracking-normal text-zinc-600">(shown on cards)</span>
                                            </label>
                                            <input type="text" value={edit.hook} onChange={(e) => setMetaEdit(film.id, "hook", e.target.value)} placeholder="—" className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Overview</label>
                                            <textarea value={edit.overview} onChange={(e) => setMetaEdit(film.id, "overview", e.target.value)} rows={4} placeholder="—" className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                Synopsis{" "}<span className="normal-case tracking-normal text-amber-400/60">⚠ spoilers — use paragraph breaks</span>
                                            </label>
                                            <textarea value={edit.synopsis} onChange={(e) => setMetaEdit(film.id, "synopsis", e.target.value)} rows={8} placeholder="—" className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-zinc-500" />
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Genres</p>
                                            {loadingDetails[film.id] && <p className="text-xs text-zinc-500">Loading…</p>}
                                            {filmDetails[film.id] && (
                                                <>
                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                        {filmDetails[film.id].genres.map((g) => (
                                                            <RemovablePill key={g} label={g} onRemove={() => removeGenre(film.id, g)} />
                                                        ))}
                                                        {filmDetails[film.id].genres.length === 0 && <span className="text-xs text-zinc-600">No genres</span>}
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
                                                        <button type="button" onClick={() => addGenre(film.id)} className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200">Add</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Tags</p>
                                            {loadingDetails[film.id] && <p className="text-xs text-zinc-500">Loading…</p>}
                                            {filmDetails[film.id] && (
                                                <>
                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                        {filmDetails[film.id].tags.map((t) => (
                                                            <RemovablePill key={t.id} label={t.name} onRemove={() => removeTag(film.id, t.id)} variant="lime" />
                                                        ))}
                                                        {filmDetails[film.id].tags.length === 0 && <span className="text-xs text-zinc-600">No tags</span>}
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
                                                                    {available.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.tagType})</option>)}
                                                                </select>
                                                                <button type="button" onClick={() => addTag(film.id)} disabled={!selectedTagId[film.id]} className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40">Add</button>
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                </>
                                            )}
                                        </div>

                                        {metaError && <p className="text-sm text-red-400">{metaError}</p>}
                                        <div className="flex items-center gap-3 pt-1">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${isSaved ? "border border-lime-400/30 bg-lime-400/10 text-lime-400" : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"}`}
                                            >
                                                {isSaving ? "Saving…" : isSaved ? "Saved ✓" : "Save"}
                                            </button>
                                            <button type="button" onClick={() => setExpandedMetaId(null)} disabled={isSaving} className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        );
                    })}

                    {filteredMetaFilms.length === 0 && metaSearch.trim() !== "" && (
                        <p className="text-sm text-zinc-500">No films match &ldquo;{metaSearch}&rdquo;.</p>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TagDto } from "../types/motion-picture";
import type { MotionPictureFilterState } from "../lib/motion-picture-filters";
import { formatTagName } from "../lib/motion-picture";

const DECADES = [
    { label: "'60s", start: 1960 },
    { label: "'70s", start: 1970 },
    { label: "'80s", start: 1980 },
    { label: "'90s", start: 1990 },
    { label: "'00s", start: 2000 },
    { label: "'10s", start: 2010 },
    { label: "'20s", start: 2020 },
];

const YEARS = Array.from({ length: 2026 - 1920 + 1 }, (_, i) => 2026 - i);

const TAG_TYPE_LABELS: Record<string, string> = {
    tone: "Tone",
    subgenre: "Subgenre",
    content_warning: "Content Warnings",
    gore_level: "Gore Level",
    violence_level: "Violence Level",
    region: "Region",
    audience: "Audience",
    seasonal: "Seasonal",
    setting: "Setting",
    production: "Production",
};

const TAG_TYPE_ORDER = [
    "subgenre",
    "tone",
    "violence_level",
    "gore_level",
    "content_warning",
    "region",
    "audience",
    "seasonal",
    "setting",
    "production",
];

const SCORE_ROWS: Array<{ label: string; key: string }> = [
    { label: "Overall", key: "minScore" },
    { label: "Fear",    key: "minFearScore" },
    { label: "Atm.",    key: "minAtmosphereScore" },
    { label: "Gore",    key: "minGoreScore" },
];

type FilterMode = "include" | "exclude" | null;
type TagMatchMode = "any" | "all";
type ScoreState = Record<string, string>;
type ScoreErrors = Record<string, string>;

interface PendingTag {
    tagType: string;
    name: string;
}

interface FilterSidebarProps {
    availableGenres: string[];
    availableTags: TagDto[];
    currentFilters: MotionPictureFilterState;
}

function deriveInitialState(filters: MotionPictureFilterState) {
    const { minYear, maxYear } = filters;
    const selectedDecade =
        minYear !== null && maxYear === minYear + 9 && minYear % 10 === 0
            ? minYear
            : null;

    return {
        includeGenres: filters.includeGenres.map((g) => g.name),
        excludeGenres: filters.excludeGenres.map((g) => g.name),
        includeTags: filters.includeTags.map((t) => ({ tagType: t.tagType, name: t.name })),
        excludeTags: filters.excludeTags.map((t) => ({ tagType: t.tagType, name: t.name })),
        tagModes: { ...filters.tagModes } as Record<string, TagMatchMode>,
        selectedDecade,
        fromYear: minYear,
        toYear: maxYear,
        scores: {
            minScore:           filters.minScore?.toString()           ?? "",
            minFearScore:       filters.minFearScore?.toString()       ?? "",
            minAtmosphereScore: filters.minAtmosphereScore?.toString() ?? "",
            minGoreScore:       filters.minGoreScore?.toString()       ?? "",
        } satisfies ScoreState,
    };
}

function deriveOpenSections(filters: MotionPictureFilterState): Set<string> {
    const open = new Set<string>();
    if (filters.includeGenres.length > 0 || filters.excludeGenres.length > 0) open.add("genres");
    [...filters.includeTags, ...filters.excludeTags].forEach((t) => open.add(t.tagType));
    return open;
}

// Fingerprint of only filter-relevant fields — excludes sortBy/sortDir/page so that
// sort or pagination changes don't trigger a re-sync and wipe pending selections.
function buildFilterFingerprint(f: MotionPictureFilterState): string {
    return [
        f.query,
        f.includeGenres.map((g) => g.name).join("\0"),
        f.excludeGenres.map((g) => g.name).join("\0"),
        f.includeTags.map((t) => `${t.tagType}:${t.name}`).join("\0"),
        f.excludeTags.map((t) => `${t.tagType}:${t.name}`).join("\0"),
        Object.entries(f.tagModes).sort().map(([k, v]) => `${k}=${v}`).join("\0"),
        f.minYear ?? "", f.maxYear ?? "",
        f.minScore ?? "", f.minFearScore ?? "", f.minAtmosphereScore ?? "", f.minGoreScore ?? "",
    ].join("|");
}

function validateScore(value: string): string | null {
    if (value.trim() === "") return null;
    const n = parseFloat(value);
    if (isNaN(n)) return "Must be a number";
    if (n < 0 || n > 10) return "Must be between 0.0 and 10.0";
    return null;
}

export default function FilterSidebar({
    availableGenres,
    availableTags,
    currentFilters,
}: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const init = deriveInitialState(currentFilters);

    const [includeGenres, setIncludeGenres] = useState<string[]>(init.includeGenres);
    const [excludeGenres, setExcludeGenres] = useState<string[]>(init.excludeGenres);
    const [includeTags, setIncludeTags]     = useState<PendingTag[]>(init.includeTags);
    const [excludeTags, setExcludeTags]     = useState<PendingTag[]>(init.excludeTags);
    const [selectedDecade, setSelectedDecade] = useState<number | null>(init.selectedDecade);
    const [fromYear, setFromYear]           = useState<number | null>(init.fromYear);
    const [toYear, setToYear]               = useState<number | null>(init.toYear);
    const [tagModes, setTagModes]            = useState<Record<string, TagMatchMode>>(init.tagModes);
    const [scores, setScores]               = useState<ScoreState>(init.scores);
    const [scoreErrors, setScoreErrors]     = useState<ScoreErrors>({});
    const [openSections, setOpenSections]   = useState<Set<string>>(
        () => deriveOpenSections(currentFilters)
    );
    const isFirstRender = useRef(true);
    const yearRangeInverted = fromYear !== null && toYear !== null && fromYear > toYear;

    const appliedFilterFingerprint = useMemo(
        () => buildFilterFingerprint(currentFilters),
        [currentFilters]
    );

    useEffect(() => {
        const next = deriveInitialState(currentFilters);
        setIncludeGenres(next.includeGenres);
        setExcludeGenres(next.excludeGenres);
        setIncludeTags(next.includeTags);
        setExcludeTags(next.excludeTags);
        setTagModes(next.tagModes);
        setSelectedDecade(next.selectedDecade);
        setFromYear(next.fromYear);
        setToYear(next.toYear);
        setScores(next.scores);
        setScoreErrors({});
        setOpenSections(deriveOpenSections(currentFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilterFingerprint]);

    // Live filtering — debounced 250ms after any filter state change.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (Object.keys(scoreErrors).length > 0 || yearRangeInverted) return;

        const sortBy = searchParams.get("sortBy");
        const sortDir = searchParams.get("sortDir");
        const query = searchParams.get("query");
        const prevSearch = searchParams.toString();

        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            if (sortBy) params.set("sortBy", sortBy);
            if (sortDir) params.set("sortDir", sortDir);
            includeGenres.forEach((g) => params.append("genre", g));
            excludeGenres.forEach((g) => params.append("xgenre", g));
            includeTags.forEach((t) => params.append("tag", `${t.tagType}:${t.name}`));
            excludeTags.forEach((t) => params.append("xtag", `${t.tagType}:${t.name}`));
            Object.entries(tagModes).forEach(([type, mode]) => {
                if (mode === "all") params.set(`tagmode_${type}`, "all");
            });
            if (fromYear !== null) params.set("minYear", String(fromYear));
            if (toYear !== null) params.set("maxYear", String(toYear));
            for (const { key } of SCORE_ROWS) {
                const val = scores[key]?.trim();
                if (val) params.set(key, val);
            }
            const newSearch = params.toString();
            if (newSearch !== prevSearch) router.push(`${pathname}?${newSearch}`);
        }, 150);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includeGenres, excludeGenres, includeTags, excludeTags, tagModes, fromYear, toYear, scores, scoreErrors, yearRangeInverted, searchParams]);

    const sortedTagGroups = useMemo(() => {
        const groups = availableTags.reduce<Map<string, TagDto[]>>((acc, tag) => {
            // Skip "none" sentinel tags — they indicate absence of content and
            // aren't useful as filter options (e.g. gore-none, violence-none).
            if (formatTagName(tag.tagType, tag.name).toLowerCase() === "none") return acc;
            const group = acc.get(tag.tagType) ?? [];
            group.push(tag);
            acc.set(tag.tagType, group);
            return acc;
        }, new Map());

        // Drop sections that ended up empty after filtering.
        return Array.from(groups.entries())
            .filter(([, tags]) => tags.length > 0)
            .sort(([a], [b]) => {
                const ai = TAG_TYPE_ORDER.indexOf(a);
                const bi = TAG_TYPE_ORDER.indexOf(b);
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
            });
    }, [availableTags]);

    // ── Section open/close ─────────────────────────────────────────────────────

    function toggleSection(key: string) {
        setOpenSections((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    // ── Genre toggles ──────────────────────────────────────────────────────────

    function getGenreMode(genre: string): FilterMode {
        if (includeGenres.includes(genre)) return "include";
        if (excludeGenres.includes(genre)) return "exclude";
        return null;
    }

    function toggleGenre(genre: string) {
        const mode = getGenreMode(genre);
        if (mode === null) {
            setIncludeGenres((prev) => [...prev, genre]);
        } else if (mode === "include") {
            setIncludeGenres((prev) => prev.filter((g) => g !== genre));
            setExcludeGenres((prev) => [...prev, genre]);
        } else {
            setExcludeGenres((prev) => prev.filter((g) => g !== genre));
        }
    }

    // ── Tag toggles ────────────────────────────────────────────────────────────

    function getTagMode(tagType: string, tagName: string): FilterMode {
        if (includeTags.some((t) => t.tagType === tagType && t.name === tagName)) return "include";
        if (excludeTags.some((t) => t.tagType === tagType && t.name === tagName)) return "exclude";
        return null;
    }

    function toggleTag(tagType: string, tagName: string) {
        const mode = getTagMode(tagType, tagName);
        const isCW = tagType === "content_warning";

        if (mode === null) {
            // Normal: null → include. Content warning: null → exclude
            if (isCW) {
                setExcludeTags((prev) => [...prev, { tagType, name: tagName }]);
            } else {
                setIncludeTags((prev) => [...prev, { tagType, name: tagName }]);
            }
        } else if (mode === "include") {
            setIncludeTags((prev) =>
                prev.filter((t) => !(t.tagType === tagType && t.name === tagName))
            );
            if (!isCW) {
                // Normal: include → exclude
                setExcludeTags((prev) => [...prev, { tagType, name: tagName }]);
            }
            // Content warning: include → null (done)
        } else {
            // mode === "exclude"
            setExcludeTags((prev) =>
                prev.filter((t) => !(t.tagType === tagType && t.name === tagName))
            );
            if (isCW) {
                // Content warning: exclude → include
                setIncludeTags((prev) => [...prev, { tagType, name: tagName }]);
            }
            // Normal: exclude → null (done)
        }
    }

    // ── Year ───────────────────────────────────────────────────────────────────

    function toggleDecade(start: number) {
        if (selectedDecade === start) {
            setSelectedDecade(null);
            setFromYear(null);
            setToYear(null);
        } else {
            setSelectedDecade(start);
            setFromYear(start);
            setToYear(start + 9);
        }
    }

    function setFrom(year: number | null) { setFromYear(year); setSelectedDecade(null); }
    function setTo(year: number | null)   { setToYear(year);   setSelectedDecade(null); }

    // ── Tag match mode (Any / All per section) ────────────────────────────────

    function getSectionMatchMode(tagType: string): TagMatchMode {
        return tagModes[tagType] ?? "any";
    }

    function toggleSectionMatchMode(tagType: string) {
        setTagModes((prev) => ({
            ...prev,
            [tagType]: prev[tagType] === "all" ? "any" : "all",
        }));
    }

    // ── Score inputs ───────────────────────────────────────────────────────────

    function handleScoreChange(key: string, value: string) {
        setScores((prev) => ({ ...prev, [key]: value }));
        const error = validateScore(value);
        setScoreErrors((prev) => {
            if (!error) {
                const { [key]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: error };
        });
    }

    // ── Clear ──────────────────────────────────────────────────────────────────

    function clearFilters() {
        router.push(pathname);
    }

    const hasPendingFilters =
        includeGenres.length > 0 ||
        excludeGenres.length > 0 ||
        includeTags.length > 0 ||
        excludeTags.length > 0 ||
        Object.values(tagModes).some((m) => m === "all") ||
        fromYear !== null ||
        toYear !== null ||
        SCORE_ROWS.some(({ key }) => (scores[key] ?? "") !== "");

    const hasAppliedFilters =
        currentFilters.query !== "" ||
        currentFilters.includeGenres.length > 0 ||
        currentFilters.excludeGenres.length > 0 ||
        currentFilters.includeTags.length > 0 ||
        currentFilters.excludeTags.length > 0 ||
        Object.values(currentFilters.tagModes).some((m) => m === "all") ||
        currentFilters.minYear !== null ||
        currentFilters.maxYear !== null ||
        currentFilters.minScore !== null ||
        currentFilters.minFearScore !== null ||
        currentFilters.minAtmosphereScore !== null ||
        currentFilters.minGoreScore !== null;

    // ── Styles ─────────────────────────────────────────────────────────────────

    function pillClass(mode: FilterMode, isContentWarning = false) {
        const base = "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
        if (mode === "include") return `${base} border-lime-400/60 bg-lime-400/10 text-lime-300`;
        if (mode === "exclude") return `${base} border-red-500/50 bg-red-500/10 text-red-400 line-through`;
        if (isContentWarning)
            return `${base} border-amber-900/60 text-amber-700 hover:border-amber-700/60 hover:text-amber-500`;
        return `${base} border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200`;
    }

    function scoreInputClass(key: string) {
        const base =
            "w-20 rounded-md border px-2.5 py-1 text-[11px] bg-zinc-900 placeholder:text-zinc-600 focus:outline-none transition-colors";
        return scoreErrors[key]
            ? `${base} border-red-500 text-red-400 focus:border-red-400`
            : `${base} border-zinc-700 text-zinc-100 focus:border-lime-400/50`;
    }

    const sectionHeadingClass = "text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500";

    function summaryHeadingClass(isContentWarning = false) {
        return isContentWarning
            ? "text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 transition-colors hover:text-amber-500"
            : `${sectionHeadingClass} transition-colors hover:text-zinc-300`;
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col gap-4">

            {/* Heading */}
            <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Refine results
                </h2>
            </div>

            {/* Scrollable content — extra right padding keeps content clear of the scrollbar */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-5">

                {/* Genres */}
                <section>
                    <details open={openSections.has("genres")}>
                        <summary
                            className="mb-3 flex cursor-pointer list-none items-center gap-2"
                            onClick={(e) => { e.preventDefault(); toggleSection("genres"); }}
                        >
                            <h3 className={`${sectionHeadingClass} transition-colors hover:text-zinc-300`}>
                                Genres
                            </h3>
                            {(includeGenres.length > 0 || excludeGenres.length > 0) && (
                                <span className="rounded-full bg-lime-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-lime-400">
                                    {includeGenres.length + excludeGenres.length}
                                </span>
                            )}
                        </summary>
                        <div className="flex flex-wrap gap-2">
                            {availableGenres.map((genre) => (
                                <button
                                    key={genre}
                                    onClick={() => toggleGenre(genre)}
                                    className={pillClass(getGenreMode(genre))}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </details>
                </section>

                {/* Tag sections in explicit order */}
                {sortedTagGroups.map(([tagType, tags]) => {
                    const activeCount =
                        includeTags.filter((t) => t.tagType === tagType).length +
                        excludeTags.filter((t) => t.tagType === tagType).length;
                    const isContentWarning = tagType === "content_warning";

                    return (
                        <section key={tagType}>
                            <details open={openSections.has(tagType)}>
                                <summary
                                    className="mb-3 flex cursor-pointer list-none items-center gap-2"
                                    onClick={(e) => { e.preventDefault(); toggleSection(tagType); }}
                                >
                                    {isContentWarning && (
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 16 16"
                                            className="h-3 w-3 shrink-0 text-amber-700"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M8 1.5 L14.5 13 H1.5 Z" />
                                            <line x1="8" y1="6" x2="8" y2="9.5" />
                                            <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
                                        </svg>
                                    )}
                                    <h3 className={summaryHeadingClass(isContentWarning)}>
                                        {TAG_TYPE_LABELS[tagType] ?? tagType}
                                    </h3>
                                    {activeCount > 0 && (
                                        <span className="rounded-full bg-lime-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-lime-400">
                                            {activeCount}
                                        </span>
                                    )}
                                    {openSections.has(tagType) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSectionMatchMode(tagType); }}
                                            className="ml-auto flex items-center rounded-full border border-zinc-700 bg-zinc-950 p-[2px] transition-colors hover:border-zinc-600"
                                            title={getSectionMatchMode(tagType) === "all" ? "Matching ALL selected tags" : "Matching ANY selected tag"}
                                        >
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${getSectionMatchMode(tagType) === "any" ? "bg-zinc-600 text-zinc-100" : "text-zinc-600"}`}>
                                                Any
                                            </span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${getSectionMatchMode(tagType) === "all" ? "bg-zinc-600 text-zinc-100" : "text-zinc-600"}`}>
                                                All
                                            </span>
                                        </button>
                                    )}
                                </summary>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag.name}
                                            onClick={() => toggleTag(tagType, tag.name)}
                                            title={tag.description ?? undefined}
                                            className={pillClass(getTagMode(tagType, tag.name), isContentWarning)}
                                        >
                                            {formatTagName(tagType, tag.name)}
                                        </button>
                                    ))}
                                </div>
                            </details>
                        </section>
                    );
                })}

                {/* Year */}
                <section>
                    <h3 className={`mb-3 ${sectionHeadingClass}`}>Year</h3>

                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {DECADES.map(({ label, start }) => (
                            <button
                                key={start}
                                onClick={() => toggleDecade(start)}
                                className={
                                    selectedDecade === start
                                        ? "rounded-full border border-lime-400/60 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300 transition-colors"
                                        : "rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-600">
                                Min
                            </label>
                            <select
                                value={fromYear ?? ""}
                                onChange={(e) => setFrom(e.target.value ? Number(e.target.value) : null)}
                                className={`w-full rounded-md border bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none ${yearRangeInverted ? "border-red-500 focus:border-red-400" : "border-zinc-700 focus:border-lime-400/50"} ${fromYear !== null ? "text-zinc-100" : "text-zinc-400"}`}
                            >
                                <option value="">Any</option>
                                {YEARS.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <span className="mb-2 shrink-0 text-zinc-600">–</span>
                        <div className="flex-1">
                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-600">
                                Max
                            </label>
                            <select
                                value={toYear ?? ""}
                                onChange={(e) => setTo(e.target.value ? Number(e.target.value) : null)}
                                className={`w-full rounded-md border bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none ${yearRangeInverted ? "border-red-500 focus:border-red-400" : "border-zinc-700 focus:border-lime-400/50"} ${toYear !== null ? "text-zinc-100" : "text-zinc-400"}`}
                            >
                                <option value="">Any</option>
                                {YEARS.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {yearRangeInverted && (
                        <p className="mt-1.5 text-[10px] text-red-400">Min year must be before max year</p>
                    )}
                </section>

                {/* Min score thresholds — range 0.0–10.0 */}
                <section>
                    <h3 className={`mb-3 ${sectionHeadingClass}`}>Min Scores</h3>
                    <div className="space-y-2">
                        {SCORE_ROWS.map(({ label, key }) => (
                            <div key={key}>
                                <div className="flex items-center gap-3">
                                    <span className="w-14 shrink-0 text-[11px] text-zinc-500">
                                        {label}
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="—"
                                        value={scores[key] ?? ""}
                                        onChange={(e) => handleScoreChange(key, e.target.value)}
                                        className={scoreInputClass(key)}
                                    />
                                </div>
                                {scoreErrors[key] && (
                                    <p className="mt-1 pl-[68px] text-[10px] text-red-400">
                                        {scoreErrors[key]}
                                    </p>
                                )}
                            </div>
                        ))}
                        <p className="pt-1 text-[10px] text-zinc-600">0.0 – 10.0</p>
                    </div>
                </section>
            </div>

            {(hasPendingFilters || hasAppliedFilters) && (
                <div className="border-t border-zinc-800 pt-4">
                    <button
                        onClick={clearFilters}
                        className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}

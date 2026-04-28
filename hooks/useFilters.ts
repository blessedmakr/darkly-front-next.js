"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { MotionPictureFilterState } from "../lib/motion-picture-filters";

export type FilterMode = "include" | "exclude" | null;
export type TagMatchMode = "any" | "all";
export type ScoreKey = "minScore" | "minFearScore" | "minAtmosphereScore" | "minGoreScore";
export type ScoreState = Record<ScoreKey, string>;
export type ScoreErrors = Partial<Record<ScoreKey, string>>;

export interface PendingTag {
    tagType: string;
    name: string;
}

export const SCORE_ROWS: Array<{ label: string; key: ScoreKey }> = [
    { label: "Overall", key: "minScore" },
    { label: "Fear",    key: "minFearScore" },
    { label: "Atm.",    key: "minAtmosphereScore" },
    { label: "Gore",    key: "minGoreScore" },
];

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

// Fingerprint of filter-relevant fields only — excludes sortBy/sortDir/page so that
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

export function useFilters(currentFilters: MotionPictureFilterState) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [includeGenres, setIncludeGenres] = useState<string[]>(() => deriveInitialState(currentFilters).includeGenres);
    const [excludeGenres, setExcludeGenres] = useState<string[]>(() => deriveInitialState(currentFilters).excludeGenres);
    const [includeTags, setIncludeTags]     = useState<PendingTag[]>(() => deriveInitialState(currentFilters).includeTags);
    const [excludeTags, setExcludeTags]     = useState<PendingTag[]>(() => deriveInitialState(currentFilters).excludeTags);
    const [tagModes, setTagModes]           = useState<Record<string, TagMatchMode>>(() => deriveInitialState(currentFilters).tagModes);
    const [selectedDecade, setSelectedDecade] = useState<number | null>(() => deriveInitialState(currentFilters).selectedDecade);
    const [fromYear, setFromYear]           = useState<number | null>(() => deriveInitialState(currentFilters).fromYear);
    const [toYear, setToYear]               = useState<number | null>(() => deriveInitialState(currentFilters).toYear);
    const [scores, setScores]               = useState<ScoreState>(() => deriveInitialState(currentFilters).scores);
    const [scoreErrors, setScoreErrors]     = useState<ScoreErrors>({});
    const [openSections, setOpenSections]   = useState<Set<string>>(
        () => deriveOpenSections(currentFilters)
    );

    const isFirstRender = useRef(true);
    const searchParamsRef = useRef(searchParams);
    useEffect(() => { searchParamsRef.current = searchParams; }, [searchParams]);

    const yearRangeInverted = fromYear !== null && toYear !== null && fromYear > toYear;

    const appliedFilterFingerprint = useMemo(
        () => buildFilterFingerprint(currentFilters),
        [currentFilters]
    );

    // O(1) mode lookups for pill rendering (was O(n) per pill via .includes/.some).
    // Insertion order matters: include is set last so it wins on key collision,
    // matching the original include-first lookup precedence.
    const genreModeMap = useMemo(() => {
        const m = new Map<string, Exclude<FilterMode, null>>();
        excludeGenres.forEach((g) => m.set(g, "exclude"));
        includeGenres.forEach((g) => m.set(g, "include"));
        return m;
    }, [includeGenres, excludeGenres]);

    const tagModeMap = useMemo(() => {
        const m = new Map<string, Exclude<FilterMode, null>>();
        excludeTags.forEach((t) => m.set(`${t.tagType}:${t.name}`, "exclude"));
        includeTags.forEach((t) => m.set(`${t.tagType}:${t.name}`, "include"));
        return m;
    }, [includeTags, excludeTags]);

    // Single-pass count by tag type (was .filter().length per section, per render).
    const tagCountsByType = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of includeTags) counts.set(t.tagType, (counts.get(t.tagType) ?? 0) + 1);
        for (const t of excludeTags) counts.set(t.tagType, (counts.get(t.tagType) ?? 0) + 1);
        return counts;
    }, [includeTags, excludeTags]);

    // Sync local state when external filter changes arrive (e.g. URL cleared).
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
        // Merge so sections the user manually opened (with no selections yet) survive
        // URL changes from the live-update round-trip. Sections with new selections still open.
        setOpenSections((prev) => {
            const merged = new Set(prev);
            deriveOpenSections(currentFilters).forEach((s) => merged.add(s));
            return merged;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilterFingerprint]);

    // Live filtering — debounced 150ms after any filter state change.
    // searchParams is read via ref so URL changes (e.g. pagination) don't retrigger this.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (Object.keys(scoreErrors).length > 0 || yearRangeInverted) return;

        const sortBy = searchParamsRef.current.get("sortBy");
        const sortDir = searchParamsRef.current.get("sortDir");
        const query = searchParamsRef.current.get("query");
        const prevSearch = searchParamsRef.current.toString();

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
                const val = scores[key].trim();
                if (val) params.set(key, val);
            }
            const newSearch = params.toString();
            if (newSearch !== prevSearch) router.push(`${pathname}?${newSearch}`);
        }, 150);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includeGenres, excludeGenres, includeTags, excludeTags, tagModes, fromYear, toYear, scores, scoreErrors, yearRangeInverted]);

    // ── Genre handlers ─────────────────────────────────────────────────────────

    function getGenreMode(genre: string): FilterMode {
        return genreModeMap.get(genre) ?? null;
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

    // ── Tag handlers ───────────────────────────────────────────────────────────

    function getTagMode(tagType: string, tagName: string): FilterMode {
        return tagModeMap.get(`${tagType}:${tagName}`) ?? null;
    }

    function toggleTag(tagType: string, tagName: string) {
        const mode = getTagMode(tagType, tagName);
        const isCW = tagType === "content_warning";
        if (mode === null) {
            if (isCW) {
                setExcludeTags((prev) => [...prev, { tagType, name: tagName }]);
            } else {
                setIncludeTags((prev) => [...prev, { tagType, name: tagName }]);
            }
        } else if (mode === "include") {
            setIncludeTags((prev) => prev.filter((t) => !(t.tagType === tagType && t.name === tagName)));
            if (!isCW) setExcludeTags((prev) => [...prev, { tagType, name: tagName }]);
        } else {
            setExcludeTags((prev) => prev.filter((t) => !(t.tagType === tagType && t.name === tagName)));
            if (isCW) setIncludeTags((prev) => [...prev, { tagType, name: tagName }]);
        }
    }

    // ── Year handlers ──────────────────────────────────────────────────────────

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

    // ── Tag match mode ─────────────────────────────────────────────────────────

    function getSectionMatchMode(tagType: string): TagMatchMode {
        return tagModes[tagType] ?? "any";
    }

    function toggleSectionMatchMode(tagType: string) {
        setTagModes((prev) => ({
            ...prev,
            [tagType]: prev[tagType] === "all" ? "any" : "all",
        }));
    }

    // ── Score handlers ─────────────────────────────────────────────────────────

    function handleScoreChange(key: ScoreKey, value: string) {
        setScores((prev) => ({ ...prev, [key]: value }));
        const error = validateScore(value);
        setScoreErrors((prev) => {
            if (!error) {
                const { [key]: _, ...rest } = prev;
                return rest as ScoreErrors;
            }
            return { ...prev, [key]: error };
        });
    }

    // ── Section open/close ─────────────────────────────────────────────────────

    function toggleSection(key: string) {
        setOpenSections((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    // ── Clear ──────────────────────────────────────────────────────────────────

    function clearFilters() {
        // Explicit reset: the sync effect only ever opens sections (never closes),
        // so Clear must collapse them itself.
        setOpenSections(new Set());
        router.push(pathname);
    }

    // ── Derived ────────────────────────────────────────────────────────────────

    const hasPendingFilters =
        includeGenres.length > 0 ||
        excludeGenres.length > 0 ||
        includeTags.length > 0 ||
        excludeTags.length > 0 ||
        Object.values(tagModes).some((m) => m === "all") ||
        fromYear !== null ||
        toYear !== null ||
        SCORE_ROWS.some(({ key }) => scores[key] !== "");

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

    return {
        includeGenres, excludeGenres, includeTags, excludeTags, tagModes,
        selectedDecade, fromYear, toYear, scores, scoreErrors, openSections,
        yearRangeInverted, hasPendingFilters, hasAppliedFilters,
        tagCountsByType,
        toggleGenre, getGenreMode, toggleTag, getTagMode,
        toggleDecade, setFrom, setTo,
        getSectionMatchMode, toggleSectionMatchMode,
        handleScoreChange, clearFilters, toggleSection,
    };
}

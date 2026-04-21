import type { TagDto } from "../types/motion-picture";

export type TagType = TagDto["tagType"];

export interface FilterValue {
    name: string;
}

export interface TagFilterValue {
    name: string;
    tagType: TagType;
}

export type SortBy = "releaseDate" | "fearScore" | "goreScore" | "atmosphereScore" | "score" | "id";
export type SortDir = "asc" | "desc";

export interface MotionPictureFilterState {
    query: string;
    includeGenres: FilterValue[];
    excludeGenres: FilterValue[];
    includeTags: TagFilterValue[];
    excludeTags: TagFilterValue[];
    /** Per-type match mode. "any" = OR within type (default); "all" = AND within type. */
    tagModes: Record<string, "any" | "all">;
    minYear: number | null;
    maxYear: number | null;
    minScore: number | null;
    minFearScore: number | null;
    minAtmosphereScore: number | null;
    minGoreScore: number | null;
    minMedianScore: number | null;
    sortBy: SortBy;
    sortDir: SortDir;
}

export const EMPTY_FILTER_STATE: MotionPictureFilterState = {
    query: "",
    includeGenres: [],
    excludeGenres: [],
    includeTags: [],
    excludeTags: [],
    tagModes: {},
    minYear: null,
    maxYear: null,
    minScore: null,
    minFearScore: null,
    minAtmosphereScore: null,
    minGoreScore: null,
    minMedianScore: null,
    sortBy: "releaseDate",
    sortDir: "desc",
};

export interface MotionPictureSearchRequestDto {
    query: string;
    includeGenres: string[];
    excludeGenres: string[];
    includeTags: Array<{ name: string; tagType: TagType }>;
    excludeTags: Array<{ name: string; tagType: TagType }>;
    /** Per-type match mode. Absent = "any" (OR). "all" = AND within that type. */
    includeTagModes?: Record<string, string>;
    minReleaseYear?: number;
    maxReleaseYear?: number;
    minScore?: number;
    minFearScore?: number;
    minAtmosphereScore?: number;
    minGoreScore?: number;
    minMedianScore?: number;
    sortBy: SortBy;
    sortDir: SortDir;
    page: number;
    pageSize: number;
}

// ─── URL parsing ──────────────────────────────────────────────────────────────

type RawParams = Record<string, string | string[] | undefined>;

function getStrings(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function parseIntParam(value: string | string[] | undefined): number | null {
    const str = Array.isArray(value) ? value[0] : value;
    if (!str) return null;
    const n = parseInt(str, 10);
    return Number.isFinite(n) ? n : null;
}

function parseNumberParam(value: string | string[] | undefined): number | null {
    const str = Array.isArray(value) ? value[0] : value;
    if (!str) return null;
    const n = parseFloat(str);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(10, n));
}

const VALID_SORT_BY: SortBy[] = ["releaseDate", "fearScore", "goreScore", "atmosphereScore", "score"];

function parseSortBy(value: string | string[] | undefined): SortBy {
    const str = Array.isArray(value) ? value[0] : value;
    return VALID_SORT_BY.includes(str as SortBy) ? (str as SortBy) : "releaseDate";
}

function parseSortDir(value: string | string[] | undefined): SortDir {
    const str = Array.isArray(value) ? value[0] : value;
    return str === "asc" ? "asc" : "desc";
}

const VALID_TAG_TYPES = new Set<string>([
    "tone", "subgenre", "content_warning", "gore_level",
    "violence_level", "setting", "audience", "seasonal", "region", "production",
]);

function parseTagParam(raw: string): TagFilterValue | null {
    const i = raw.indexOf(":");
    if (i === -1 || i === raw.length - 1) return null;
    const tagType = raw.slice(0, i);
    if (!VALID_TAG_TYPES.has(tagType)) return null;
    return { tagType: tagType as TagType, name: raw.slice(i + 1) };
}

export function parseSearchParamsToFilters(params: RawParams): {
    filters: MotionPictureFilterState;
    page: number;
} {
    // Parse tagmode_<type>=all entries from URL params
    const tagModes: Record<string, "any" | "all"> = {};
    for (const key of Object.keys(params)) {
        if (key.startsWith("tagmode_")) {
            const tagType = key.slice("tagmode_".length);
            const value = Array.isArray(params[key]) ? params[key][0] : params[key];
            if (value === "all") tagModes[tagType] = "all";
        }
    }

    return {
        filters: {
            query: typeof params.query === "string" ? params.query.trim() : "",
            includeGenres: getStrings(params.genre).map((name) => ({ name })),
            excludeGenres: getStrings(params.xgenre).map((name) => ({ name })),
            includeTags: getStrings(params.tag)
                .map(parseTagParam)
                .filter((t): t is TagFilterValue => t !== null),
            excludeTags: getStrings(params.xtag)
                .map(parseTagParam)
                .filter((t): t is TagFilterValue => t !== null),
            tagModes,
            minYear: parseIntParam(params.minYear),
            maxYear: parseIntParam(params.maxYear),
            minScore: parseNumberParam(params.minScore),
            minFearScore: parseNumberParam(params.minFearScore),
            minAtmosphereScore: parseNumberParam(params.minAtmosphereScore),
            minGoreScore: parseNumberParam(params.minGoreScore),
            minMedianScore: parseNumberParam(params.minMedianScore),
            sortBy: parseSortBy(params.sortBy),
            sortDir: parseSortDir(params.sortDir),
        },
        page: Math.max(1, parseIntParam(params.page) ?? 1),
    };
}

export function hasActiveFilters(filters: MotionPictureFilterState): boolean {
    return (
        filters.includeGenres.length > 0 ||
        filters.excludeGenres.length > 0 ||
        filters.includeTags.length > 0 ||
        filters.excludeTags.length > 0 ||
        Object.values(filters.tagModes).some((m) => m === "all") ||
        filters.minYear !== null ||
        filters.maxYear !== null ||
        filters.minScore !== null ||
        filters.minFearScore !== null ||
        filters.minAtmosphereScore !== null ||
        filters.minGoreScore !== null ||
        filters.minMedianScore !== null
    );
}

// ─── API request mapping ──────────────────────────────────────────────────────

function normalizeString(value: string): string {
    return value.trim();
}

function dedupeStrings(values: string[]): string[] {
    const seen = new Set<string>();
    return values.filter((value) => {
        const normalized = normalizeString(value);
        if (!normalized) return false;
        const key = normalized.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function dedupeTagObjects(
    values: Array<{ name: string; tagType: TagType }>
): Array<{ name: string; tagType: TagType }> {
    const seen = new Set<string>();
    return values.filter((value) => {
        const normalizedName = normalizeString(value.name);
        if (!normalizedName) return false;
        const key = `${value.tagType}:${normalizedName}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function mapFiltersToMotionPictureSearchRequest(
    filters: MotionPictureFilterState,
    options?: { page?: number; pageSize?: number }
): MotionPictureSearchRequestDto {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 24;

    const dto: MotionPictureSearchRequestDto = {
        query: normalizeString(filters.query),
        includeGenres: dedupeStrings(
            filters.includeGenres.map((g) => normalizeString(g.name))
        ),
        excludeGenres: dedupeStrings(
            filters.excludeGenres.map((g) => normalizeString(g.name))
        ),
        includeTags: dedupeTagObjects(
            filters.includeTags.map((t) => ({
                tagType: t.tagType,
                name: normalizeString(t.name),
            }))
        ),
        excludeTags: dedupeTagObjects(
            filters.excludeTags.map((t) => ({
                tagType: t.tagType,
                name: normalizeString(t.name),
            }))
        ),
        page,
        pageSize,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
    };

    // Only include modes that are explicitly "all" — backend defaults absent keys to "any"
    const allModes = Object.entries(filters.tagModes).filter(([, v]) => v === "all");
    if (allModes.length > 0) {
        dto.includeTagModes = Object.fromEntries(allModes);
    }

    if (filters.minYear !== null) dto.minReleaseYear = filters.minYear;
    if (filters.maxYear !== null) dto.maxReleaseYear = filters.maxYear;
    if (filters.minScore !== null) dto.minScore = filters.minScore;
    if (filters.minFearScore !== null) dto.minFearScore = filters.minFearScore;
    if (filters.minAtmosphereScore !== null) dto.minAtmosphereScore = filters.minAtmosphereScore;
    if (filters.minGoreScore !== null) dto.minGoreScore = filters.minGoreScore;
    if (filters.minMedianScore !== null) dto.minMedianScore = filters.minMedianScore;

    return dto;
}

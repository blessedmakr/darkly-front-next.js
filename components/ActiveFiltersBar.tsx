"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatTagName } from "../lib/motion-picture";

interface Pill {
    key: string;
    label: string;
    onRemove: () => void;
}

export default function ActiveFiltersBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function navigate(updater: (p: URLSearchParams) => void) {
        const params = new URLSearchParams(searchParams.toString());
        updater(params);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    const pills: Pill[] = [];

    const query = searchParams.get("query");
    if (query) {
        pills.push({
            key: "query",
            label: `"${query}"`,
            onRemove: () => navigate((p) => p.delete("query")),
        });
    }

    searchParams.getAll("genre").forEach((genre) => {
        pills.push({
            key: `genre:${genre}`,
            label: genre,
            onRemove: () => navigate((p) => {
                const rest = p.getAll("genre").filter((g) => g !== genre);
                p.delete("genre");
                rest.forEach((g) => p.append("genre", g));
            }),
        });
    });

    searchParams.getAll("xgenre").forEach((genre) => {
        pills.push({
            key: `xgenre:${genre}`,
            label: `not: ${genre}`,
            onRemove: () => navigate((p) => {
                const rest = p.getAll("xgenre").filter((g) => g !== genre);
                p.delete("xgenre");
                rest.forEach((g) => p.append("xgenre", g));
            }),
        });
    });

    searchParams.getAll("tag").forEach((raw) => {
        const i = raw.indexOf(":");
        if (i === -1) return;
        const tagType = raw.slice(0, i);
        const name = raw.slice(i + 1);
        pills.push({
            key: `tag:${raw}`,
            label: formatTagName(tagType, name),
            onRemove: () => navigate((p) => {
                const rest = p.getAll("tag").filter((t) => t !== raw);
                p.delete("tag");
                rest.forEach((t) => p.append("tag", t));
                if (rest.filter((t) => t.startsWith(`${tagType}:`)).length === 0) {
                    p.delete(`tagmode_${tagType}`);
                }
            }),
        });
    });

    searchParams.getAll("xtag").forEach((raw) => {
        const i = raw.indexOf(":");
        if (i === -1) return;
        const tagType = raw.slice(0, i);
        const name = raw.slice(i + 1);
        pills.push({
            key: `xtag:${raw}`,
            label: `not: ${formatTagName(tagType, name)}`,
            onRemove: () => navigate((p) => {
                const rest = p.getAll("xtag").filter((t) => t !== raw);
                p.delete("xtag");
                rest.forEach((t) => p.append("xtag", t));
            }),
        });
    });

    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    if (minYear || maxYear) {
        const label = minYear && maxYear ? `${minYear}–${maxYear}`
            : minYear ? `from ${minYear}`
            : `until ${maxYear}`;
        pills.push({
            key: "year",
            label,
            onRemove: () => navigate((p) => { p.delete("minYear"); p.delete("maxYear"); }),
        });
    }

    const SCORE_LABELS: Record<string, string> = {
        minScore: "Score",
        minFearScore: "Fear",
        minGoreScore: "Gore",
        minAtmosphereScore: "Atm.",
    };
    Object.entries(SCORE_LABELS).forEach(([key, label]) => {
        const val = searchParams.get(key);
        if (val) {
            pills.push({
                key,
                label: `${label} ≥ ${val}`,
                onRemove: () => navigate((p) => p.delete(key)),
            });
        }
    });

    if (pills.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
            <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-600">
                Refined by
            </span>
            {pills.map((pill) => (
                <button
                    key={pill.key}
                    onClick={pill.onRemove}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-red-500/50 hover:text-red-400"
                >
                    {pill.label}
                    <span aria-hidden="true">✕</span>
                </button>
            ))}
            <button
                onClick={() => router.push(pathname)}
                className="text-xs text-zinc-600 transition-colors hover:text-red-400"
            >
                Clear all
            </button>
        </div>
    );
}

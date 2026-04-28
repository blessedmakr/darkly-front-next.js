"use client";

import { useEffect, useState } from "react";
import { useAuthedFetch } from "../../hooks/useAuthedFetch";

interface FilmViewStat {
    motionPictureId: number;
    originalTitle: string;
    views7d: number;
    views30d: number;
    viewsTotal: number;
}

export default function AnalyticsTab() {
    const authedFetch = useAuthedFetch();
    const [topFilms, setTopFilms] = useState<FilmViewStat[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authedFetch(`/admin/analytics/top-films`)
            .then((res) => res.ok ? res.json() : null)
            .then((data) => { if (data) setTopFilms(data); })
            .finally(() => setLoading(false));
    }, [authedFetch]);

    return (
        <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Top films by views — last 7 days
            </p>

            {loading && <p className="text-sm text-zinc-500">Loading…</p>}

            {!loading && topFilms !== null && topFilms.length === 0 && (
                <p className="text-sm text-zinc-500">No view data yet. Counts aggregate hourly.</p>
            )}

            {!loading && topFilms && topFilms.length > 0 && (
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
                                <div className="pointer-events-none absolute inset-y-0 left-0 bg-lime-400/5" style={{ width: `${barWidth}%` }} />
                                <span className="relative truncate text-sm text-zinc-200">
                                    <span className="mr-2 text-xs text-zinc-600">{i + 1}.</span>
                                    {film.originalTitle}
                                </span>
                                <span className="relative text-right text-sm font-semibold tabular-nums text-zinc-100">{film.views7d.toLocaleString()}</span>
                                <span className="relative text-right text-sm tabular-nums text-zinc-400">{film.views30d.toLocaleString()}</span>
                                <span className="relative text-right text-sm tabular-nums text-zinc-500">{film.viewsTotal.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

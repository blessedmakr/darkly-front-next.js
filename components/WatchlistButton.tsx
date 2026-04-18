"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface WatchlistButtonProps {
    motionPictureId: number;
}

export default function WatchlistButton({ motionPictureId }: WatchlistButtonProps) {
    const { getToken, isSignedIn } = useAuth();
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        if (!isSignedIn) {
            setLoading(false);
            return;
        }
        getToken().then((token) => {
            return fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/${motionPictureId}/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }).then((res) => {
            if (!res.ok) return;
            return res.json();
          }).then((data) => { if (data) setInWatchlist(data.inWatchlist); })
          .catch(() => {})
          .finally(() => setLoading(false));
    }, [isSignedIn, motionPictureId, getToken]);

    async function toggle() {
        if (!isSignedIn || toggling) return;
        setToggling(true);
        try {
            const token = await getToken();
            if (inWatchlist) {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/${motionPictureId}`,
                    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
                );
                setInWatchlist(false);
            } else {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/watchlist/${motionPictureId}`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                );
                setInWatchlist(true);
            }
        } finally {
            setToggling(false);
        }
    }

    if (!isSignedIn) return null;
    if (loading) return <div className="h-9 w-36 rounded-md bg-zinc-800/50 animate-pulse" />;

    return (
        <button
            onClick={toggle}
            disabled={toggling}
            className={[
                "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                inWatchlist
                    ? "border-lime-400/40 bg-lime-400/10 text-lime-400 hover:bg-lime-400/20"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
            ].join(" ")}
        >
            {inWatchlist ? (
                <>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    In watchlist
                </>
            ) : (
                <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Add to watchlist
                </>
            )}
        </button>
    );
}

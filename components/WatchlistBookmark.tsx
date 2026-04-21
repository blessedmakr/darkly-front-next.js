"use client";

import { useState, useEffect } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

interface WatchlistBookmarkProps {
    motionPictureId: number;
}

export default function WatchlistBookmark({ motionPictureId }: WatchlistBookmarkProps) {
    const { getToken, isSignedIn } = useAuth();
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    useEffect(() => {
        if (!isSignedIn) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        getToken()
            .then((token) =>
                fetch(`${API}/watchlist/${motionPictureId}/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => { if (data && !cancelled) setInWatchlist(data.inWatchlist); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [isSignedIn, motionPictureId, getToken, API]);

    async function toggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn || toggling) return;
        const optimistic = !inWatchlist;
        setInWatchlist(optimistic);
        setToggling(true);
        try {
            const token = await getToken();
            await fetch(`${API}/watchlist/${motionPictureId}`, {
                method: inWatchlist ? "DELETE" : "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            setInWatchlist(!optimistic);
        } finally {
            setToggling(false);
        }
    }

    const baseClass =
        "flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-50";

    if (!isSignedIn) {
        return (
            <SignInButton mode="modal">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className={`${baseClass} bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 backdrop-blur-sm`}
                    aria-label="Sign in to add to watchlist"
                >
                    <BookmarkIcon filled={false} />
                </button>
            </SignInButton>
        );
    }

    if (loading) {
        return (
            <div className={`${baseClass} bg-zinc-900/80 backdrop-blur-sm`}>
                <div className="h-4 w-4 rounded bg-zinc-700 animate-pulse" />
            </div>
        );
    }

    return (
        <button
            onClick={toggle}
            disabled={toggling}
            className={`${baseClass} backdrop-blur-sm ${
                inWatchlist
                    ? "bg-lime-400/20 text-lime-400 hover:bg-lime-400/30"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-100"
            }`}
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
            <BookmarkIcon filled={inWatchlist} />
        </button>
    );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
    return filled ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
    ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
    );
}

"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useWatchlist } from "./WatchlistProvider";
import { useToast } from "./ToastProvider";

interface WatchlistBookmarkProps {
    motionPictureId: number;
}

export default function WatchlistBookmark({ motionPictureId }: WatchlistBookmarkProps) {
    const { isSignedIn } = useAuth();
    const { isLoaded, isWatchlisted, toggle } = useWatchlist();
    const { showToast } = useToast();
    const [toggling, setToggling] = useState(false);

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (toggling) return;
        setToggling(true);
        try {
            const result = await toggle(motionPictureId);
            if (result === "added") {
                showToast("Added to watchlist. Seen it already?", {
                    href: `/motion-pictures/${motionPictureId}`,
                    linkLabel: "Rate it",
                });
            }
        } catch {
            // toggle rolls back internally on failure
        } finally {
            setToggling(false);
        }
    }

    const baseClass =
        "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all disabled:opacity-50";

    if (!isSignedIn) {
        return (
            <SignInButton mode="modal">
                <button
                    className={`${baseClass} bg-zinc-900/80 text-zinc-400 hover:text-zinc-100`}
                    aria-label="Sign in to add to watchlist"
                >
                    <BookmarkIcon filled={false} />
                </button>
            </SignInButton>
        );
    }

    if (!isLoaded) {
        return (
            <div className={`${baseClass} bg-zinc-900/80`}>
                <div className="h-4 w-4 rounded bg-zinc-700 animate-pulse" />
            </div>
        );
    }

    const inWatchlist = isWatchlisted(motionPictureId);

    return (
        <button
            onClick={handleToggle}
            disabled={toggling}
            className={`${baseClass} ${
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

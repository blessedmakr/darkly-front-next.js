"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useFavorites } from "./UserDataProvider";
import { useToast } from "./ToastProvider";

interface FavoriteHeartButtonProps {
    motionPictureId: number;
}

export default function FavoriteHeartButton({ motionPictureId }: FavoriteHeartButtonProps) {
    const { isSignedIn } = useAuth();
    const { isLoaded, isFavorited, toggle } = useFavorites();
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
                showToast("Added to favorites.", {
                    href: "/favorites",
                    linkLabel: "View favorites",
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
                    aria-label="Sign in to add to favorites"
                >
                    <HeartIcon filled={false} />
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

    const inFavorites = isFavorited(motionPictureId);

    return (
        <button
            onClick={handleToggle}
            disabled={toggling}
            className={`${baseClass} ${
                inFavorites
                    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-100"
            }`}
            aria-label={inFavorites ? "Remove from favorites" : "Add to favorites"}
        >
            <HeartIcon filled={inFavorites} />
        </button>
    );
}

function HeartIcon({ filled }: { filled: boolean }) {
    return filled ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
            />
        </svg>
    ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
        </svg>
    );
}

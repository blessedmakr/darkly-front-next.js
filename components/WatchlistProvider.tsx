"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface WatchlistContextValue {
    isLoaded: boolean;
    isWatchlisted: (id: number) => boolean;
    toggle: (id: number) => Promise<"added" | "removed">;
}

const WatchlistContext = createContext<WatchlistContextValue>({
    isLoaded: false,
    isWatchlisted: () => false,
    toggle: async () => "added",
});

export function useWatchlist() {
    return useContext(WatchlistContext);
}

export default function WatchlistProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn } = useAuth();
    const [ids, setIds] = useState<Set<number>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!isSignedIn || fetchedRef.current) return;
        fetchedRef.current = true;

        getToken().then((token) =>
            fetch(`${API}/watchlist/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ).then((res) => (res.ok ? res.json() : []))
        .then((items: Array<{ motionPictureId: number }>) => {
            setIds(new Set(items.map((i) => i.motionPictureId)));
        })
        .catch(() => {})
        .finally(() => setIsLoaded(true));
    }, [isSignedIn, getToken]);

    // Mark loaded immediately for signed-out users — no fetch needed.
    useEffect(() => {
        if (isSignedIn === false) setIsLoaded(true);
    }, [isSignedIn]);

    const isWatchlisted = useCallback((id: number) => ids.has(id), [ids]);

    const toggle = useCallback(async (id: number): Promise<"added" | "removed"> => {
        const adding = !ids.has(id);

        // Optimistic update.
        setIds((prev) => {
            const next = new Set(prev);
            adding ? next.add(id) : next.delete(id);
            return next;
        });

        try {
            const token = await getToken();
            const res = await fetch(`${API}/watchlist/${id}`, {
                method: adding ? "POST" : "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok && res.status !== 409) throw new Error("toggle failed");
        } catch {
            // Roll back on failure.
            setIds((prev) => {
                const next = new Set(prev);
                adding ? next.delete(id) : next.add(id);
                return next;
            });
            throw new Error("toggle failed");
        }

        return adding ? "added" : "removed";
    }, [ids, getToken]);

    return (
        <WatchlistContext.Provider value={{ isLoaded, isWatchlisted, toggle }}>
            {children}
        </WatchlistContext.Provider>
    );
}

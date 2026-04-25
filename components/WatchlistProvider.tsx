"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PUBLIC_API_BASE as API } from "../lib/config";

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
    const { getToken, isSignedIn, userId } = useAuth();
    const [ids, setIds] = useState<Set<number>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);
    const fetchedForRef = useRef<string | null>(null);

    useEffect(() => {
        // Sign-out or user change: reset state so re-sign-in fetches fresh data.
        if (!isSignedIn || !userId) {
            setIds(new Set());
            setIsLoaded(true);
            fetchedForRef.current = null;
            return;
        }

        if (fetchedForRef.current === userId) return;
        fetchedForRef.current = userId;

        setIsLoaded(false);
        getToken()
            .then((token) =>
                fetch(`${API}/watchlist/mine`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
            .then((res) => (res.ok ? res.json() : []))
            .then((items: Array<{ motionPictureId: number }>) => {
                setIds(new Set(items.map((i) => i.motionPictureId)));
            })
            .catch(() => {})
            .finally(() => setIsLoaded(true));
    }, [isSignedIn, userId, getToken]);

    const isWatchlisted = useCallback((id: number) => ids.has(id), [ids]);

    const toggle = useCallback(async (id: number): Promise<"added" | "removed"> => {
        const adding = !ids.has(id);

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

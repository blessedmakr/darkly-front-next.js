"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PUBLIC_API_BASE as API } from "../lib/config";
import type { FavoriteItemResponseDto } from "../types/favorites";

interface FavoritesContextValue {
    isLoaded: boolean;
    isFavorited: (id: number) => boolean;
    toggle: (id: number) => Promise<"added" | "removed">;
    reorder: (id: number, position: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
    isLoaded: false,
    isFavorited: () => false,
    toggle: async () => "added",
    reorder: async () => {},
});

export function useFavorites() {
    return useContext(FavoritesContext);
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn, userId } = useAuth();
    const [ids, setIds] = useState<Set<number>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);
    const fetchedForRef = useRef<string | null>(null);

    useEffect(() => {
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
                fetch(`${API}/favorites/mine`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
            .then((res) => (res.ok ? res.json() : []))
            .then((items: FavoriteItemResponseDto[]) => {
                setIds(new Set(items.map((i) => i.motionPictureId)));
            })
            .catch(() => {})
            .finally(() => setIsLoaded(true));
    }, [isSignedIn, userId, getToken]);

    const isFavorited = useCallback((id: number) => ids.has(id), [ids]);

    const toggle = useCallback(async (id: number): Promise<"added" | "removed"> => {
        const adding = !ids.has(id);

        setIds((prev) => {
            const next = new Set(prev);
            adding ? next.add(id) : next.delete(id);
            return next;
        });

        try {
            const token = await getToken();
            const res = await fetch(`${API}/favorites/${id}`, {
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

    const reorder = useCallback(async (id: number, position: number): Promise<void> => {
        const token = await getToken();
        const res = await fetch(`${API}/favorites/${id}/position`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ position }),
        });
        if (!res.ok) throw new Error("reorder failed");
    }, [getToken]);

    return (
        <FavoritesContext.Provider value={{ isLoaded, isFavorited, toggle, reorder }}>
            {children}
        </FavoritesContext.Provider>
    );
}

"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { PUBLIC_API_BASE as API } from "../lib/config";
import type { FavoriteItemResponseDto } from "../types/favorites";

type Role = "member" | "trusted_curator" | "admin" | null;

interface RoleContextValue {
    role: Role;
    isAdmin: boolean;
    isCurator: boolean;
}

interface FavoritesContextValue {
    isLoaded: boolean;
    isFavorited: (id: number) => boolean;
    toggle: (id: number) => Promise<"added" | "removed">;
    reorder: (id: number, position: number) => Promise<void>;
}

interface WatchlistContextValue {
    isLoaded: boolean;
    isWatchlisted: (id: number) => boolean;
    toggle: (id: number) => Promise<"added" | "removed">;
}

const RoleContext = createContext<RoleContextValue>({
    role: null,
    isAdmin: false,
    isCurator: false,
});

const FavoritesContext = createContext<FavoritesContextValue>({
    isLoaded: false,
    isFavorited: () => false,
    toggle: async () => "added",
    reorder: async () => {},
});

const WatchlistContext = createContext<WatchlistContextValue>({
    isLoaded: false,
    isWatchlisted: () => false,
    toggle: async () => "added",
});

export function useRole() {
    return useContext(RoleContext);
}

export function useFavorites() {
    return useContext(FavoritesContext);
}

export function useWatchlist() {
    return useContext(WatchlistContext);
}

export default function UserDataProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn, userId } = useAuth();

    const [role, setRole] = useState<Role>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchedForRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isSignedIn || !userId) {
            setFavoriteIds(new Set());
            setWatchlistIds(new Set());
            setIsLoaded(true);
            fetchedForRef.current = null;
            return;
        }

        if (fetchedForRef.current === userId) return;
        fetchedForRef.current = userId;
        setIsLoaded(false);

        (async () => {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const [roleRes, favRes, wlRes] = await Promise.all([
                fetch(`${API}/auth/role`, { headers }).catch(() => null),
                fetch(`${API}/favorites/mine`, { headers }).catch(() => null),
                fetch(`${API}/watchlist/mine`, { headers }).catch(() => null),
            ]);

            if (roleRes?.ok) {
                const data = await roleRes.json();
                setRole(data.role ?? "member");
            } else {
                setRole("member");
            }

            if (favRes?.ok) {
                const items: FavoriteItemResponseDto[] = await favRes.json();
                setFavoriteIds(new Set(items.map((i) => i.motionPictureId)));
            }

            if (wlRes?.ok) {
                const items: Array<{ motionPictureId: number }> = await wlRes.json();
                setWatchlistIds(new Set(items.map((i) => i.motionPictureId)));
            }

            setIsLoaded(true);
        })();
    }, [isSignedIn, userId, getToken]);

    // ── Role derivation ────────────────────────────────────────────────────────
    const effectiveRole: Role = isSignedIn && userId ? role : null;
    const roleValue = useMemo<RoleContextValue>(
        () => ({
            role: effectiveRole,
            isAdmin: effectiveRole === "admin",
            isCurator: effectiveRole === "trusted_curator" || effectiveRole === "admin",
        }),
        [effectiveRole]
    );

    // ── Favorites ──────────────────────────────────────────────────────────────
    const isFavorited = useCallback((id: number) => favoriteIds.has(id), [favoriteIds]);

    const toggleFavorite = useCallback(
        async (id: number): Promise<"added" | "removed"> => {
            const adding = !favoriteIds.has(id);
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (adding) next.add(id); else next.delete(id);
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
                setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    if (adding) next.delete(id); else next.add(id);
                    return next;
                });
                throw new Error("toggle failed");
            }
            return adding ? "added" : "removed";
        },
        [favoriteIds, getToken]
    );

    const reorderFavorite = useCallback(
        async (id: number, position: number): Promise<void> => {
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
        },
        [getToken]
    );

    const favoritesValue = useMemo<FavoritesContextValue>(
        () => ({
            isLoaded,
            isFavorited,
            toggle: toggleFavorite,
            reorder: reorderFavorite,
        }),
        [isLoaded, isFavorited, toggleFavorite, reorderFavorite]
    );

    // ── Watchlist ──────────────────────────────────────────────────────────────
    const isWatchlisted = useCallback((id: number) => watchlistIds.has(id), [watchlistIds]);

    const toggleWatchlist = useCallback(
        async (id: number): Promise<"added" | "removed"> => {
            const adding = !watchlistIds.has(id);
            setWatchlistIds((prev) => {
                const next = new Set(prev);
                if (adding) next.add(id); else next.delete(id);
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
                setWatchlistIds((prev) => {
                    const next = new Set(prev);
                    if (adding) next.delete(id); else next.add(id);
                    return next;
                });
                throw new Error("toggle failed");
            }
            return adding ? "added" : "removed";
        },
        [watchlistIds, getToken]
    );

    const watchlistValue = useMemo<WatchlistContextValue>(
        () => ({
            isLoaded,
            isWatchlisted,
            toggle: toggleWatchlist,
        }),
        [isLoaded, isWatchlisted, toggleWatchlist]
    );

    return (
        <RoleContext.Provider value={roleValue}>
            <FavoritesContext.Provider value={favoritesValue}>
                <WatchlistContext.Provider value={watchlistValue}>
                    {children}
                </WatchlistContext.Provider>
            </FavoritesContext.Provider>
        </RoleContext.Provider>
    );
}

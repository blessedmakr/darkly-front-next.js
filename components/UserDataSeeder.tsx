"use client";

import { useUserDataSeed } from "./UserDataProvider";

interface UserDataSeederProps {
    favoriteIds?: number[];
    watchlistIds?: number[];
}

/**
 * Renders nothing. Server pages that already fetched the user's favorites or
 * watchlist render this with the IDs they got, which writes them into the
 * provider's seed ref. The provider's mount-effect reads the ref and skips
 * the corresponding client-side fetch — eliminating the SSR↔provider duplicate.
 *
 * The seed write happens during render (not in an effect) so that the parent
 * provider's effect — which fires after children mount — sees the seeded value.
 * Refs are non-reactive, so writing during render is safe.
 */
export default function UserDataSeeder({ favoriteIds, watchlistIds }: UserDataSeederProps) {
    const { seedFavorites, seedWatchlist } = useUserDataSeed();
    if (favoriteIds !== undefined) seedFavorites(favoriteIds);
    if (watchlistIds !== undefined) seedWatchlist(watchlistIds);
    return null;
}

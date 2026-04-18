import { cache } from "react";
import { apiFetch } from "../lib/api";
import type { TagDto } from "../types/motion-picture";

// Tags and genres change very rarely — cache for 1 hour server-side.
export const getTags = cache(async (): Promise<TagDto[]> => {
    return apiFetch<TagDto[]>("/tags", { next: { revalidate: 3600 } } as RequestInit);
});

export const getGenres = cache(async (): Promise<string[]> => {
    return apiFetch<string[]>("/genres", { next: { revalidate: 3600 } } as RequestInit);
});

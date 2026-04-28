"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { PUBLIC_API_BASE } from "../lib/config";

/**
 * Returns a fetch wrapper that prefixes PUBLIC_API_BASE and attaches the
 * current Clerk Bearer token. Returns the raw Response so callers can branch
 * on status codes; defaults Content-Type to application/json when a body is set.
 */
export function useAuthedFetch() {
    const { getToken } = useAuth();

    return useCallback(
        async (path: string, init?: RequestInit): Promise<Response> => {
            const token = await getToken();
            const userHeaders = (init?.headers ?? {}) as Record<string, string>;
            const headers: Record<string, string> = {
                ...(init?.body && !userHeaders["Content-Type"]
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...userHeaders,
            };
            return fetch(`${PUBLIC_API_BASE}${path}`, { ...init, headers });
        },
        [getToken]
    );
}

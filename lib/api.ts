// lib/api.ts
import { SERVER_API_BASE } from "./config";
const API_BASE_URL = SERVER_API_BASE;

// Default: cache for 60 seconds. Callers can override via options.next.revalidate.
// POST requests are never cached by Next.js regardless of this setting.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        next: { revalidate: 60 },
        ...options,
        signal: AbortSignal.timeout(10_000),
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
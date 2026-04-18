// lib/api.ts
const API_BASE_URL = process.env.MOTION_PICTURES_API_BASE_URL ?? "http://localhost:8080";

// Default: cache for 60 seconds. Callers can override via options.next.revalidate.
// POST requests are never cached by Next.js regardless of this setting.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        next: { revalidate: 60 },
        ...options,
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
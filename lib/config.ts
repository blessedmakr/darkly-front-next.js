// Single source of truth for API base URLs.
// SERVER_API_BASE: server-side only (no NEXT_PUBLIC_ prefix — never sent to the client).
// PUBLIC_API_BASE: embedded in the client bundle by Next.js at build time.
export const SERVER_API_BASE = process.env.MOTION_PICTURES_API_BASE_URL ?? "http://localhost:8080";
export const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

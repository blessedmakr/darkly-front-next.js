import type { NextConfig } from "next";

const securityHeaders = [
    { key: "X-Frame-Options",           value: "DENY" },
    { key: "X-Content-Type-Options",    value: "nosniff" },
    { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        // Baseline CSP: blocks framing, restricts scripts to same-origin + Clerk.
        // Expand script-src if third-party scripts are added.
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://clerk.accounts.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://image.tmdb.org https://img.clerk.com",
            "connect-src 'self' https://*.clerk.accounts.dev https://clerk.dev https://*.railway.app https://darkly-back-end-production.up.railway.app",
            "frame-src https://challenges.cloudflare.com https://clerk.accounts.dev https://*.clerk.accounts.dev",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ].join("; "),
    },
];

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/t/p/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, backgroundColor: "#09090b", color: "#f4f4f5", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#f87171" }}>Error</p>
                <h1 style={{ marginTop: "1rem", fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.025em" }}>Something went wrong</h1>
                <p style={{ marginTop: "1rem", color: "#71717a" }}>An unexpected error occurred. Try again or go back home.</p>
                <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={reset}
                        style={{ borderRadius: "0.375rem", backgroundColor: "#27272a", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500, color: "#d4d4d8", border: "none", cursor: "pointer" }}
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        style={{ borderRadius: "0.375rem", border: "1px solid #3f3f46", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500, color: "#d4d4d8", textDecoration: "none" }}
                    >
                        Back to home
                    </Link>
                </div>
            </body>
        </html>
    );
}

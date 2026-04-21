"use client";

import { useEffect } from "react";

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
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">Error</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="mt-4 text-zinc-500">An unexpected error occurred. Try again or go back home.</p>
            <div className="mt-8 flex gap-3">
                <button
                    onClick={reset}
                    className="rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
                >
                    Try again
                </button>
                <a
                    href="/"
                    className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                >
                    Back to home
                </a>
            </div>
        </main>
    );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Horror Reviews",
    description: "Critical reviews, ratings, and commentary on horror films — from slasher classics to modern psychological dread.",
    robots: { index: false, follow: false },
};

export default function ReviewsPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-24 text-zinc-100">
            <div className="mx-auto max-w-6xl">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">
                    Reviews
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">
                    Horror Reviews
                </h1>
                <p className="mt-4 max-w-2xl text-zinc-400">
                    This is where review pages, ratings, and critical commentary will go.
                </p>
            </div>
        </main>
    );
}
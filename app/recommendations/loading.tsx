export default function RecommendationsLoading() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-6xl">
                <div className="h-8 w-64 animate-pulse rounded bg-zinc-800" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-zinc-800" />
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-800" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

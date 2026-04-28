export default function MotionPicturesLoading() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <div className="mb-2 h-3 w-32 animate-pulse rounded bg-zinc-800" />
                <div className="mb-4 flex items-baseline justify-between">
                    <div className="h-9 w-48 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="mt-8 flex gap-10">
                    <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <div key={j} className="h-6 w-16 animate-pulse rounded-full bg-zinc-800" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </aside>
                    <div className="min-w-0 flex-1">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-800" />
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                                    <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

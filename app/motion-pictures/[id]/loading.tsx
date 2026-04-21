export default function FilmLoading() {
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <section className="relative isolate overflow-hidden border-b border-zinc-800">
                <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-32 md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:pb-24 md:pt-40">
                    <div className="mx-auto w-full max-w-[280px] animate-pulse rounded-xl bg-zinc-800 md:mx-0" style={{ aspectRatio: "2/3" }} />
                    <div className="space-y-4 animate-pulse">
                        <div className="h-3 w-24 rounded bg-zinc-800" />
                        <div className="h-10 w-3/4 rounded bg-zinc-800" />
                        <div className="h-4 w-48 rounded bg-zinc-800" />
                        <div className="mt-6 space-y-2">
                            <div className="h-4 w-full rounded bg-zinc-800" />
                            <div className="h-4 w-5/6 rounded bg-zinc-800" />
                            <div className="h-4 w-4/6 rounded bg-zinc-800" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

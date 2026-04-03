import Link from "next/link";

export default function Hero() {
    return (
        <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-24">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">
                Horror Motion Picture Database
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Discover your next nightmare.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Explore slasher classics, psychological horror, supernatural dread,
                cult favorites, and modern nightmare fuel.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
                <a
                    href="#featured"
                    className="rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-500"
                >
                    Explore Motion Pictures
                </a>

                <Link
                    href="/reviews"
                    className="rounded-md border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
                >
                    Browse Reviews
                </Link>
            </div>
        </section>
    );
}
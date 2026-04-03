import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-between gap-6">
                    <Link
                        href="/"
                        className="text-sm uppercase tracking-[0.3em] text-red-500"
                    >
                        Darkly
                    </Link>

                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-6 text-sm text-zinc-300">
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <Link href="/motion-pictures">Motion Pictures</Link>
                            </li>
                            <li>
                                <Link href="/reviews">Reviews</Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <form
                    action="/motion-pictures"
                    className="flex w-full max-w-xl items-center gap-3"
                >
                    <input
                        type="search"
                        name="query"
                        placeholder="Search horror motion pictures..."
                        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-red-500"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500"
                    >
                        Search
                    </button>
                </form>
            </div>
        </header>
    );
}
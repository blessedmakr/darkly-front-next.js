import Link from "next/link";

export default function FilmNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">Not Found</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Film not found</h1>
            <p className="mt-4 text-zinc-500">This title isn&apos;t in the catalog.</p>
            <Link
                href="/motion-pictures"
                className="mt-8 rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
                Browse all films
            </Link>
        </main>
    );
}

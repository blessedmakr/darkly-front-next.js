import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">404</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
            <p className="mt-4 text-zinc-500">Whatever you're looking for isn't here.</p>
            <Link
                href="/"
                className="mt-8 rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
                Back to home
            </Link>
        </main>
    );
}

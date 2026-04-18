import Link from "next/link";

const features = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M3 12h1m16 0h1M4.927 19.073l.707-.707M18.364 5.636l.707-.707" />
                <circle cx={12} cy={12} r={4} />
            </svg>
        ),
        label: "Three-axis scores",
        description:
            "Every film is rated across Fear, Gore, and Atmosphere independently — so you know exactly what you're walking into before the lights go down.",
        accent: "text-red-400",
        border: "border-red-500/15",
        bg: "bg-red-500/5",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
        ),
        label: "Genre-deep filtering",
        description:
            "Slice by subgenre, tone, setting, and content warnings. Find folk horror set in daylight, or supernatural films light on gore — the search is yours.",
        accent: "text-orange-400",
        border: "border-orange-500/15",
        bg: "bg-orange-500/5",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
        ),
        label: "Community ratings",
        description:
            "Rate and rank alongside a community that actually watches horror. No casual audiences inflating the numbers — just dedicated fans.",
        accent: "text-violet-400",
        border: "border-violet-500/15",
        bg: "bg-violet-500/5",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        ),
        label: "Editorial depth",
        description:
            "Every entry includes a curated hook, full overview, and synopsis — written for horror fans who want context, not just a Wikipedia stub.",
        accent: "text-zinc-300",
        border: "border-zinc-500/15",
        bg: "bg-zinc-500/5",
    },
];

export default function WhyDarkly() {
    return (
        <section className="relative bg-zinc-950 py-28">
            {/* Subtle top divider glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(239,68,68,0.3),transparent)]" />

            <div className="mx-auto max-w-7xl px-6 lg:px-12">

                {/* Section header */}
                <div className="max-w-2xl">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-red-500">
                        Why Darkly
                    </p>
                    <div className="mt-4 h-px w-10 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-4xl">
                        Horror deserves its own language.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-zinc-400">
                        Mainstream film databases rate horror alongside comedies and dramas — a 6.5 could mean anything.
                        Darkly is built specifically for the genre, with scores and filters that actually mean something
                        to people who watch horror seriously.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(({ icon, label, description, accent, border, bg }) => (
                        <div
                            key={label}
                            className={`rounded-2xl border ${border} ${bg} p-6 backdrop-blur-sm`}
                        >
                            <div className={`${accent}`}>{icon}</div>
                            <h3 className="mt-4 text-sm font-semibold text-zinc-100">{label}</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA strip */}
                <div className="mt-20 flex flex-col items-start gap-4 border-t border-zinc-800/60 pt-12 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-zinc-100">
                            Ready to find your next horror film?
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Search by genre, mood, intensity, or just browse what&apos;s trending.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                        <Link
                            href="/motion-pictures"
                            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-colors hover:bg-red-500"
                        >
                            Browse the catalog
                        </Link>
                        <Link
                            href="/motion-pictures?sortBy=fearScore&sortDir=desc"
                            className="rounded-md border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                        >
                            Highest fear
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

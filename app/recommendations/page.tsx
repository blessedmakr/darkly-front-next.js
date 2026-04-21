import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRecommendations } from "../../services/motion-pictures";
import MotionPicturePreviewCard from "../../components/MotionPicturePreviewCard";
import type { MotionPicturePreviewDto } from "../../types/motion-picture";

const RATING_THRESHOLD = 5;

export const metadata: Metadata = {
    title: "Recommended for You | Darkly",
};

export default async function RecommendationsPage() {
    const { getToken, userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const token = await getToken();
    if (!token) redirect("/");

    const ratingsRes = await fetch(
        `${process.env.MOTION_PICTURES_API_BASE_URL}/ratings/mine`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    const ratings: unknown[] = ratingsRes.ok ? await ratingsRes.json() : [];
    const ratingCount = ratings.length;

    let films: MotionPicturePreviewDto[] = [];
    if (ratingCount >= RATING_THRESHOLD) {
        try {
            films = await getRecommendations(token);
        } catch {
            films = [];
        }
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-semibold tracking-tight">Recommended for You</h1>

                {ratingCount >= RATING_THRESHOLD && films.length > 0 && (
                    <p className="mt-2 text-zinc-400">
                        {films.length} film{films.length === 1 ? "" : "s"} selected based on your ratings
                    </p>
                )}

                {ratingCount < RATING_THRESHOLD ? (
                    <div className="mt-16 flex flex-col items-center gap-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                            <svg className="h-7 w-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-zinc-200">
                                {ratingCount === 0
                                    ? "No recommendations yet"
                                    : `${ratingCount} of ${RATING_THRESHOLD} ratings`}
                            </p>
                            <p className="mt-2 max-w-sm text-sm text-zinc-500">
                                {ratingCount === 0
                                    ? `Rate ${RATING_THRESHOLD} films and Darkly will find what to watch next based on your taste.`
                                    : `Rate ${RATING_THRESHOLD - ratingCount} more film${RATING_THRESHOLD - ratingCount === 1 ? "" : "s"} to unlock your recommendations.`}
                            </p>
                        </div>

                        {ratingCount > 0 && (
                            <div className="flex w-48 gap-1">
                                {Array.from({ length: RATING_THRESHOLD }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full ${i < ratingCount ? "bg-lime-400" : "bg-zinc-800"}`}
                                    />
                                ))}
                            </div>
                        )}

                        <Link
                            href="/motion-pictures"
                            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                        >
                            Browse films
                        </Link>
                    </div>
                ) : (
                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {films.map((film) => (
                            <MotionPicturePreviewCard key={film.id} film={film} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

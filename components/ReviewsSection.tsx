import CuratorBadge from "./CuratorBadge";

interface PublicReview {
    displayName: string;
    role: string | null;
    overallScore: number | null;
    fearScore: number | null;
    atmosphereScore: number | null;
    goreScore: number | null;
    reviewText: string;
    ratedAt: string;
}

interface ReviewsSectionProps {
    motionPictureId: number;
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
    if (value == null) return null;
    return (
        <span className="inline-flex flex-col items-center rounded border border-zinc-700 px-2 py-1 text-center">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="text-sm font-semibold text-zinc-100">{value}</span>
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default async function ReviewsSection({ motionPictureId }: ReviewsSectionProps) {
    const base = process.env.MOTION_PICTURES_API_BASE_URL;
    const res = await fetch(
        `${base}/ratings/motion-pictures/${motionPictureId}/reviews`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const reviews: PublicReview[] = await res.json();

    if (reviews.length === 0) return null;

    return (
        <section className="mx-auto max-w-6xl px-6 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-zinc-800" />
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Reviews</p>
                <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <article
                        key={`${review.displayName}-${review.ratedAt}`}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
                    >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-100">
                                        {review.displayName}
                                    </span>
                                    {(review.role === "trusted_curator" || review.role === "admin") && (
                                        <CuratorBadge />
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500">
                                    {formatDate(review.ratedAt)}
                                </span>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <ScorePill label="Overall" value={review.overallScore} />
                                <ScorePill label="Fear" value={review.fearScore} />
                                <ScorePill label="Atmos." value={review.atmosphereScore} />
                                <ScorePill label="Gore" value={review.goreScore} />
                            </div>
                        </div>

                        <p className="mt-4 leading-7 text-zinc-300">{review.reviewText}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

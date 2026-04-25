"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton, Show } from "@clerk/nextjs";
import { useRole } from "./RoleProvider";
import { PUBLIC_API_BASE } from "../lib/config";

const DIMENSIONS = [
    { key: "overallScore",    label: "Overall"    },
    { key: "fearScore",       label: "Fear"       },
    { key: "atmosphereScore", label: "Atmosphere" },
    { key: "goreScore",       label: "Gore"       },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];
type Scores = Record<DimensionKey, number | null>;

interface ExistingRating {
    overallScore:    number;
    fearScore:       number;
    atmosphereScore: number;
    goreScore:       number;
    reviewText:      string | null;
    scoresLocked:    boolean;
    scoresUnlockAt:  string | null;
}

interface RatingFormProps {
    motionPictureId: number;
    motionPictureTitle: string;
}

function ScoreSelector({
    label,
    value,
    locked,
    onChange,
}: {
    label: string;
    value: number | null;
    locked: boolean;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
            <div className="flex gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                        key={n}
                        type="button"
                        disabled={locked}
                        onClick={() => onChange(n)}
                        className={[
                            "h-8 w-8 rounded text-xs font-semibold transition-colors",
                            value === n
                                ? "bg-lime-400 text-zinc-950"
                                : locked
                                    ? "border border-zinc-800 text-zinc-700 cursor-not-allowed"
                                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
                        ].join(" ")}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

function formatUnlockDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function RatingForm({ motionPictureId, motionPictureTitle }: RatingFormProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const { isAdmin } = useRole();

    const [existing, setExisting]     = useState<ExistingRating | null>(null);
    const [loadingExisting, setLoadingExisting] = useState(true);

    const [scores, setScores] = useState<Scores>({
        overallScore:    null,
        fearScore:       null,
        atmosphereScore: null,
        goreScore:       null,
    });
    const [reviewText, setReviewText] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [loading, setLoading]       = useState(false);

    // Fetch existing rating on mount
    useEffect(() => {
        getToken().then((token) => {
            if (!token) { setLoadingExisting(false); return; }
            return fetch(
                `${PUBLIC_API_BASE}/ratings/motion-pictures/${motionPictureId}/mine`,
                { headers: { Authorization: `Bearer ${token}` } }
            ).then((res) => {
                if (!res.ok) return;
                return res.json();
            }).then((data) => {
                if (!data) return;
                if (data.rated) {
                    const r: ExistingRating = data;
                    setExisting(r);
                    setScores({
                        overallScore:    r.overallScore,
                        fearScore:       r.fearScore,
                        atmosphereScore: r.atmosphereScore,
                        goreScore:       r.goreScore,
                    });
                    setReviewText(r.reviewText ?? "");
                }
            });
        }).catch(() => {}).finally(() => setLoadingExisting(false));
    }, [motionPictureId, getToken]);

    const isUpdate    = existing !== null;
    const scoresLocked = existing?.scoresLocked ?? false;
    const allFilled   = DIMENSIONS.every((d) => scores[d.key] !== null);
    const canSubmit   = scoresLocked ? true : allFilled; // locked = review-text-only update, always submittable

    async function handleConfirm() {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            const url = `${PUBLIC_API_BASE}/ratings/motion-pictures/${motionPictureId}`;

            let res: Response;
            if (isUpdate) {
                const body: Record<string, unknown> = { reviewText: reviewText.trim() || null };
                if (!scoresLocked) {
                    body.overallScore    = scores.overallScore;
                    body.fearScore       = scores.fearScore;
                    body.atmosphereScore = scores.atmosphereScore;
                    body.goreScore       = scores.goreScore;
                }
                res = await fetch(url, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ ...scores, reviewText: reviewText.trim() || null }),
                });
            }

            if (res.status === 429) {
                setError("Scores can't be updated yet — the 30-day lock is still active.");
                setConfirming(false);
                return;
            }
            if (!res.ok) {
                setError("Something went wrong. Please try again.");
                setConfirming(false);
                return;
            }

            setSubmitted(true);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
            setConfirming(false);
        } finally {
            setLoading(false);
        }
    }

    // ── Submitted confirmation ────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-6">
                <p className="text-sm font-medium text-lime-400">
                    {isUpdate ? "Rating updated." : "Rating submitted — thank you."}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-semibold text-zinc-100">
                {isUpdate ? "Your rating" : "Rate this film"}
            </h2>

            <Show when="signed-out">
                <p className="mt-3 text-sm text-zinc-400">
                    <SignInButton>
                        <button className="text-lime-400 underline-offset-2 hover:underline">
                            Sign in
                        </button>
                    </SignInButton>
                    {" "}to rate {motionPictureTitle}.
                </p>
            </Show>

            <Show when="signed-in">
                {loadingExisting ? (
                    <p className="mt-4 text-sm text-zinc-500">Loading…</p>
                ) : confirming ? (
                    // ── Confirmation panel ────────────────────────────────────
                    <div className="mt-5 space-y-5">
                        <div className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                                {isUpdate ? "Updating your scores" : "Confirm your rating"}
                            </p>
                            {!scoresLocked && (
                                <div className="flex gap-6">
                                    {DIMENSIONS.map((d) => (
                                        <div key={d.key} className="flex flex-col items-center">
                                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">{d.label}</span>
                                            <span className="mt-0.5 text-lg font-semibold text-zinc-100">{scores[d.key]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {reviewText.trim() && (
                                <p className="text-sm text-zinc-300 line-clamp-3 italic">
                                    "{reviewText.trim()}"
                                </p>
                            )}
                        </div>

                        <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                            <p className="text-xs text-amber-300">
                                {scoresLocked && existing?.scoresUnlockAt
                                    ? "Only your review text will be updated. Scores are locked until " + formatUnlockDate(existing.scoresUnlockAt) + "."
                                    : isAdmin
                                        ? isUpdate
                                            ? "Your previous scores will be replaced."
                                            : "Your scores and review can be updated at any time."
                                        : isUpdate
                                            ? "Your previous scores will be replaced and locked for another 30 days."
                                            : "Scores lock for 30 days after submission. Review text can always be updated."}
                            </p>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="rounded-md bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-lime-300 disabled:opacity-40"
                            >
                                {loading ? "Submitting…" : "Confirm"}
                            </button>
                            <button
                                onClick={() => setConfirming(false)}
                                disabled={loading}
                                className="rounded-md border border-zinc-700 px-5 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                ) : (
                    // ── Main form ─────────────────────────────────────────────
                    <div className="mt-5 space-y-5">
                        {scoresLocked && existing?.scoresUnlockAt && (
                            <div className="rounded-md border border-zinc-700 bg-zinc-800/40 px-4 py-3">
                                <p className="text-xs text-zinc-400">
                                    Scores are locked until{" "}
                                    <span className="text-zinc-200">{formatUnlockDate(existing.scoresUnlockAt)}</span>.
                                    You can still edit your review below.
                                </p>
                            </div>
                        )}

                        {DIMENSIONS.map((d) => (
                            <ScoreSelector
                                key={d.key}
                                label={d.label}
                                value={scores[d.key]}
                                locked={scoresLocked}
                                onChange={(v) => setScores((prev) => ({ ...prev, [d.key]: v }))}
                            />
                        ))}

                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                                Review <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                placeholder="What made this film stand out?"
                                className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                            />
                            {reviewText.length > 0 && (
                                <p className="mt-1 text-right text-xs text-zinc-600">
                                    {reviewText.length}/2000
                                </p>
                            )}
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <button
                            type="button"
                            disabled={!canSubmit}
                            onClick={() => setConfirming(true)}
                            className="rounded-md bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isUpdate
                                ? scoresLocked ? "Update review" : "Update rating"
                                : "Submit rating"}
                        </button>
                    </div>
                )}
            </Show>
        </div>
    );
}

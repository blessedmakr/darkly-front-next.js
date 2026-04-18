"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Status = "idle" | "submitting" | "success" | "error";

const RATINGS = ["G", "PG", "PG-13", "R", "NC-17", "NR", "Unrated"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                {label}
                {hint && (
                    <span className="ml-2 normal-case tracking-normal text-zinc-600">{hint}</span>
                )}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none";

export default function SubmissionForm() {
    const { getToken } = useAuth();

    const [title, setTitle]                           = useState("");
    const [alternativeTitle, setAlternativeTitle]     = useState("");
    const [releaseYear, setReleaseYear]               = useState("");
    const [runningTime, setRunningTime]               = useState("");
    const [language, setLanguage]                     = useState("");
    const [motionPictureRating, setMotionPictureRating] = useState("");
    const [tagline, setTagline]                       = useState("");
    const [officialSite, setOfficialSite]             = useState("");
    const [overview, setOverview]                     = useState("");
    const [tmdbId, setTmdbId]                         = useState("");
    const [status, setStatus]                         = useState<Status>("idle");
    const [error, setError]                           = useState<string | null>(null);

    function reset() {
        setTitle(""); setAlternativeTitle(""); setReleaseYear(""); setRunningTime("");
        setLanguage(""); setMotionPictureRating(""); setTagline(""); setOfficialSite("");
        setOverview(""); setTmdbId(""); setStatus("idle"); setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("submitting");
        setError(null);

        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title:                title.trim(),
                        alternativeTitle:     alternativeTitle.trim() || null,
                        releaseYear:          releaseYear ? parseInt(releaseYear, 10) : null,
                        runningTime:          runningTime ? parseInt(runningTime, 10) : null,
                        language:             language.trim() || null,
                        motionPictureRating:  motionPictureRating || null,
                        tagline:              tagline.trim() || null,
                        officialSite:         officialSite.trim() || null,
                        overview:             overview.trim() || null,
                        tmdbId:               tmdbId ? parseInt(tmdbId, 10) : null,
                    }),
                }
            );

            if (!res.ok) {
                setError("Something went wrong. Please try again.");
                setStatus("error");
                return;
            }

            setStatus("success");
        } catch {
            setError("Something went wrong. Please try again.");
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-6">
                <p className="font-medium text-lime-400">Submission received — thank you.</p>
                <p className="mt-1 text-sm text-zinc-400">
                    We'll review it and add it to the catalog if it fits.
                </p>
                <button
                    onClick={reset}
                    className="mt-4 text-sm text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
                >
                    Submit another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Title" hint="*">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={300}
                    placeholder="e.g. Hereditary"
                    className={inputCls}
                />
            </Field>

            <Field label="Alternative Title" hint="(AKA, original language title, etc.)">
                <input
                    type="text"
                    value={alternativeTitle}
                    onChange={(e) => setAlternativeTitle(e.target.value)}
                    maxLength={300}
                    placeholder="e.g. Hérédité"
                    className={inputCls}
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Release Year">
                    <input
                        type="number"
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        min={1888}
                        max={2100}
                        placeholder="e.g. 2018"
                        className={inputCls}
                    />
                </Field>

                <Field label="Running Time" hint="(minutes)">
                    <input
                        type="number"
                        value={runningTime}
                        onChange={(e) => setRunningTime(e.target.value)}
                        min={1}
                        max={600}
                        placeholder="e.g. 127"
                        className={inputCls}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Language">
                    <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        maxLength={100}
                        placeholder="e.g. English"
                        className={inputCls}
                    />
                </Field>

                <Field label="Rating">
                    <select
                        value={motionPictureRating}
                        onChange={(e) => setMotionPictureRating(e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Select…</option>
                        {RATINGS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Tagline">
                <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    maxLength={500}
                    placeholder="e.g. Every family has its dark secrets."
                    className={inputCls}
                />
            </Field>

            <Field label="Official Site" hint="(URL)">
                <input
                    type="url"
                    value={officialSite}
                    onChange={(e) => setOfficialSite(e.target.value)}
                    maxLength={500}
                    placeholder="https://…"
                    className={inputCls}
                />
            </Field>

            <Field label="Overview">
                <textarea
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="Brief description of the film…"
                    className={`${inputCls} resize-none`}
                />
            </Field>

            <Field label="TMDB ID" hint="(optional, helps us match it faster)">
                <input
                    type="number"
                    value={tmdbId}
                    onChange={(e) => setTmdbId(e.target.value)}
                    placeholder="e.g. 362841"
                    className={inputCls}
                />
            </Field>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
                type="submit"
                disabled={!title.trim() || status === "submitting"}
                className="rounded-md bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {status === "submitting" ? "Submitting…" : "Submit film"}
            </button>
        </form>
    );
}

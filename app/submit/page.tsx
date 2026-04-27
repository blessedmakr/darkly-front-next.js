import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SubmissionForm from "../../components/SubmissionForm";
import { SignInButton } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Submit a Film",
    description: "Don't see your favourite horror film? Submit it for review.",
    openGraph: {
        title: "Submit a Film",
        description: "Don't see your favourite horror film? Submit it for review.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Submit a Film",
        description: "Don't see your favourite horror film? Submit it for review.",
    },
};

export default async function SubmitPage() {
    const { userId } = await auth();

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-red-500">Community</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">Submit a film</h1>
                <p className="mt-3 leading-7 text-zinc-400">
                    Don't see a horror film that belongs here? Submit it and we'll review it
                    for inclusion in the catalog.
                </p>

                <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    {userId ? (
                        <SubmissionForm />
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-zinc-400">
                                You need to be signed in to submit a film.
                            </p>
                            <SignInButton>
                                <button className="rounded-md bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-lime-300">
                                    Sign in to submit
                                </button>
                            </SignInButton>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

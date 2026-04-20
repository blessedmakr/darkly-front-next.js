import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getRecommendations } from "../../services/motion-pictures";
import MotionPicturePreviewCard from "../../components/MotionPicturePreviewCard";
import type { MotionPicturePreviewDto } from "../../types/motion-picture";

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

    let films: MotionPicturePreviewDto[];
    try {
        films = await getRecommendations(token);
    } catch {
        films = [];
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-semibold tracking-tight">Recommended for You</h1>
                <p className="mt-2 text-zinc-400">
                    {films.length === 0
                        ? "Rate some films to get personalised recommendations."
                        : `${films.length} film${films.length === 1 ? "" : "s"} selected based on your ratings`}
                </p>

                {films.length > 0 && (
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

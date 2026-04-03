import MotionPictureGrid from "../../components/MotionPictureGrid";
import { searchMotionPictures } from "../../services/motion-pictures";

interface MotionPicturesPageProps {
    searchParams?: Promise<{
        query?: string;
    }>;
}

export default async function MotionPicturesPage({
    searchParams,
}: MotionPicturesPageProps) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.query?.trim() ?? "";

    const motionPictures = query ? await searchMotionPictures(query) : [];

    return (
        <main className="min-h-screen px-6 py-24">
            <div className="mx-auto max-w-6xl">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">
                    Motion Pictures
                </p>

                <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
                    Search Results
                </h1>

                {query ? (
                    <>
                        <p className="mt-4 max-w-2xl text-zinc-400">
                            Results for &quot;{query}&quot;.
                        </p>

                        <div className="mt-10">
                            {motionPictures.length > 0 ? (
                                <>
                                    <p className="mb-8 text-sm text-zinc-500">
                                        Found {motionPictures.length} motion picture
                                        {motionPictures.length === 1 ? "" : "s"}.
                                    </p>

                                    <MotionPictureGrid motionPictures={motionPictures} />
                                </>
                            ) : (
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
                                    No motion pictures matched &quot;{query}&quot;.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
                        Use the search bar in the header to search for a motion picture.
                    </div>
                )}
            </div>
        </main>
    );
}
import type { MotionPicture } from "../types/motion-picture";
import MotionPictureGrid from "./MotionPictureGrid";

interface FeaturedMotionPicturesSectionProps {
    motionPictures: MotionPicture[];
}

export default function FeaturedMotionPicturesSection({
    motionPictures,
}: FeaturedMotionPicturesSectionProps) {
    return (
        <section id="featured" className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.3em] text-red-500">
                    Featured
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">
                    Essential Horror Motion Pictures
                </h2>
                <p className="mt-4 max-w-2xl text-zinc-400">
                    A curated starter list of landmark horror titles across different
                    strains of fear.
                </p>
            </div>

            <MotionPictureGrid motionPictures={motionPictures} />
        </section>
    );
}
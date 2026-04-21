import type { MotionPicture } from "../types/motion-picture";
import MotionPictureCard from "./MotionPictureCard";

interface MotionPictureGridProps {
    motionPictures: MotionPicture[];
}

export default function MotionPictureGrid({
    motionPictures,
}: MotionPictureGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {motionPictures.map((motionPicture) => (
                <MotionPictureCard
                    key={motionPicture.id}
                    motionPicture={motionPicture}
                />
            ))}
        </div>
    );
}
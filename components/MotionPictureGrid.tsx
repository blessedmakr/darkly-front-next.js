import type { MotionPicture } from "../types/motion-picture";
import MotionPictureCard from "./MotionPictureCard";

interface MotionPictureGridProps {
    motionPictures: MotionPicture[];
}

export default function MotionPictureGrid({
    motionPictures,
}: MotionPictureGridProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {motionPictures.map((motionPicture) => (
                <MotionPictureCard
                    key={motionPicture.id}
                    motionPicture={motionPicture}
                />
            ))}
        </div>
    );
}
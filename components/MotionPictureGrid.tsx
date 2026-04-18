import type { MotionPicture } from "../types/motion-picture";
import MotionPictureCard from "./MotionPictureCard";

interface MotionPictureGridProps {
    motionPictures: MotionPicture[];
}

export default function MotionPictureGrid({
    motionPictures,
}: MotionPictureGridProps) {
    return (
        <div className="flex flex-wrap gap-6">
            {motionPictures.map((motionPicture) => (
                <MotionPictureCard
                    key={motionPicture.id}
                    motionPicture={motionPicture}
                />
            ))}
        </div>
    );
}
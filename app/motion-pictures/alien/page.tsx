import { getMotionPictureByTitleAndDate } from "../../../services/motion-pictures";
import MotionPictureCard from "../../../components/MotionPictureCard";

export default async function AlienPage() {
    // Your existing API call:
    // http://localhost:8080/motionPicture/getMotionPicture/?title=Alien&releaseDate=1979-06-22
    const motionPicture = await getMotionPictureByTitleAndDate(
        "Alien",
        "1979-06-22"
    );

    return (
        <main className="min-h-screen px-6 py-24">
            <div className="mx-auto max-w-6xl">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">
                    Motion Picture
                </p>

                <h1 className="mb-8 text-4xl font-semibold tracking-tight text-zinc-100">
                    {motionPicture.originalTitle}
                </h1>

                <MotionPictureCard motionPicture={motionPicture} />
            </div>
        </main>
    );
}
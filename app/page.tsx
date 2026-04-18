import FeaturedHero from "@/components/FeaturedHero";
import WhyDarkly from "@/components/WhyDarkly";
import { getFeaturedMotionPicture } from "@/services/motion-pictures";

export default async function HomePage() {
  const featuredMotionPicture = await getFeaturedMotionPicture();

  return (
    <main className="bg-zinc-950 text-zinc-100">
      <FeaturedHero motionPicture={featuredMotionPicture} />
      <WhyDarkly />
    </main>
  );
}
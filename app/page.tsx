import type { Metadata } from "next";
import FeaturedHero from "@/components/FeaturedHero";
import WhyWatchDarkly from "@/components/WhyWatchDarkly";
import Discovery from "@/components/Discovery";
import { getFeaturedMotionPicture } from "@/services/motion-pictures";
import { SITE_URL } from "../lib/config";

const DESCRIPTION =
    "watchdarkly rates horror films by fear, gore, and atmosphere so you always know what you're in for. Discover slasher classics, psychological horror, supernatural dread, and cult favorites.";

export const metadata: Metadata = {
    title: "Horror Film Ratings — Discover What Terrifies",
    description: DESCRIPTION,
    openGraph: {
        title: "watchdarkly — Horror Film Ratings",
        description: DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: "watchdarkly — Horror Film Ratings",
        description: DESCRIPTION,
    },
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "watchdarkly",
    url: SITE_URL,
    description: DESCRIPTION,
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/motion-pictures?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

export default async function HomePage() {
    let featuredMotionPicture: Awaited<ReturnType<typeof getFeaturedMotionPicture>> | null = null;
    try {
        featuredMotionPicture = await getFeaturedMotionPicture();
    } catch {
        featuredMotionPicture = null;
    }

    return (
        <main className="bg-zinc-950 text-zinc-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            {featuredMotionPicture && <FeaturedHero motionPicture={featuredMotionPicture} />}
            <Discovery />
            <WhyWatchDarkly />
        </main>
    );
}

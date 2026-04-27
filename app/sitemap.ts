import type { MetadataRoute } from "next";
import { getAllMotionPictureIds } from "../services/motion-pictures";
import { SITE_URL } from "../lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/`,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/motion-pictures`,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/submit`,
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];

    let filmRoutes: MetadataRoute.Sitemap = [];

    try {
        const films = await getAllMotionPictureIds();
        filmRoutes = films.map(({ id, releaseDate }) => ({
            url: `${SITE_URL}/motion-pictures/${id}`,
            lastModified: releaseDate,
            changeFrequency: "monthly",
            priority: 0.8,
        }));
    } catch {
        // If the API is unreachable at build time, emit only static routes
    }

    return [...staticRoutes, ...filmRoutes];
}

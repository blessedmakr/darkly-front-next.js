import type { MetadataRoute } from "next";
import { searchMotionPicturesWithFilters } from "../services/motion-pictures";
import { EMPTY_FILTER_STATE } from "../lib/motion-picture-filters";

const PAGE_SIZE = 500;

async function getAllMotionPictureIds(): Promise<{ id: number; releaseDate: Date }[]> {
    const results: { id: number; releaseDate: Date }[] = [];

    const first = await searchMotionPicturesWithFilters(EMPTY_FILTER_STATE, {
        page: 1,
        pageSize: PAGE_SIZE,
    });

    for (const item of first.items) {
        results.push({ id: item.id, releaseDate: item.releaseDate });
    }

    const totalPages = Math.ceil(first.total / PAGE_SIZE);

    if (totalPages > 1) {
        const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
                searchMotionPicturesWithFilters(EMPTY_FILTER_STATE, {
                    page: i + 2,
                    pageSize: PAGE_SIZE,
                })
            )
        );

        for (const page of rest) {
            for (const item of page.items) {
                results.push({ id: item.id, releaseDate: item.releaseDate });
            }
        }
    }

    return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: "/",
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: "/motion-pictures",
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    let filmRoutes: MetadataRoute.Sitemap = [];

    try {
        const films = await getAllMotionPictureIds();
        filmRoutes = films.map(({ id, releaseDate }) => ({
            url: `/motion-pictures/${id}`,
            lastModified: releaseDate,
            changeFrequency: "monthly",
            priority: 0.8,
        }));
    } catch {
        // If the API is unreachable at build time, emit only static routes
    }

    return [...staticRoutes, ...filmRoutes];
}

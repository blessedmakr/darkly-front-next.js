// services/motion-picture-service.ts

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { apiFetch } from "../lib/api";
import type { MotionPicture, MotionPicturePreviewDto } from "../types/motion-picture";
import type { MotionPictureDto } from "../types/motion-picture-dto";
import {
    mapFiltersToMotionPictureSearchRequest,
    EMPTY_FILTER_STATE,
    type MotionPictureFilterState,
} from "../lib/motion-picture-filters";

interface MotionPictureSearchResponseDto {
    items: MotionPictureDto[];
    total: number;
    page: number;
    pageSize: number;
}

export interface MotionPictureSearchResponse {
    items: MotionPicture[];
    total: number;
    page: number;
    pageSize: number;
}

function mapDtoToMotionPicture(dto: MotionPictureDto): MotionPicture {
    const { officalSite, ...rest } = dto;
    return {
        ...rest,
        officialSite: officalSite,
        releaseDate: new Date(dto.releaseDate),
        tags: dto.tags ?? [],
        genres: dto.genres ?? [],
    };
}

// POST requests bypass Next's data cache, so /motionPicture/search would hit
// the backend on every keystroke during a typing burst. unstable_cache adds an
// app-level keyed cache so identical filter URLs share a result for 60s.
const cachedSearch = unstable_cache(
    async (serializedBody: string): Promise<MotionPictureSearchResponseDto> => {
        return apiFetch<MotionPictureSearchResponseDto>("/motionPicture/search", {
            method: "POST",
            body: serializedBody,
            headers: { "Content-Type": "application/json" },
        });
    },
    ["motion-picture-search"],
    { revalidate: 60 }
);

export async function searchMotionPicturesWithFilters(
    filters: MotionPictureFilterState,
    options?: {
        page?: number;
        pageSize?: number;
    }
): Promise<MotionPictureSearchResponse> {
    const requestBody = mapFiltersToMotionPictureSearchRequest(filters, options);
    const response = await cachedSearch(JSON.stringify(requestBody));

    return {
        ...response,
        items: response.items.map(mapDtoToMotionPicture),
    };
}

export const getMotionPictureById = cache(
    async (id: number): Promise<MotionPicture> => {
        // The detail page is force-static with a 60s revalidate window, which
        // overrides any per-fetch setting. Leaving revalidate undefined here
        // so the page-level directive controls freshness.
        const dto = await apiFetch<MotionPictureDto>(`/motionPicture/getById/${id}`);
        return mapDtoToMotionPicture(dto);
    }
);

export const getFeaturedMotionPicture = cache(
    async (): Promise<MotionPicture> => {
        const dto = await apiFetch<MotionPictureDto>(
            `/motionPicture/getFeatured`,
            { next: { revalidate: 3600 } } as RequestInit,
        );
        return mapDtoToMotionPicture(dto);
    }
);


export async function getSimilarFilms(id: number): Promise<MotionPicturePreviewDto[]> {
    return apiFetch<MotionPicturePreviewDto[]>(`/motionPicture/${id}/similar`, {
        next: { revalidate: 300 },
    } as RequestInit);
}

export async function getRecommendations(token: string): Promise<MotionPicturePreviewDto[]> {
    return apiFetch<MotionPicturePreviewDto[]>("/motionPicture/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
}

export interface CuratedCollectionResponse {
    tags: string[];
    films: MotionPicturePreviewDto[];
}

export async function getDiscovery(): Promise<CuratedCollectionResponse> {
    return apiFetch<CuratedCollectionResponse>("/motionPicture/discovery", {
        next: { revalidate: 3600 },
    } as RequestInit);
}

const ALL_FILMS_PAGE_SIZE = 500;

export async function getAllMotionPictureIds(): Promise<{ id: number; releaseDate: Date }[]> {
    const results: { id: number; releaseDate: Date }[] = [];

    const first = await searchMotionPicturesWithFilters(EMPTY_FILTER_STATE, {
        page: 1,
        pageSize: ALL_FILMS_PAGE_SIZE,
    });

    for (const item of first.items) {
        results.push({ id: item.id, releaseDate: item.releaseDate });
    }

    const totalPages = Math.ceil(first.total / ALL_FILMS_PAGE_SIZE);

    if (totalPages > 1) {
        const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
                searchMotionPicturesWithFilters(EMPTY_FILTER_STATE, {
                    page: i + 2,
                    pageSize: ALL_FILMS_PAGE_SIZE,
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

export async function searchMotionPictures(
    query: string
): Promise<MotionPicture[]> {
    if (!query.trim()) {
        return [];
    }

    const dtos = await apiFetch<MotionPictureDto[]>(
        `/motionPicture/search/${encodeURIComponent(query)}`
    );

    return dtos.map(mapDtoToMotionPicture);
}
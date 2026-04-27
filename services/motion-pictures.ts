// services/motion-picture-service.ts

import { cache } from "react";
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

export async function searchMotionPicturesWithFilters(
    filters: MotionPictureFilterState,
    options?: {
        page?: number;
        pageSize?: number;
    }
): Promise<MotionPictureSearchResponse> {
    const requestBody = mapFiltersToMotionPictureSearchRequest(filters, options);

    const response = await apiFetch<MotionPictureSearchResponseDto>("/motionPicture/search", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json",
        },
    });

    return {
        ...response,
        items: response.items.map(mapDtoToMotionPicture),
    };
}

export async function getMotionPictureByTitleAndDate(
    title: string,
    releaseDate: string
): Promise<MotionPicture> {
    const params = new URLSearchParams({
        title,
        releaseDate,
    });

    const dto = await apiFetch<MotionPictureDto>(
        `/motionPicture/getMotionPicture/?${params.toString()}`
    );

    return mapDtoToMotionPicture(dto);
}

export const getMotionPictureById = cache(
    async (id: number): Promise<MotionPicture> => {
        const dto = await apiFetch<MotionPictureDto>(
            `/motionPicture/getById/${id}`,
            // revalidate: 0 — scores update on every rating submission, must always be fresh
            { next: { revalidate: 0 } } as RequestInit,
        );
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
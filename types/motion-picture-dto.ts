import type { TagDto } from "./motion-picture";

export interface MotionPictureDto {
    atmosphereRatingCount: number;
    atmosphereScore: number;
    alternativeTitle: string | null;
    averageScore: number;
    backdropUrl: string;
    boxOffice: number;
    budget: number;
    fearRatingCount: number;
    fearScore: number;
    goreRatingCount: number;
    goreScore: number;
    hook: string;
    id: number;
    language: string;
    medianScore: number;
    motionPictureRating: string;
    motionPictureRatingDesc: string;
    officalSite: string;  // typo in API — mapped to officialSite in MotionPicture
    originalTitle: string;
    overview: string;
    posterUrl: string;
    releaseDate: string;   // JSON string in API
    runningTime: number;
    score: number;
    scoreRatingCount: number;
    synopsis: string | null;
    tagline: string;
    thumbnailUrl: string;
    genres: string[];
    tags: TagDto[];
}
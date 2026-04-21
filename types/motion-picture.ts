export interface MotionPicturePreviewDto {
    id: number;
    originalTitle: string;
    posterUrl: string;
    score: number;
    fearScore: number;
    goreScore: number;
    atmosphereScore: number;
    releaseYear: number;
}

export interface TagDto {
    id: number;
    name: string;
    tagType: "tone" | "subgenre" | "content_warning" | "gore_level" | "violence_level" | "setting" | "audience" | "seasonal" | "region" | "production";
    description: string;
    displayPriority: number;
}

export interface MotionPicture {
    atmosphereScore: number;
    alternativeTitle: string | null;
    backdropUrl: string;
    boxOffice: number;
    budget: number;
    fearScore: number;
    goreScore: number;
    hook: string;
    id: number;
    language: string;
    medianScore: number;
    motionPictureRating: string;
    motionPictureRatingDesc: string;
    officialSite: string;
    originalTitle: string;
    overview: string;
    posterUrl: string;
    releaseDate: Date;       // normalized to Date in the app
    runningTime: number;
    score: number;
    scoreRatingCount: number;
    synopsis: string | null;
    tagline: string;
    thumbnailUrl: string;
    genres: string[];
    tags: TagDto[];
}
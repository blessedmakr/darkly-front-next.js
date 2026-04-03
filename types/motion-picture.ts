export interface TagDto {
    name: string;
    tagType: "tone" | "subgenre" | "content_warning" | "setting" | "audience";
    description: string;
}

export interface MotionPicture {
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
    officalSite: string;
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
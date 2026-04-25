export interface FavoriteItemResponseDto {
    motionPictureId: number;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    position: number;
    addedAt: string;
}

export interface MotionPicturePreviewDTO {
    id: number;
    originalTitle: string;
    posterUrl: string | null;
    score: number | null;
    fearScore: number | null;
    goreScore: number | null;
    atmosphereScore: number | null;
    releaseYear: number | null;
}

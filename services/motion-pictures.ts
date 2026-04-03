import { apiFetch } from "../lib/api";
import type { MotionPicture } from "../types/motion-picture";
import type { MotionPictureDto } from "../types/motion-picture-dto";

function mapDtoToMotionPicture(dto: MotionPictureDto): MotionPicture {
    return {
        ...dto,
        releaseDate: new Date(dto.releaseDate),
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
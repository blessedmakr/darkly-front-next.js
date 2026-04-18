import type { TagDto } from "../types/motion-picture";

export function getReleaseYear(releaseDate: Date): number {
    return new Date(releaseDate).getFullYear();
}

export function getPrimaryTag(tags: TagDto[] | null | undefined): string | null {
    if (!tags || tags.length === 0) return null;
    const sorted = [...tags].sort((a, b) => a.displayPriority - b.displayPriority);
    return sorted[0].name;
}


export function formatRunningTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}
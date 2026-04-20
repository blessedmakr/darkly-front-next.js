import type { TagDto } from "../types/motion-picture";

export function getReleaseYear(releaseDate: Date): number {
    return new Date(releaseDate).getFullYear();
}

const PRIMARY_TAG_EXCLUDED_TYPES = new Set(["gore_level", "violence_level", "content_warning"]);

// Some tag names include a redundant type prefix (e.g. "gore-none" inside the
// "Gore Level" section). Strip it so only the meaningful part is shown.
export function formatTagName(tagType: string, name: string): string {
    const prefix = tagType.replace(/_level$/, "").replace(/_/g, "-") + "-";
    const stripped = name.toLowerCase().startsWith(prefix.toLowerCase())
        ? name.slice(prefix.length)
        : name;
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

export function getPrimaryTag(tags: TagDto[] | null | undefined): string | null {
    if (!tags || tags.length === 0) return null;
    const eligible = tags.filter((t) => !PRIMARY_TAG_EXCLUDED_TYPES.has(t.tagType));
    if (eligible.length === 0) return null;
    return eligible.sort((a, b) => a.displayPriority - b.displayPriority)[0].name;
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
export interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: number;
    role: string;
}

export interface Submission {
    id: number;
    title: string;
    releaseYear: number | null;
    overview: string | null;
    tmdbId: number | null;
    userId: string;
    submittedAt: string;
    status: string;
}

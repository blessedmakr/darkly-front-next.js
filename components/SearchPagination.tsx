"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SearchPaginationProps {
    page: number;
    pageSize: number;
    total: number;
}

export default function SearchPagination({
    page,
    pageSize,
    total,
}: SearchPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(total / pageSize);
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    function navigateTo(newPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(newPage));
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="mt-12 flex items-center justify-between border-t border-zinc-800 pt-6">
            <button
                onClick={() => navigateTo(page - 1)}
                disabled={!hasPrev}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
                Previous
            </button>

            <p className="text-sm text-zinc-500">
                Page {page} of {totalPages}
            </p>

            <button
                onClick={() => navigateTo(page + 1)}
                disabled={!hasNext}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
                Next
            </button>
        </div>
    );
}

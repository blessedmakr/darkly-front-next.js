"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeaderSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentQuery = searchParams.get("query") ?? "";
    const [inputValue, setInputValue] = useState(currentQuery);

    // Keep the input in sync with the URL (e.g. when Clear removes the query param).
    useEffect(() => {
        setInputValue(currentQuery);
    }, [currentQuery]);

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const query = inputValue.trim();
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("query", query);
        } else {
            params.delete("query");
        }
        params.delete("page");
        router.push(`/motion-pictures?${params.toString()}`);
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search motion pictures"
            className="w-full max-w-xl"
        >
            <label htmlFor="header-search" className="sr-only">
                Search horror motion pictures
            </label>

            <div className="group relative w-full">
                <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-900/95 transition-all duration-200 hover:border-[#9dff20] hover:shadow-[0_0_0_1px_rgba(157,255,32,0.18)] focus-within:border-[#9dff20] focus-within:shadow-[0_0_0_1px_rgba(157,255,32,0.34),0_0_22px_rgba(157,255,32,0.08)]">
                    <input
                        id="header-search"
                        type="search"
                        name="query"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search horror motion pictures..."
                        className="w-full bg-transparent px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    />

                    <button
                        type="submit"
                        aria-label="Search"
                        className="flex h-full items-center pr-4 text-zinc-400 transition-colors duration-200 hover:text-[#9dff20] group-hover:text-[#9dff20] group-focus-within:text-[#9dff20]"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
}
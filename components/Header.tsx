"use client";

import { Suspense } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import HeaderSearch from "./HeaderSearch";
import AdminLink from "./AdminLink";

interface HeaderProps {
    overlay?: boolean;
}

export default function Header({ overlay = false }: HeaderProps) {
    const { isSignedIn } = useAuth();
    return (
        <header
            className={[
                "top-0 z-50 w-full transition-colors duration-300",
                overlay
                    ? "fixed left-0 bg-transparent"
                    : "sticky border-b border-zinc-800 bg-zinc-950/95 backdrop-blur",
            ].join(" ")}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:gap-6">
                <div className="flex shrink-0 items-center gap-6">
                    <Link
                        href="/"
                        className={[
                            "text-sm uppercase tracking-[0.3em] transition-colors",
                            overlay ? "text-red-400" : "text-red-500",
                        ].join(" ")}
                    >
                        Darkly
                    </Link>

                    <nav className="hidden md:block">
                        <ul
                            className={[
                                "flex items-center gap-6 text-sm transition-colors",
                                overlay ? "text-zinc-100" : "text-zinc-300",
                            ].join(" ")}
                        >
                            <li>
                                <Link
                                    href="/motion-pictures"
                                    className="transition hover:text-white"
                                >
                                    Discover
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="w-full xl:flex-1">
                    <div
                        className={[
                            "w-full",
                            overlay
                                ? "[&_*]:border-white/15 [&_*]:bg-black/25 [&_*]:text-zinc-100 [&_*]:placeholder:text-zinc-400"
                                : "",
                        ].join(" ")}
                    >
                        {/*
                         * Suspense is required here because HeaderSearch calls useSearchParams().
                         * Without it, Next.js escalates the dynamic boundary up to the root
                         * layout, forcing every page to opt out of static rendering.
                         */}
                        <Suspense fallback={null}>
                            <HeaderSearch />
                        </Suspense>
                    </div>
                </div>

                <div className="hidden shrink-0 items-center gap-3 lg:flex">
                    {isSignedIn === false && (
                        <>
                            <SignInButton>
                                <button className="text-sm text-zinc-400 transition hover:text-zinc-100">
                                    Sign in
                                </button>
                            </SignInButton>
                            <SignUpButton>
                                <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100">
                                    Sign up
                                </button>
                            </SignUpButton>
                        </>
                    )}
                    {isSignedIn && (
                        <>
                            <nav className="hidden items-center gap-4 text-sm md:flex">
                                <Link href="/recommendations" className="text-zinc-400 transition hover:text-zinc-100">
                                    Recommendations
                                </Link>
                                <Link href="/watchlist" className="text-zinc-400 transition hover:text-zinc-100">
                                    Watchlist
                                </Link>
                                <Link href="/favorites" className="text-zinc-400 transition hover:text-zinc-100">
                                    Favorites
                                </Link>
                                <Link href="/ratings" className="text-zinc-400 transition hover:text-zinc-100">
                                    My Ratings
                                </Link>
                                <Link href="/submit" className="text-zinc-400 transition hover:text-zinc-100">
                                    Submit
                                </Link>
                                <AdminLink />
                            </nav>
                            <UserButton />
                        </>
                    )}
                </div>


            </div>

            {overlay && (
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.60)_0%,rgba(0,0,0,0.26)_58%,rgba(0,0,0,0)_100%)]" />
            )}
        </header>
    );
}
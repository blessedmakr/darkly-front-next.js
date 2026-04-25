"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";

const TABS = [
    {
        href: "/motion-pictures",
        label: "Browse",
        exact: false,
        icon: (active: boolean) => (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
        ),
    },
    {
        href: "/watchlist",
        label: "Watchlist",
        exact: false,
        icon: (active: boolean) => (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
            </svg>
        ),
    },
    {
        href: "/favorites",
        label: "Favorites",
        exact: false,
        icon: (active: boolean) => (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" />
            </svg>
        ),
    },
    {
        href: "/ratings",
        label: "Ratings",
        exact: false,
        icon: (active: boolean) => (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
    },
    {
        href: "/recommendations",
        label: "For You",
        exact: false,
        icon: (active: boolean) => (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();

    function isActive(href: string, exact: boolean) {
        return exact ? pathname === href : pathname.startsWith(href);
    }

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
            <div className="flex items-stretch overflow-x-auto scrollbar-none">
                {TABS.map((tab) => {
                    const active = isActive(tab.href, tab.exact);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={[
                                "flex w-20 shrink-0 flex-col items-center justify-center gap-1 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors",
                                active ? "text-red-400" : "text-zinc-500 hover:text-zinc-300",
                            ].join(" ")}
                        >
                            {tab.icon(active)}
                            {tab.label}
                        </Link>
                    );
                })}

                {/* Account tab */}
                <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 py-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    {isSignedIn ? (
                        <>
                            <UserButton appearance={{ elements: { avatarBox: "h-6 w-6" } }} />
                            Account
                        </>
                    ) : (
                        <SignInButton>
                            <button className="flex flex-col items-center gap-1">
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                Sign in
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>
        </nav>
    );
}

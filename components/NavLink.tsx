"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
    href: string;
    children: ReactNode;
    /** Hover/inactive class for the link text. */
    className?: string;
    /** Active class for the link text (defaults to a brighter shade). */
    activeClassName?: string;
}

/**
 * Header nav link with a shared visual language for active + hover states:
 * a thin red underline that's full-width with a soft glow when active, and
 * sweeps in from the left on hover when inactive.
 */
export default function NavLink({
    href,
    children,
    className = "text-zinc-400 hover:text-zinc-100",
    activeClassName = "text-zinc-100",
}: NavLinkProps) {
    const pathname = usePathname();
    const isActive =
        href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`group relative inline-flex transition-colors ${isActive ? activeClassName : className}`}
        >
            {children}
            <span
                aria-hidden="true"
                className={[
                    "pointer-events-none absolute -bottom-1 left-0 h-px bg-red-500 transition-all duration-300 ease-out",
                    isActive
                        ? "w-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "w-0 group-hover:w-full",
                ].join(" ")}
            />
        </Link>
    );
}

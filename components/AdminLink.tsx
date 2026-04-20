"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const ROLE_CACHE_KEY = "darkly:role";

export default function AdminLink() {
    const { isSignedIn, getToken } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!isSignedIn) return;

        const cached = sessionStorage.getItem(ROLE_CACHE_KEY);
        if (cached) {
            if (cached === "admin") setIsAdmin(true);
            return;
        }

        let cancelled = false;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        getToken()
            .then((token) =>
                fetch(`${base}/auth/role`, { headers: { Authorization: `Bearer ${token}` } })
                    .then((r) => r.json())
                    .then((data) => {
                        sessionStorage.setItem(ROLE_CACHE_KEY, data.role ?? "");
                        if (!cancelled && data.role === "admin") setIsAdmin(true);
                    })
            )
            .catch(() => null);
        return () => { cancelled = true; };
    }, [isSignedIn, getToken]);

    if (!isAdmin) return null;

    return (
        <Link href="/admin" className="text-zinc-400 transition hover:text-zinc-100">
            Admin
        </Link>
    );
}

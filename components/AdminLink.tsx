"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function AdminLink() {
    const { isSignedIn, getToken } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!isSignedIn) return;

        let cancelled = false;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        getToken()
            .then((token) =>
                fetch(`${base}/auth/role`, { headers: { Authorization: `Bearer ${token}` } })
                    .then((r) => r.json())
                    .then((data) => {
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

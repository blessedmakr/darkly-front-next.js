"use client";

import Link from "next/link";
import { useRole } from "./RoleProvider";

export default function AdminLink() {
    const { isAdmin } = useRole();

    if (!isAdmin) return null;

    return (
        <Link href="/admin" className="text-zinc-400 transition hover:text-zinc-100">
            Admin
        </Link>
    );
}

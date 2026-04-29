"use client";

import { useRole } from "./UserDataProvider";
import NavLink from "./NavLink";

export default function AdminLink() {
    const { isAdmin } = useRole();

    if (!isAdmin) return null;

    return <NavLink href="/admin">Admin</NavLink>;
}

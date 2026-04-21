"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type Role = "member" | "trusted_curator" | "admin" | null;

interface RoleContextValue {
    role: Role;
    isAdmin: boolean;
    isCurator: boolean;
}

const RoleContext = createContext<RoleContextValue>({
    role: null,
    isAdmin: false,
    isCurator: false,
});

export function useRole() {
    return useContext(RoleContext);
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn, userId } = useAuth();
    const [role, setRole] = useState<Role>(null);
    const fetchedForRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isSignedIn || !userId) {
            setRole(null);
            fetchedForRef.current = null;
            return;
        }

        if (fetchedForRef.current === userId) return;
        fetchedForRef.current = userId;

        getToken()
            .then((token) =>
                fetch(`${API}/auth/role`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
            .then((r) => r.json())
            .then((data) => setRole(data.role ?? "member"))
            .catch(() => setRole("member"));
    }, [isSignedIn, userId, getToken]);

    const isAdmin = role === "admin";
    const isCurator = role === "trusted_curator" || role === "admin";

    return (
        <RoleContext.Provider value={{ role, isAdmin, isCurator }}>
            {children}
        </RoleContext.Provider>
    );
}

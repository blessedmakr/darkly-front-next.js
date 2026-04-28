"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PUBLIC_API_BASE as API } from "../lib/config";

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

    const effectiveRole: Role = isSignedIn && userId ? role : null;
    const isAdmin = effectiveRole === "admin";
    const isCurator = effectiveRole === "trusted_curator" || effectiveRole === "admin";

    return (
        <RoleContext.Provider value={{ role: effectiveRole, isAdmin, isCurator }}>
            {children}
        </RoleContext.Provider>
    );
}

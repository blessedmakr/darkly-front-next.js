"use client";

import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";

interface HeroCTAsProps {
    motionPictureId: number;
}

export default function HeroCTAs({ motionPictureId }: HeroCTAsProps) {
    const { isSignedIn } = useAuth();

    if (isSignedIn) {
        return (
            <Link
                href={`/motion-pictures/${motionPictureId}#rate`}
                className="rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100"
            >
                Rate this film
            </Link>
        );
    }

    return (
        <SignInButton>
            <button className="rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-400 hover:text-zinc-100">
                Sign in to rate
            </button>
        </SignInButton>
    );
}

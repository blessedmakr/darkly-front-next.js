"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
    motionPictureId: number;
}

export default function ViewTracker({ motionPictureId }: ViewTrackerProps) {
    useEffect(() => {
        // Fire-and-forget — never block rendering or show errors to the user
        fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/motion-pictures/${motionPictureId}/view`,
            { method: "POST" }
        ).catch(() => null);
    }, [motionPictureId]);

    return null;
}

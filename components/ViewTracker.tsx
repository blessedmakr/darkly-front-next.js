"use client";

import { useEffect } from "react";
import { PUBLIC_API_BASE } from "../lib/config";

interface ViewTrackerProps {
    motionPictureId: number;
}

export default function ViewTracker({ motionPictureId }: ViewTrackerProps) {
    useEffect(() => {
        // Fire-and-forget — never block rendering or show errors to the user
        fetch(
            `${PUBLIC_API_BASE}/motion-pictures/${motionPictureId}/view`,
            { method: "POST" }
        ).catch(() => null);
    }, [motionPictureId]);

    return null;
}

"use client";

import { useState, useRef, useEffect } from "react";
import type { TagDto } from "../types/motion-picture";
import { formatTagName } from "../lib/motion-picture";

const TAG_TYPE_LABELS: Record<string, string> = {
    tone: "Tone",
    subgenre: "Subgenre",
    content_warning: "Content Warning",
    gore_level: "Gore",
    violence_level: "Violence",
    setting: "Setting",
    audience: "Audience",
    seasonal: "Seasonal",
    region: "Region",
    production: "Production",
};

interface TagsPopoverProps {
    tags: TagDto[];
}

export default function TagsPopover({ tags }: TagsPopoverProps) {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const tagsByType = tags.reduce<Record<string, TagDto[]>>((acc, tag) => {
        (acc[tag.tagType] ??= []).push(tag);
        return acc;
    }, {});

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    if (tags.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="mt-3 flex w-full items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
            >
                <span>{tags.length} tag{tags.length !== 1 ? "s" : ""}</span>
                <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
            </button>

            {open && (
                <div
                    ref={popoverRef}
                    className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-64 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md"
                >
                    {Object.entries(tagsByType).map(([type, typeTags]) => (
                        <div key={type} className="mb-2.5 last:mb-0">
                            <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                                {TAG_TYPE_LABELS[type] ?? type}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {typeTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300"
                                    >
                                        {formatTagName(tag.tagType, tag.name)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

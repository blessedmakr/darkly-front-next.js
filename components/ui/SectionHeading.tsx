import type { HTMLAttributes, LabelHTMLAttributes } from "react";

const STYLE = "text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500";

/**
 * Eyebrow / section heading style used across the app:
 * uppercase, wide tracking, small, muted.
 */
export default function SectionHeading({
    className = "",
    children,
    ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p {...rest} className={`${STYLE} ${className}`}>
            {children}
        </p>
    );
}

/** Label variant of SectionHeading for form fields. */
export function SectionLabel({
    className = "",
    children,
    ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label {...rest} className={`${STYLE} ${className}`}>
            {children}
        </label>
    );
}

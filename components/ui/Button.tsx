import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const VARIANTS: Record<Variant, string> = {
    primary:
        "bg-lime-400 text-zinc-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40",
    secondary:
        "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-40",
    ghost:
        "text-zinc-400 hover:text-zinc-200 disabled:opacity-40",
};

const SIZES: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
};

export default function Button({
    variant = "primary",
    size = "md",
    className = "",
    ...rest
}: ButtonProps) {
    return (
        <button
            {...rest}
            className={`rounded-md font-semibold transition-colors ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
        />
    );
}

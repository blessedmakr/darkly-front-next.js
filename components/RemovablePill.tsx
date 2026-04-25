interface RemovablePillProps {
    label: string;
    onRemove: () => void;
    disabled?: boolean;
    variant?: "zinc" | "lime";
}

export default function RemovablePill({
    label,
    onRemove,
    disabled,
    variant = "zinc",
}: RemovablePillProps) {
    const borderBg = variant === "lime"
        ? "border-lime-400/20 bg-lime-400/5"
        : "border-zinc-700 bg-zinc-800";

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border ${borderBg} px-3 py-1 text-xs text-zinc-200`}>
            {label}
            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="ml-1 text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-40"
                aria-label={`Remove ${label}`}
            >
                ×
            </button>
        </span>
    );
}

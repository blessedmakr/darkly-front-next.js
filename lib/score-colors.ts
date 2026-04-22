export const SCORE_META = [
    {
        key: "score" as const,
        label: "Overall",
        color: "text-zinc-100",
        shadow: "drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]",
    },
    {
        key: "fearScore" as const,
        label: "Fear",
        color: "text-red-300",
        shadow: "drop-shadow-[0_0_10px_rgba(252,165,165,0.7)]",
    },
    {
        key: "atmosphereScore" as const,
        label: "Atmos",
        color: "text-violet-300",
        shadow: "drop-shadow-[0_0_10px_rgba(196,181,253,0.7)]",
    },
    {
        key: "goreScore" as const,
        label: "Gore",
        color: "text-orange-300",
        shadow: "drop-shadow-[0_0_10px_rgba(253,186,116,0.7)]",
    },
] as const;

export type ScoreKey = typeof SCORE_META[number]["key"];

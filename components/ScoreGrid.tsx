import { SCORE_META } from "../lib/score-colors";

interface Props {
    score: number | null;
    fearScore: number | null;
    atmosphereScore: number | null;
    goreScore: number | null;
    tight?: boolean;
}

export default function ScoreGrid({ score, fearScore, atmosphereScore, goreScore, tight }: Props) {
    const values = { score, fearScore, atmosphereScore, goreScore };

    if (tight) {
        const col1 = SCORE_META.filter((_, i) => i % 2 === 0);
        const col2 = SCORE_META.filter((_, i) => i % 2 === 1);
        const renderCol = (items: typeof SCORE_META[number][]) => (
            <div className="flex flex-col gap-y-1">
                {items.map(({ key, label, color, shadow }) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-600">{label}</span>
                        <span className={`text-xs font-semibold tabular-nums ${color} ${shadow}`}>
                            {values[key] != null ? (values[key] as number).toFixed(1) : "—"}
                        </span>
                    </div>
                ))}
            </div>
        );
        return <div className="flex gap-3">{renderCol(col1)}{renderCol(col2)}</div>;
    }

    return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {SCORE_META.map(({ key, label, color, shadow }) => (
                <div key={key} className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-600">{label}</span>
                    <span className={`text-xs font-semibold tabular-nums ${color} ${shadow}`}>
                        {values[key] != null ? (values[key] as number).toFixed(1) : "—"}
                    </span>
                </div>
            ))}
        </div>
    );
}

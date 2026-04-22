import { SCORE_META } from "../lib/score-colors";

interface Props {
    score: number | null;
    fearScore: number | null;
    atmosphereScore: number | null;
    goreScore: number | null;
    className?: string;
}

export default function ScoreGrid({ score, fearScore, atmosphereScore, goreScore, className }: Props) {
    const values = { score, fearScore, atmosphereScore, goreScore };
    return (
        <div className={`grid grid-cols-2 gap-x-3 gap-y-1 ${className ?? ""}`}>
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

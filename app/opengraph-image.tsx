import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "watchdarkly — Horror Film Ratings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    background:
                        "radial-gradient(ellipse at 30% 40%, #1a0606 0%, #09090b 60%)",
                    padding: "0 96px",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Brand mark */}
                <div
                    style={{
                        fontSize: 28,
                        textTransform: "uppercase",
                        letterSpacing: "0.45em",
                        color: "#ef4444",
                        marginBottom: 32,
                    }}
                >
                    watchdarkly
                </div>

                {/* Red rule */}
                <div
                    style={{
                        height: 2,
                        width: 64,
                        background: "#ef4444",
                        boxShadow: "0 0 16px rgba(239, 68, 68, 0.6)",
                        marginBottom: 32,
                    }}
                />

                {/* Headline */}
                <div
                    style={{
                        fontSize: 84,
                        fontWeight: 700,
                        lineHeight: 1.05,
                        letterSpacing: "-0.02em",
                        color: "#f4f4f5",
                        marginBottom: 28,
                        maxWidth: 900,
                    }}
                >
                    Horror Film Ratings
                </div>

                {/* Subhead */}
                <div
                    style={{
                        fontSize: 32,
                        lineHeight: 1.3,
                        color: "#a1a1aa",
                        maxWidth: 880,
                    }}
                >
                    Rated by fear, gore, and atmosphere — so you always know what you&apos;re in for.
                </div>
            </div>
        ),
        { ...size }
    );
}

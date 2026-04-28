import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const clerkAppearance = {
    variables: {
        colorBackground: "#18181b",
        colorInputBackground: "#27272a",
        colorText: "#f4f4f5",
        colorTextSecondary: "#d4d4d8",
        colorPrimary: "#ef4444",
        colorDanger: "#f87171",
        colorNeutral: "#71717a",
        borderRadius: "0.5rem",
        fontFamily: "inherit",
        fontSize: "0.875rem",
    },
    elements: {
        card: {
            backgroundColor: "#18181b",
            border: "1px solid #3f3f46",
            boxShadow: "0 0 60px rgba(239, 68, 68, 0.06), 0 25px 50px rgba(0,0,0,0.6)",
        },
        headerTitle: { color: "#f4f4f5", fontWeight: "600" },
        headerSubtitle: { color: "#a1a1aa" },
        socialButtonsBlockButton: {
            backgroundColor: "#27272a",
            border: "1px solid #52525b",
            color: "#d4d4d8",
        },
        dividerLine: { backgroundColor: "#3f3f46" },
        dividerText: { color: "#71717a" },
        formFieldLabel: { color: "#a1a1aa", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" },
        formFieldInput: {
            backgroundColor: "#27272a",
            border: "1px solid #52525b",
            color: "#f4f4f5",
        },
        formButtonPrimary: {
            backgroundColor: "#dc2626",
            color: "#ffffff",
            fontWeight: "600",
        },
        footerActionLink: { color: "#f87171" },
        footerActionText: { color: "#71717a" },
        identityPreviewText: { color: "#d4d4d8" },
        identityPreviewEditButton: { color: "#f87171" },
        formResendCodeLink: { color: "#f87171" },
        otpCodeFieldInput: {
            backgroundColor: "#27272a",
            border: "1px solid #52525b",
            color: "#f4f4f5",
        },
        formFieldSuccessText: { color: "#a3e635" },
        formFieldErrorText: { color: "#f87171" },
    },
};

export default function SignInPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.12),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_100%,rgba(239,68,68,0.04),transparent)]" />

            <div className="relative mb-10 text-center">
                <Link
                    href="/"
                    className="text-2xl uppercase tracking-[0.4em] text-red-500 transition-colors hover:text-red-400"
                >
                    watchdarkly
                </Link>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Horror film catalog
                </p>
            </div>

            <div className="relative w-full max-w-md">
                <SignIn appearance={clerkAppearance} />
            </div>

            <p className="relative mt-8 text-xs text-zinc-600">
                <Link
                    href="/motion-pictures"
                    className="transition-colors hover:text-zinc-400"
                >
                    Browse without signing in →
                </Link>
            </p>
        </main>
    );
}

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const clerkAppearance = {
    variables: {
        colorBackground: "#09090b",
        colorInputBackground: "#18181b",
        colorText: "#f4f4f5",
        colorTextSecondary: "#a1a1aa",
        colorPrimary: "#ef4444",
        colorDanger: "#f87171",
        colorNeutral: "#3f3f46",
        borderRadius: "0.5rem",
        fontFamily: "inherit",
        fontSize: "0.875rem",
    },
    elements: {
        card: "shadow-none border border-zinc-800 bg-zinc-900/50 backdrop-blur",
        headerTitle: "text-zinc-100 font-semibold",
        headerSubtitle: "text-zinc-400",
        socialButtonsBlockButton: "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100",
        socialButtonsBlockButtonText: "text-zinc-300",
        dividerLine: "bg-zinc-800",
        dividerText: "text-zinc-600",
        formFieldLabel: "text-zinc-400 text-xs uppercase tracking-widest",
        formFieldInput: "border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500",
        formButtonPrimary: "bg-red-600 hover:bg-red-500 text-white",
        footerActionLink: "text-red-400 hover:text-red-300",
        footerActionText: "text-zinc-500",
        identityPreviewText: "text-zinc-300",
        identityPreviewEditButton: "text-red-400 hover:text-red-300",
        formResendCodeLink: "text-red-400 hover:text-red-300",
        otpCodeFieldInput: "border-zinc-700 bg-zinc-800 text-zinc-100",
        alertText: "text-zinc-300",
        formFieldSuccessText: "text-lime-400",
        formFieldErrorText: "text-red-400",
    },
};

export default function SignInPage() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(239,68,68,0.05),transparent)]" />

            <div className="relative mb-8 text-center">
                <Link
                    href="/"
                    className="text-sm uppercase tracking-[0.3em] text-red-500 transition-colors hover:text-red-400"
                >
                    Darkly
                </Link>
                <p className="mt-2 text-xs text-zinc-600 tracking-wide">
                    Horror film catalog
                </p>
            </div>

            <SignIn appearance={clerkAppearance} />

            <p className="relative mt-8 text-xs text-zinc-700">
                <Link
                    href="/motion-pictures"
                    className="transition-colors hover:text-zinc-500"
                >
                    Browse without signing in →
                </Link>
            </p>
        </main>
    );
}

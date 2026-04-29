import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Errors-only setup. Performance tracing and Session Replay are explicitly
    // off to keep client bundle and runtime cost minimal. Toggle on later if needed.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Drop noisy/expected errors before they get sent.
    ignoreErrors: [
        // ResizeObserver in benign loops — common browser noise, not a real bug.
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
    ],

    // No DSN = no-op, so this file is safe to ship before SENTRY_DSN is set.
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

// Required by Next.js for capturing navigation transitions in app router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

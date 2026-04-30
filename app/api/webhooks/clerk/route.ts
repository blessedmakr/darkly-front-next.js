import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { Resend } from "resend";
import { buildWelcomeEmail } from "../../../../lib/emails/welcome";

// Clerk → Svix signs every webhook with a secret you generate when creating
// the endpoint in the Clerk dashboard. The signature header confirms the
// request actually came from Clerk and wasn't replayed.
const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.WELCOME_EMAIL_FROM ?? "watchdarkly <hello@watchdarkly.com>";

interface ClerkUserCreatedEvent {
    type: "user.created";
    data: {
        id: string;
        first_name: string | null;
        email_addresses: Array<{
            id: string;
            email_address: string;
        }>;
        primary_email_address_id: string | null;
    };
}

interface ClerkOtherEvent {
    type: string;
    data: unknown;
}

type ClerkEvent = ClerkUserCreatedEvent | ClerkOtherEvent;

export async function POST(req: Request) {
    if (!SIGNING_SECRET) {
        console.error("[clerk-webhook] CLERK_WEBHOOK_SIGNING_SECRET is not set");
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Svix sends the timestamp + ID + signature in headers. We pass them
    // along with the raw body to verify(), which throws if anything is off.
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const rawBody = await req.text();

    let event: ClerkEvent;
    try {
        const wh = new Webhook(SIGNING_SECRET);
        event = wh.verify(rawBody, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as ClerkEvent;
    } catch (err) {
        console.error("[clerk-webhook] signature verification failed", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // We only care about user.created. Everything else gets a 200 so Clerk
    // doesn't retry forever and so we don't have to subscribe selectively.
    if (event.type !== "user.created") {
        return NextResponse.json({ ok: true, ignored: event.type });
    }

    const user = (event as ClerkUserCreatedEvent).data;
    const primaryEmail = user.email_addresses.find((e) => e.id === user.primary_email_address_id)?.email_address
        ?? user.email_addresses[0]?.email_address;

    if (!primaryEmail) {
        console.error("[clerk-webhook] user.created has no email", { userId: user.id });
        return NextResponse.json({ ok: true, skipped: "no-email" });
    }

    if (!RESEND_API_KEY) {
        console.error("[clerk-webhook] RESEND_API_KEY is not set");
        return NextResponse.json({ ok: true, skipped: "resend-not-configured" });
    }

    const { subject, html, text } = buildWelcomeEmail({ firstName: user.first_name });

    try {
        const resend = new Resend(RESEND_API_KEY);
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: primaryEmail,
            subject,
            html,
            text,
        });
        if (error) {
            console.error("[clerk-webhook] resend send failed", { userId: user.id, error });
            // Return 200 anyway — the webhook itself succeeded. We don't want
            // Clerk to retry, since Resend may have already accepted the message.
        }
    } catch (err) {
        console.error("[clerk-webhook] resend threw", { userId: user.id, err });
    }

    return NextResponse.json({ ok: true });
}

import { SITE_URL } from "../config";

interface WelcomeEmailProps {
    firstName: string | null;
}

interface WelcomeEmail {
    subject: string;
    html: string;
    text: string;
}

// Build the URL for a multi-tag filter search. Tag slug values must match
// what exists in the tags table (e.g. "atmospheric", "cosmic-horror").
function tagSearchUrl(tags: Array<{ type: string; name: string }>): string {
    const params = tags.map((t) => `tag=${encodeURIComponent(`${t.type}:${t.name}`)}`).join("&");
    return `${SITE_URL}/motion-pictures?${params}`;
}

const PICK_1 = {
    label: "Atmospheric · Possession · Rural",
    url: tagSearchUrl([
        { type: "tone",     name: "atmospheric" },
        { type: "subgenre", name: "possession" },
        { type: "setting",  name: "rural" },
    ]),
};

const PICK_2 = {
    label: "Alien · Cosmic Horror · Space",
    url: tagSearchUrl([
        { type: "subgenre", name: "alien" },
        { type: "subgenre", name: "cosmic-horror" },
        { type: "setting",  name: "space" },
    ]),
};

export function buildWelcomeEmail({ firstName }: WelcomeEmailProps): WelcomeEmail {
    const greeting = firstName ? `Hi ${firstName},` : "Hi,";

    const subject = "Welcome to watchdarkly — your horror catalog awaits";

    const text = [
        greeting,
        "",
        "Thanks for joining watchdarkly. We rate horror films across four dimensions — fear, gore, atmosphere, and overall — so you always know what you're in for before you press play.",
        "",
        "Two ways to get started:",
        "  • Rate any 5 films, OR",
        "  • Favorite just one — and we'll start tailoring recommendations to your taste.",
        "",
        `Try a curated tag search:`,
        `  • ${PICK_1.label} → ${PICK_1.url}`,
        `  • ${PICK_2.label} → ${PICK_2.url}`,
        "",
        `Or browse the full catalog: ${SITE_URL}/motion-pictures`,
        "",
        "— watchdarkly",
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f4f4f5;">
    <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

        <!-- Brand mark -->
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.4em;color:#ef4444;margin-bottom:8px;">
            watchdarkly
        </div>
        <div style="height:2px;width:48px;background:#ef4444;margin:16px 0 32px 0;"></div>

        <!-- Greeting -->
        <p style="font-size:18px;line-height:1.6;color:#f4f4f5;margin:0 0 16px 0;">
            ${greeting}
        </p>

        <p style="font-size:16px;line-height:1.7;color:#a1a1aa;margin:0 0 24px 0;">
            Thanks for joining watchdarkly. We rate horror films across four dimensions — <strong style="color:#f4f4f5;">fear, gore, atmosphere, and overall</strong> — so you always know what you&rsquo;re in for before you press play.
        </p>

        <!-- Onboarding -->
        <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#71717a;font-weight:600;margin:32px 0 12px 0;">
            Two ways to get started
        </h2>
        <ul style="font-size:15px;line-height:1.7;color:#d4d4d8;margin:0 0 24px 0;padding-left:20px;">
            <li>Rate any <strong style="color:#f4f4f5;">5 films</strong>, or</li>
            <li>Favorite just <strong style="color:#f4f4f5;">one</strong> — and we&rsquo;ll start tailoring recommendations to your taste.</li>
        </ul>

        <!-- Tag picks -->
        <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#71717a;font-weight:600;margin:32px 0 12px 0;">
            Try a curated tag search
        </h2>
        <p style="margin:0 0 12px 0;">
            <a href="${PICK_1.url}" style="display:inline-block;color:#a3e635;font-size:15px;text-decoration:none;border-bottom:1px solid rgba(163,230,53,0.3);padding-bottom:2px;">
                ${PICK_1.label} →
            </a>
        </p>
        <p style="margin:0 0 24px 0;">
            <a href="${PICK_2.url}" style="display:inline-block;color:#a3e635;font-size:15px;text-decoration:none;border-bottom:1px solid rgba(163,230,53,0.3);padding-bottom:2px;">
                ${PICK_2.label} →
            </a>
        </p>

        <!-- CTA button -->
        <div style="margin:40px 0 32px 0;">
            <a href="${SITE_URL}/motion-pictures" style="display:inline-block;background:#dc2626;color:#ffffff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">
                Browse the catalog →
            </a>
        </div>

        <!-- Footer -->
        <hr style="border:none;border-top:1px solid #27272a;margin:40px 0 24px 0;" />
        <p style="font-size:12px;color:#52525b;line-height:1.6;margin:0;">
            You&rsquo;re receiving this because you signed up at <a href="${SITE_URL}" style="color:#71717a;text-decoration:underline;">watchdarkly</a>.
        </p>
    </div>
</body>
</html>`;

    return { subject, html, text };
}

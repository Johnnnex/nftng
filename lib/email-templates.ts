import "server-only";
import type { RegisterFormData } from "./schemas";

const EVENT_LABELS: Record<string, string> = {
  soccer_tournament: "Soccer Tournament",
  unchain_summer_conference: "Unchain Summer Conference",
};

export function registrationConfirmationEmail(data: RegisterFormData): string {
  const eventList = data.events
    .map((e) => `<li style="margin-bottom:8px;font-size:15px;color:#1a1a1a;">${EVENT_LABELS[e] ?? e}</li>`)
    .join("");

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Unchain Summer</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F4F4F4;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Green header bar -->
          <tr>
            <td style="background:#6EC93E;border-radius:16px 16px 0 0;padding:52px 48px 40px;text-align:center;">
              <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:2px;">
                Unchain Summer
              </p>
              <h1 style="margin:0;color:#ffffff;font-size:42px;font-weight:800;letter-spacing:-1px;line-height:1.1;">
                Welcome,<br/>${data.first_name}.
              </h1>
              <p style="margin:20px 0 0;color:rgba(255,255,255,0.85);font-size:16px;line-height:1.6;">
                You're officially part of the experience.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:48px;border-radius:0 0 16px 16px;">

              <p style="margin:0 0 20px;color:#1a1a1a;font-size:16px;line-height:1.7;">
                We're glad you're here. Unchain Summer is where Africa's builders, creators, and Web3 pioneers
                come together — and you just made the list.
              </p>

              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                We'll reach out as we get closer to the event with everything you need —
                agenda, venue, and all the good stuff. Until then, just know you're locked in.
              </p>

              <!-- What you're joining -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:#F9FFF5;border-left:4px solid #6EC93E;border-radius:0 8px 8px 0;margin-bottom:36px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#6EC93E;text-transform:uppercase;letter-spacing:1.5px;">
                      You're registered for
                    </p>
                    <ul style="margin:0;padding-left:18px;">
                      ${eventList}
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#1a1a1a;font-size:15px;font-weight:600;">Got questions?</p>
              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                Hit us at <a href="mailto:support@nftng.io" style="color:#6EC93E;text-decoration:none;font-weight:600;">support@nftng.io</a>
                — we're real people and we actually respond.
              </p>

              <p style="margin:0;color:#1a1a1a;font-size:15px;line-height:1.7;">
                See you there 🌍<br/>
                <strong style="color:#6EC93E;">— The Unchain Summer Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px;text-align:center;">
              <p style="margin:0;color:#bbb;font-size:12px;line-height:1.8;">
                © ${year} NFTng · Unchain Summer &nbsp;·&nbsp;
                <a href="mailto:support@nftng.io" style="color:#bbb;text-decoration:none;">support@nftng.io</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detail(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#888;font-size:13px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#1a1a1a;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;
}

export function contactReceiptEmail(name: string, subject: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Contact Form — Unchain Summer</title></head>
<body style="margin:0;padding:0;background:#F9F9F9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;border-radius:16px 16px 0 0;padding:32px 40px;">
            <h2 style="margin:0;color:#fff;font-size:22px;">New Contact Message</h2>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detail("From", name)}
              ${detail("Subject", subject)}
            </table>
            <hr style="border:none;border-top:1px solid #EAECF0;margin:24px 0;"/>
            <p style="margin:0;color:#555;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

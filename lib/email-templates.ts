import "server-only";
import type { RegisterFormData } from "./schemas";

const EVENT_LABELS: Record<string, string> = {
  soccer_tournament: "Football Tournament, 26 July 2026",
  unchain_summer_conference: "Unchain Summer Conference, 30 July 2026",
  boxing_night: "Boxing Night, 31 July 2026",
};

export function registrationConfirmationEmail(data: RegisterFormData): string {
  const eventList = data.events
    .map(
      (e, i, arr) =>
        `<li class="event-li" style="margin-bottom:${i < arr.length - 1 ? "8px" : "0"};font-size:15px;color:#1a1a1a;">${EVENT_LABELS[e] ?? e}</li>`,
    )
    .join("\n                        ");

  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Registration Confirmed - Unchain Summer 2026</title>

    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
        .two-col td { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }

      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .pill-bg { background-color: #2c2c2e !important; }
        .pill-text { color: #e5e5ea !important; }
        .pill-label { color: #aeaeb2 !important; }
        .event-card { background-color: #1d2d1a !important; }
        .event-li { color: #e5e5ea !important; }
      }

      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .pill-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .pill-text { color: #e5e5ea !important; }
      [data-ogsc] .pill-label { color: #aeaeb2 !important; }
      [data-ogsc] .event-card { background-color: #1d2d1a !important; }
      [data-ogsc] .event-li { color: #e5e5ea !important; }
    </style>
  </head>

  <body
    id="body"
    style="margin:0;padding:0;background-color:#f4f4f4;font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;"
  >
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;">
      <tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px;">
      <tr>
        <td align="center" valign="top">
          <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px;">

            <!-- HERO IMAGE -->
            <tr>
              <td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
                <img
                  src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png"
                  width="600"
                  height="130"
                  alt="Unchain Summer 2026, The North Star"
                  style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;"
                />
              </td>
            </tr>

            <!-- WHITE BODY -->
            <tr>
              <td class="body-pad body-section" style="background-color:#ffffff;padding:40px;position:relative;">

                <p class="body-text" style="margin:0 0 20px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">
                  Hello ${data.alias}
                </p>

                <p class="body-subtext" style="margin:0 0 12px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  You're officially in!
                </p>

                <p class="body-subtext" style="margin:0 0 12px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  Welcome to Unchain Summer 2026.
                </p>

                <p class="body-subtext" style="margin:0 0 12px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  You've secured access to
                  <b class="body-strong" style="font-weight:600;color:#1a1a1a;">Africa's most immersive Web3 experience.</b>
                </p>

                <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  This email serves as your registration confirmation. Please keep it safe and present it when required at check-in.
                </p>

                <!-- Event list -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="event-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">
                        You're registered for
                      </p>
                      <ul style="margin:0;padding-left:18px;">
                        ${eventList}
                      </ul>
                    </td>
                  </tr>
                </table>

                <!-- Date + Location pills -->
                <table class="two-col" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:36px;">
                  <tr>
                    <td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:20px 24px;">
                      <p class="pill-label" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;">Dates</p>
                      <p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.5;">July 26 - August 1, 2026</p>
                    </td>
                    <td width="4%"></td>
                    <td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:20px 24px;">
                      <p class="pill-label" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;">Location</p>
                      <p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.5;">Lagos, Nigeria</p>
                    </td>
                  </tr>
                </table>

                <!-- CTA button -->
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 36px;">
                  <tr>
                    <td style="background-color:#6ec93e;border-radius:8px;text-align:center;">
                      <a class="cta-btn" href="https://unchainsummer.nftng.io" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                        Visit Unchain Summer
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Questions -->
                <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Got questions?</p>
                <p class="body-subtext" style="margin:0 0 32px;font-size:15px;color:#444444;line-height:1.75;">
                  Reach us here: <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a>
                </p>

                <!-- Sign-off -->
                <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">
                  See you at Unchain Summer 2026.<br />
                  <strong style="color:#6ec93e;">The Unchain Summer Team</strong>
                </p>

                <!-- Axis — decorative, no block space -->
                <img
                  src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png"
                  width="215"
                  height="168"
                  alt=""
                  style="position:absolute;right:0px;bottom:0px;width:215px;height:auto;display:block;pointer-events:none;"
                />
              </td>
            </tr>

            <!-- DARK FOOTER -->
            <tr>
              <td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
                  <tr>
                    <td style="padding:0 10px;">
                      <a href="https://x.com/NFT__NG" style="text-decoration:none;">
                        <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" />
                      </a>
                    </td>
                    <td style="padding:0 10px;">
                      <a href="https://www.instagram.com/nft__ng" style="text-decoration:none;">
                        <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" />
                      </a>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
                  <tr>
                    <td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>

                <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">
                  &copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria
                </p>
                <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">
                  Powered by NFTNG &nbsp;&middot;&nbsp;
                  <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a>
                </p>
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">
                  This is an automated message. Please do not reply to this email.
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

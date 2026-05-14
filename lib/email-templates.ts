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
      /* ── Responsive ───────────────────────────────── */
      @media only screen and (max-width: 600px) {
        .outer-table {
          padding: 0 !important;
        }
        .card {
          width: 100% !important;
          border-radius: 0 !important;
        }
        .body-pad {
          padding: 32px 20px !important;
        }
        .two-col td {
          display: block !important;
          width: 100% !important;
          margin-bottom: 12px !important;
        }
      }
      a.cta-btn:hover {
        opacity: 0.88;
      }

      /* ── Apple Mail dark mode ─────────────────────── */
      @media (prefers-color-scheme: dark) {
        .outer-bg {
          background-color: #111111 !important;
        }
        .body-section {
          background-color: #1c1c1e !important;
        }
        .body-text {
          color: #e5e5ea !important;
        }
        .body-subtext {
          color: #aeaeb2 !important;
        }
        .body-strong {
          color: #ffffff !important;
        }
        .pill-bg {
          background-color: #2c2c2e !important;
        }
        .pill-text {
          color: #e5e5ea !important;
        }
        .pill-label {
          color: #aeaeb2 !important;
        }
        .event-card {
          background-color: #1d2d1a !important;
        }
        .event-li {
          color: #e5e5ea !important;
        }
      }

      /* ── Gmail Android dark mode ──────────────────── */
      [data-ogsc] .outer-bg {
        background-color: #111111 !important;
      }
      [data-ogsc] .body-section {
        background-color: #1c1c1e !important;
      }
      [data-ogsc] .body-text {
        color: #e5e5ea !important;
      }
      [data-ogsc] .body-subtext {
        color: #aeaeb2 !important;
      }
      [data-ogsc] .body-strong {
        color: #ffffff !important;
      }
      [data-ogsc] .pill-bg {
        background-color: #2c2c2e !important;
      }
      [data-ogsc] .pill-text {
        color: #e5e5ea !important;
      }
      [data-ogsc] .pill-label {
        color: #aeaeb2 !important;
      }
      [data-ogsc] .event-card {
        background-color: #1d2d1a !important;
      }
      [data-ogsc] .event-li {
        color: #e5e5ea !important;
      }
    </style>
  </head>

  <!--
  SF Pro Display is Apple's system font — no CDN or @font-face needed.
  It renders natively on Apple Mail (iOS + macOS) and Gmail on iOS.
  Other clients fall through to Helvetica Neue then Arial.
-->
  <body
    id="body"
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      font-family:
        &quot;SF Pro Display&quot;,
        -apple-system,
        BlinkMacSystemFont,
        &quot;Helvetica Neue&quot;,
        Arial,
        sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    "
  >
    <!-- Brevo tracking pixel buffer -->
    <table
      class="outer-bg"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f4f4f4"
    >
      <tr>
        <td height="1" style="font-size: 0; line-height: 0">&nbsp;</td>
      </tr>
    </table>

    <!-- Outer wrapper -->
    <table
      class="outer-table outer-bg"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f4f4f4; padding: 40px 16px"
    >
      <tr>
        <td align="center" valign="top">
          <!-- 600px card — border-radius:8px (Outlook Windows ignores, all others render it) -->
          <table
            class="card"
            width="600"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="max-width: 600px; width: 100%; border-radius: 8px"
          >
            <!-- ── HERO IMAGE ─────────────────────────────────────── -->
            <tr>
              <td
                style="
                  background-color: #1d1d1d;
                  padding: 0;
                  border-radius: 8px 8px 0 0;
                "
              >
                <img
                  src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png"
                  width="600"
                  height="130"
                  alt="Unchain Summer 2026, The North Star"
                  style="
                    width: 100%;
                    max-width: 600px;
                    height: auto;
                    display: block;
                    border-radius: 8px 8px 0 0;
                  "
                />
              </td>
            </tr>

            <!-- ── WHITE BODY ─────────────────────────────────────── -->
            <tr>
              <td
                class="body-pad body-section"
                style="background-color: #ffffff; padding: 40px"
              >
                <p
                  class="body-text"
                  style="
                    margin: 0 0 20px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                    line-height: 1.75;
                  "
                >
                  Hello ${data.alias}
                </p>

                <p
                  class="body-subtext"
                  style="
                    margin: 0 0 12px;
                    font-size: 15px;
                    font-weight: 400;
                    color: #444444;
                    line-height: 1.75;
                  "
                >
                  You're officially in!
                </p>

                <p
                  class="body-subtext"
                  style="
                    margin: 0 0 12px;
                    font-size: 15px;
                    font-weight: 400;
                    color: #444444;
                    line-height: 1.75;
                  "
                >
                  Welcome to Unchain Summer 2026.
                </p>

                <p
                  class="body-subtext"
                  style="
                    margin: 0 0 12px;
                    font-size: 15px;
                    font-weight: 400;
                    color: #444444;
                    line-height: 1.75;
                  "
                >
                  You've secured access to
                  <b
                    class="body-strong"
                    style="font-weight: 600; color: #1a1a1a"
                  >
                    Africa's most immersive Web3 experience.
                  </b>
                </p>

                <p
                  class="body-subtext"
                  style="
                    margin: 0 0 28px;
                    font-size: 15px;
                    font-weight: 400;
                    color: #444444;
                    line-height: 1.75;
                  "
                >
                  This email serves as your registration confirmation. Please
                  keep it safe and present it when required at check-in.
                </p>

                <!-- Event list card -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  class="event-card"
                  style="
                    background-color: #f9fff5;
                    border-left: 4px solid #6ec93e;
                    border-radius: 0 8px 8px 0;
                    margin-bottom: 28px;
                  "
                >
                  <tr>
                    <td style="padding: 20px 24px">
                      <p
                        style="
                          margin: 0 0 12px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #6ec93e;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        You're registered for
                      </p>
                      <ul style="margin: 0; padding-left: 18px">
                        ${eventList}
                      </ul>
                    </td>
                  </tr>
                </table>

                <!-- Date + Location pills -->
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 36px"
                >
                  <tr>
                    <td
                      width="48%"
                      valign="top"
                      class="pill-bg"
                      style="
                        background-color: #f4f4f4;
                        border-radius: 8px;
                        padding: 20px 24px;
                      "
                    >
                      <p
                        class="pill-label"
                        style="
                          margin: 0 0 6px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #888888;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Dates
                      </p>
                      <p
                        class="pill-text"
                        style="
                          margin: 0;
                          font-size: 15px;
                          font-weight: 600;
                          color: #1a1a1a;
                          line-height: 1.5;
                        "
                      >
                        July 26 - July 31st, 2026
                      </p>
                    </td>
                    <td width="4%"></td>
                    <td
                      width="48%"
                      valign="top"
                      class="pill-bg"
                      style="
                        background-color: #f4f4f4;
                        border-radius: 8px;
                        padding: 20px 24px;
                      "
                    >
                      <p
                        class="pill-label"
                        style="
                          margin: 0 0 6px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #888888;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Location
                      </p>
                      <p
                        class="pill-text"
                        style="
                          margin: 0;
                          font-size: 15px;
                          font-weight: 600;
                          color: #1a1a1a;
                          line-height: 1.5;
                        "
                      >
                        Lagos, Nigeria
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA button -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin: 0 auto 24px"
                >
                  <tr>
                    <td
                      style="
                        background-color: #6ec93e;
                        border-radius: 8px;
                        text-align: center;
                      "
                    >
                      <a
                        class="cta-btn"
                        href="https://unchainsummer.nftng.io"
                        style="
                          display: inline-block;
                          padding: 16px 40px;
                          font-size: 15px;
                          font-weight: 700;
                          color: #ffffff;
                          text-decoration: none;
                          letter-spacing: 0.3px;
                        "
                      >
                        Visit Unchain Summer
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Questions + axis: two-column, axis valign bottom -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                >
                  <tr>
                    <td valign="top" style="padding-right: 16px">
                      <p
                        class="body-text"
                        style="
                          margin: 0 0 8px;
                          font-size: 15px;
                          font-weight: 600;
                          color: #1a1a1a;
                        "
                      >
                        Got questions?
                      </p>
                      <p
                        class="body-subtext"
                        style="
                          margin: 0;
                          font-size: 15px;
                          color: #444444;
                          line-height: 1.75;
                        "
                      >
                        Reach us here:
                        <a
                          href="mailto:support@nftng.io"
                          style="
                            color: #6ec93e;
                            text-decoration: none;
                            font-weight: 600;
                          "
                          >support@nftng.io</a
                        >
                      </p>
                    </td>
                    <td valign="bottom" align="right" style="width: 140px">
                      <img
                        src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png"
                        width="140"
                        height="109"
                        alt=""
                        style="display: block; width: 140px; height: auto"
                      />
                    </td>
                  </tr>
                </table>

                <!-- Sign-off -->
                <p
                  class="body-subtext"
                  style="
                    margin: -60px 0 0;
                    font-size: 15px;
                    color: #444444;
                    line-height: 1.75;
                  "
                >
                  See you at Unchain Summer 2026.<br />
                  <strong style="color: #6ec93e"
                    >The Unchain Summer Team</strong
                  >
                </p>
              </td>
            </tr>

            <!-- ── DARK FOOTER ───────────────────────────────────── -->
            <tr>
              <td
                style="
                  background-color: #1d1d1d;
                  border-radius: 0 0 8px 8px;
                  padding: 32px 48px;
                  text-align: center;
                "
              >
                <!-- Social icons -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin: 0 auto 24px"
                >
                  <tr>
                    <td style="padding: 0 10px">
                      <a
                        href="https://x.com/NFT__NG"
                        style="text-decoration: none"
                      >
                        <img
                          src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png"
                          width="24"
                          height="24"
                          alt="X"
                          style="width: 24px; height: 24px; display: block"
                        />
                      </a>
                    </td>
                    <td style="padding: 0 10px">
                      <a
                        href="https://www.instagram.com/nft__ng"
                        style="text-decoration: none"
                      >
                        <img
                          src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png"
                          width="24"
                          height="24"
                          alt="Instagram"
                          style="width: 24px; height: 24px; display: block"
                        />
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 20px"
                >
                  <tr>
                    <td
                      style="
                        border-top: 1px solid rgba(255, 255, 255, 0.15);
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0 0 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.65);
                    line-height: 1.8;
                  "
                >
                  &copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026
                  &nbsp;&middot;&nbsp; Lagos, Nigeria
                </p>
                <p
                  style="
                    margin: 0 0 14px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.8;
                  "
                >
                  Powered by NFTNG &nbsp;&middot;&nbsp;
                  <a
                    href="mailto:support@nftng.io"
                    style="
                      color: rgba(255, 255, 255, 0.5);
                      text-decoration: none;
                    "
                  >
                    support@nftng.io
                  </a>
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.35);
                    line-height: 1.7;
                    font-style: italic;
                  "
                >
                  This is an automated message. Please do not reply to this
                  email.
                </p>
              </td>
            </tr>
          </table>
          <!-- /card -->
        </td>
      </tr>
    </table>
    <!-- /outer wrapper -->
  </body>
</html>`;
}

export function contactReceiptEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  x_handle?: string,
): string {
  const year = new Date().getFullYear();

  const xHandleRow = x_handle
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td class="pill-label" style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;width:80px;vertical-align:top;padding-top:2px;">X Handle</td>
                          <td class="pill-text" style="font-size:15px;font-weight:400;color:#1a1a1a;line-height:1.5;">${x_handle}</td>
                        </tr>
                      </table>`
    : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>New Contact Message - Unchain Summer</title>

    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px 0 20px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .pill-bg { background-color: #2c2c2e !important; }
        .pill-label { color: #aeaeb2 !important; }
        .pill-text { color: #e5e5ea !important; }
        .msg-card { background-color: #1d2d1a !important; }
        .msg-text { color: #e5e5ea !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .pill-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .pill-label { color: #aeaeb2 !important; }
      [data-ogsc] .pill-text { color: #e5e5ea !important; }
      [data-ogsc] .msg-card { background-color: #1d2d1a !important; }
      [data-ogsc] .msg-text { color: #e5e5ea !important; }
    </style>
  </head>

  <body id="body" style="margin:0;padding:0;background-color:#f4f4f4;font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
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
                  width="600" height="130" alt="Unchain Summer 2026, The North Star"
                  style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;"
                />
              </td>
            </tr>

            <!-- WHITE BODY -->
            <tr>
              <td class="body-pad body-section" style="background-color:#ffffff;padding:40px 40px 0 40px;">

                <p class="body-text" style="margin:0 0 8px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;">
                  New message
                </p>
                <p class="body-text" style="margin:0 0 28px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">
                  ${name} just reached out via the site.
                </p>

                <!-- Sender details -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:14px;">
                        <tr>
                          <td class="pill-label" style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;width:80px;vertical-align:top;padding-top:2px;">Name</td>
                          <td class="pill-text" style="font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.5;">${name}</td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:14px;">
                        <tr>
                          <td class="pill-label" style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;width:80px;vertical-align:top;padding-top:2px;">Email</td>
                          <td style="font-size:15px;font-weight:400;line-height:1.5;">
                            <a href="mailto:${email}" style="color:#6ec93e;text-decoration:none;font-weight:600;">${email}</a>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:${x_handle ? "14px" : "0"};">
                        <tr>
                          <td class="pill-label" style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;width:80px;vertical-align:top;padding-top:2px;">Subject</td>
                          <td class="pill-text" style="font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.5;">${subject}</td>
                        </tr>
                      </table>
                      ${xHandleRow}
                    </td>
                  </tr>
                </table>

                <!-- Message -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="msg-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Message</p>
                      <p class="msg-text" style="margin:0;font-size:15px;font-weight:400;color:#1a1a1a;line-height:1.75;">${message}</p>
                    </td>
                  </tr>
                </table>
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
                  Sent via the contact form on unchainsummer.nftng.io
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

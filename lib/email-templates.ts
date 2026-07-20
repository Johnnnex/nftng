import "server-only";
import type { RegisterFormData } from "@/data";

export function adminInviteEmail({
  firstName,
  inviteUrl,
  inviterName,
  roleName,
}: {
  firstName: string;
  inviteUrl: string;
  inviterName: string;
  roleName?: string;
}): string {
  const year = new Date().getFullYear();
  const roleRow = roleName
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;">
                        <tr>
                          <td style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1px;width:70px;vertical-align:top;padding-top:2px;">Role</td>
                          <td style="font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.5;">${roleName}</td>
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
    <title>You've been invited — NFTNG Admin</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .pill-bg { background-color: #2c2c2e !important; }
        .pill-text { color: #e5e5ea !important; }
        .pill-label { color: #aeaeb2 !important; }
        .invite-card { background-color: #1d2d1a !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .pill-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .pill-text { color: #e5e5ea !important; }
      [data-ogsc] .pill-label { color: #aeaeb2 !important; }
      [data-ogsc] .invite-card { background-color: #1d2d1a !important; }
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
            <tr>
              <td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
                <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026, The North Star" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;" />
              </td>
            </tr>
            <tr>
              <td class="body-pad body-section" style="background-color:#ffffff;padding:40px;">
                <p class="body-subtext" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Admin Invite</p>
                <p class="body-text" style="margin:0 0 24px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">Hello ${firstName}</p>
                <p class="body-subtext" style="margin:0 0 16px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  <b class="body-strong" style="font-weight:600;color:#1a1a1a;">${inviterName}</b> has invited you to join the NFTNG admin dashboard as a team member.
                </p>
                <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
                  You'll have access to the modules assigned to your account. Click below to set your password and activate your account.
                  This invite expires in <b class="body-strong" style="font-weight:600;color:#1a1a1a;">8 hours</b>.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="invite-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:32px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Your invite details</p>
                      ${roleRow}
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1px;width:70px;vertical-align:top;padding-top:2px;">Expires</td>
                          <td style="font-size:15px;font-weight:400;color:#1a1a1a;line-height:1.5;">8 hours from receipt</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px;">
                  <tr>
                    <td style="background-color:#6ec93e;border-radius:8px;text-align:center;">
                      <a href="${inviteUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                        Accept Invite &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 32px;font-size:12px;color:#9CA3AF;line-height:1.6;text-align:center;">
                  Or copy this link into your browser:<br />
                  <span style="color:#6ec93e;word-break:break-all;">${inviteUrl}</span>
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td valign="top" style="padding-right:16px;">
                      <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Got questions?</p>
                      <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">
                        Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a>
                      </p>
                    </td>
                    <td valign="bottom" align="right" style="width:140px;">
                      <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto;" />
                    </td>
                  </tr>
                </table>
                <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75;">
                  See you on the inside.<br />
                  <strong style="color:#6ec93e;">The NFTNG Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
                  <tr>
                    <td style="padding:0 10px;">
                      <a href="https://x.com/NFT__NG" style="text-decoration:none;">
                        <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" />
                      </a>
                    </td>
                    <td style="padding:0 10px;">
                      <a href="https://www.instagram.com/nft__ng" style="text-decoration:none;">
                        <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" />
                      </a>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
                  <tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>
                <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">
                  &copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria
                </p>
                <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">
                  Powered by NFTNG &nbsp;&middot;&nbsp;
                  <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a>
                </p>
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">
                  This invite was sent because an admin with dashboard access added you to the team.
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

const EVENT_LABELS: Record<string, string> = {
  soccer_tournament: "Football Tournament, 2 August 2026",
  unchain_summer_conference: "Unchain Summer Conference, 5 August 2026",
  boxing_night: "Boxing Night, 6 August 2026",
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
                        August 2 - August 6th, 2026
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

// ─── Trip dispatch — customer email ──────────────────────────────────────────
// HTML reference: /html/trip-dispatch-customer.html

export function tripDispatchCustomerHtml({
  orderRef,
  userName,
  items,
  confirmUrl,
}: {
  orderRef: string;
  userName: string;
  items: { productTitle: string; variantCombo: Record<string, string>; quantity: number }[];
  confirmUrl: string;
}): string {
  const year = new Date().getFullYear();
  const itemRows = items
    .map((i) => {
      const variantText = Object.entries(i.variantCombo).map(([k, v]) => `${k}: ${v}`).join(", ");
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;">
        <tr>
          <td style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.5;padding-right:8px;">
            ${i.productTitle}${variantText ? `<br/><span style="font-size:12px;font-weight:400;color:#888888;">${variantText}</span>` : ""}
          </td>
          <td style="font-size:14px;color:#888888;text-align:right;white-space:nowrap;">×${i.quantity}</td>
        </tr>
      </table>`;
    })
    .join(`<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;line-height:0;">&nbsp;</td></tr></table>`);

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Your order is on its way — NFTNG</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .info-card { background-color: #1d2d1a !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .info-card { background-color: #1d2d1a !important; }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px;">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px;">
          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;" />
          </td></tr>
          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px;">
            <p class="body-subtext" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Order Dispatch</p>
            <p class="body-text" style="margin:0 0 24px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">Your order is on its way, ${userName}!</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
              Some items on your order
              <b class="body-strong" style="font-weight:600;color:#1a1a1a;">${orderRef}</b>
              have been dispatched. A rider is headed to your address. When they arrive, ask them for the
              <b class="body-strong" style="font-weight:600;color:#1a1a1a;">trip code</b> and click below to confirm delivery.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="info-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:32px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Items in this delivery</p>
                ${itemRows}
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px;">
              <tr><td style="background-color:#6ec93e;border-radius:8px;text-align:center;">
                <a href="${confirmUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Confirm Delivery &rarr;</a>
              </td></tr>
            </table>
            <p style="margin:0 0 32px;font-size:12px;color:#9CA3AF;line-height:1.6;text-align:center;">
              Or copy this link into your browser:<br />
              <span style="color:#6ec93e;word-break:break-all;">${confirmUrl}</span>
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Got questions?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px;">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto;" />
                </td>
              </tr>
            </table>
            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75;">
              Thanks for your order.<br />
              <strong style="color:#6ec93e;">The NFTNG Team</strong>
            </p>
          </td></tr>
          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
              <tr>
                <td style="padding:0 10px;"><a href="https://x.com/NFT__NG" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" /></a></td>
                <td style="padding:0 10px;"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">You received this email because you placed an order on unchainsummer.nftng.io.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// ─── Trip dispatch — rider email ──────────────────────────────────────────────
// HTML reference: /html/trip-dispatch-rider.html

export function tripDispatchRiderHtml({
  tripCode,
  riderName,
  items,
}: {
  tripCode: string;
  riderName: string;
  items: { productTitle: string; variantCombo: Record<string, string>; quantity: number; orderRef: string; userName: string; userAddress: string }[];
}): string {
  const year = new Date().getFullYear();
  const manifestRows = items
    .map(
      (i) =>
        `<tr class="manifest-row"><td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.productTitle}</td><td style="padding:10px 12px;font-size:13px;font-family:'Courier New',monospace;color:#374151;border-bottom:1px solid #f3f4f6;">${i.orderRef}</td><td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.userName}</td><td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.userAddress}</td></tr>`,
    )
    .join("");
  const plural = items.length !== 1 ? "s" : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Trip Manifest — NFTNG Logistics</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
        .manifest-table th, .manifest-table td { font-size: 11px !important; padding: 6px 4px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .code-card { background-color: #1a2a15 !important; }
        .code-text { color: #ffffff !important; }
        .manifest-header { background-color: #2c2c2e !important; }
        .manifest-header th { color: #aeaeb2 !important; }
        .manifest-row td { color: #e5e5ea !important; border-color: #3a3a3c !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px;">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px;">
          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;" />
          </td></tr>
          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px;">
            <p class="body-subtext" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Logistics Dispatch</p>
            <p class="body-text" style="margin:0 0 24px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">Hello ${riderName}, your trip is dispatched!</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75;">
              You have been assigned a delivery trip with
              <b class="body-strong" style="font-weight:600;color:#1a1a1a;">${items.length} item${plural}</b>.
              Share the trip code below with each customer when you hand over their order.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="code-card" style="background-color:#f9fff5;border:2px dashed #6ec93e;border-radius:8px;margin-bottom:32px;">
              <tr><td style="padding:28px 24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:2px;">Your Trip Code</p>
                <p class="code-text" style="margin:0;font-size:40px;font-weight:800;letter-spacing:0.2em;color:#1a1a1a;font-family:'Courier New',Courier,monospace;line-height:1.2;">${tripCode}</p>
                <p style="margin:10px 0 0;font-size:13px;color:#888888;line-height:1.6;">Read this code to each customer when you deliver their order.</p>
              </td></tr>
            </table>
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px;">Delivery Manifest (${items.length} item${plural})</p>
            <table class="manifest-table" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:32px;">
              <thead>
                <tr class="manifest-header" style="background-color:#f3f4f6;">
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Order</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Customer</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Address</th>
                </tr>
              </thead>
              <tbody>${manifestRows}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Need support?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px;">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto;" />
                </td>
              </tr>
            </table>
            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75;">
              Safe delivery!<br />
              <strong style="color:#6ec93e;">NFTNG Logistics</strong>
            </p>
          </td></tr>
          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
              <tr>
                <td style="padding:0 10px;"><a href="https://x.com/NFT__NG" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" /></a></td>
                <td style="padding:0 10px;"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">This email was sent to you as an assigned logistics rider for NFTNG.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// ─── Order Confirmation ───────────────────────────────────────────────────────
// HTML reference: /html/order-confirmation.html

type OrderEmailItem = {
  title: string;
  image: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  unitPrice: number;
};

export function orderConfirmEmail({
  customerName,
  orderRef,
  items,
  subtotal,
  deliveryFee,
  discountAmount,
  totalAmount,
  deliveryAddress,
  storeUrl,
}: {
  customerName: string;
  orderRef: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  deliveryAddress: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const trackUrl = `${storeUrl}/track-order`;

  const itemRows = items.map((item) => {
    const comboLabel = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
    const lineTotal = (item.unitPrice * item.quantity).toLocaleString("en-NG");
    const imgCell = item.image
      ? `<img src="${item.image}" width="64" height="64" alt="${item.title}" class="item-img" style="width:64px;height:64px;border-radius:6px;object-fit:cover;display:block;" />`
      : `<div style="width:64px;height:64px;border-radius:6px;background-color:#f0f0f0;">&nbsp;</div>`;
    return `<table class="item-row-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;background-color:#fafafa;border-radius:8px;"><tr><td style="padding:14px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td width="64" valign="top" style="padding-right:14px;">${imgCell}</td><td valign="top"><p class="body-strong" style="margin:0 0 3px;font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.4;">${item.title}</p>${comboLabel ? `<p class="body-subtext" style="margin:0 0 3px;font-size:12px;color:#888;">${comboLabel}</p>` : ""}<p class="body-subtext" style="margin:0;font-size:12px;color:#888;">Qty: ${item.quantity}</p></td><td valign="top" style="text-align:right;white-space:nowrap;"><p class="body-strong" style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">₦${lineTotal}</p></td></tr></table></td></tr></table>`;
  }).join("\n");

  const deliveryRow = deliveryFee > 0
    ? `<tr><td height="8"></td></tr><tr><td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Delivery Fee</p><p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">₦${deliveryFee.toLocaleString("en-NG")}</p></td>${discountAmount > 0 ? `<td width="4%"></td><td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Discount</p><p style="margin:0;font-size:15px;font-weight:600;color:#dc2626;">−₦${discountAmount.toLocaleString("en-NG")}</p></td>` : "<td></td>"}</tr>`
    : "";

  const addressSection = deliveryAddress
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr><td class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Delivery Address</p><p class="pill-text" style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">${deliveryAddress}</p></td></tr></table>`
    : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Order Confirmed — NFTNG Store</title>

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
        .item-img {
          width: 56px !important;
          height: 56px !important;
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
        .order-card {
          background-color: #1d2d1a !important;
        }
        .item-row-bg {
          background-color: #2c2c2e !important;
        }
        .divider {
          background-color: #3a3a3c !important;
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
      [data-ogsc] .order-card {
        background-color: #1d2d1a !important;
      }
      [data-ogsc] .item-row-bg {
        background-color: #2c2c2e !important;
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
          <!-- 600px card -->
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
                    margin: 0 0 6px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                    line-height: 1.75;
                  "
                >
                  Hey ${customerName} 👋
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
                  Your order is confirmed and we're getting your items ready.
                  Here's your summary.
                </p>

                <!-- Order ID card -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  class="order-card"
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
                          margin: 0 0 4px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #6ec93e;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Your Order ID
                      </p>
                      <p
                        class="body-strong"
                        style="
                          margin: 0;
                          font-size: 22px;
                          font-weight: 800;
                          color: #1a1a1a;
                          letter-spacing: -0.5px;
                        "
                      >
                        ${orderRef}
                      </p>
                      <p
                        class="body-subtext"
                        style="
                          margin: 6px 0 0;
                          font-size: 13px;
                          color: #888888;
                        "
                      >
                        Save this — you'll need it to track your order.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Preorder Notice -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  class="order-card"
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
                          margin: 0 0 4px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #6ec93e;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Preorder Notice
                      </p>
                      <p
                        class="body-subtext"
                        style="
                          margin: 0;
                          font-size: 14px;
                          color: #444444;
                          line-height: 1.75;
                        "
                      >
                        This is a preorder &mdash; deliveries are scheduled to
                        begin on
                        <strong
                          class="body-strong"
                          style="color: #1a1a1a; font-weight: 700"
                          >July 1st, 2026</strong
                        >. We&rsquo;ll notify you as soon as your order ships.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Items section header -->
                <p
                  style="
                    margin: 0 0 12px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #888888;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                  "
                >
                  Items Ordered
                </p>

                ${itemRows}

                <!-- Divider -->
                <table
                  class="divider"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin: 20px 0"
                >
                  <tr>
                    <td
                      height="1"
                      style="
                        background-color: #f0f0f0;
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <!-- Summary pills -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 28px"
                >
                  <tr>
                    <td
                      width="48%"
                      valign="top"
                      class="pill-bg"
                      style="
                        background-color: #f4f4f4;
                        border-radius: 8px;
                        padding: 16px 20px;
                      "
                    >
                      <p
                        class="pill-label"
                        style="
                          margin: 0 0 4px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #888888;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Subtotal
                      </p>
                      <p
                        class="pill-text"
                        style="
                          margin: 0;
                          font-size: 15px;
                          font-weight: 600;
                          color: #1a1a1a;
                        "
                      >
                        ₦${subtotal.toLocaleString("en-NG")}
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
                        padding: 16px 20px;
                      "
                    >
                      <p
                        class="pill-label"
                        style="
                          margin: 0 0 4px;
                          font-size: 11px;
                          font-weight: 700;
                          color: #888888;
                          text-transform: uppercase;
                          letter-spacing: 1.5px;
                        "
                      >
                        Total Paid
                      </p>
                      <p
                        class="pill-text"
                        style="
                          margin: 0;
                          font-size: 15px;
                          font-weight: 600;
                          color: #1a1a1a;
                        "
                      >
                        ₦${totalAmount.toLocaleString("en-NG")}
                      </p>
                    </td>
                  </tr>
                  ${deliveryRow}
                </table>

                ${addressSection}

                <!-- CTA -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin: 0 auto 32px"
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
                        href="${trackUrl}"
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
                        Track Your Order
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
                        Reach us at
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
                  Thanks for your order.<br />
                  <strong style="color: #6ec93e">The NFTNG Team</strong>
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
                  You received this email because you placed an order on unchainsummer.nftng.io.
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

// HTML reference: /html/delivery-complete.html
export function deliveryCompleteEmail({
  customerName,
  orderRef,
  items,
  collectionsUrl,
  storeUrl,
}: {
  customerName: string;
  orderRef: string;
  items: { productTitle: string; productImage: string | null; variantCombo: Record<string, string>; quantity: number; unitPrice: number; productId: string | null }[];
  collectionsUrl: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();

  const itemRows = items.map((item) => {
    const combo = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
    const imgCell = item.productImage
      ? `<img class="item-img" src="${item.productImage}" width="56" height="56" alt="${item.productTitle}" style="width:56px;height:56px;border-radius:6px;object-fit:cover;display:block;" />`
      : `<div style="width:56px;height:56px;border-radius:6px;background-color:#f0f0f0;">&nbsp;</div>`;
    const rateLink = item.productId
      ? `<a href="${storeUrl}/collections/${item.productId}" style="font-size:12px;color:#6ec93e;text-decoration:none;font-weight:600;">Rate this item →</a>`
      : "";
    return `<table class="item-row-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;background-color:#fafafa;border-radius:8px;"><tr><td style="padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td width="56" valign="top" style="padding-right:12px;">${imgCell}</td><td valign="top"><p class="body-strong" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1a1a1a;">${item.productTitle}</p>${combo ? `<p class="body-subtext" style="margin:0 0 2px;font-size:12px;color:#888;">${combo}</p>` : ""}<p class="body-subtext" style="margin:0 0 4px;font-size:12px;color:#888;">Qty: ${item.quantity}</p>${rateLink}</td><td valign="top" style="text-align:right;white-space:nowrap;"><p class="body-strong" style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">₦${(item.unitPrice * item.quantity).toLocaleString("en-NG")}</p></td></tr></table></td></tr></table>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Your Order Has Been Delivered! — NFTNG Store</title>

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
        .item-img {
          width: 48px !important;
          height: 48px !important;
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
        .item-row-bg {
          background-color: #2c2c2e !important;
        }
        .divider {
          background-color: #3a3a3c !important;
        }
        .rate-card {
          background-color: #1d2d1a !important;
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
      [data-ogsc] .item-row-bg {
        background-color: #2c2c2e !important;
      }
      [data-ogsc] .rate-card {
        background-color: #1d2d1a !important;
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
          <!-- 600px card -->
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
                    margin: 0 0 6px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                    line-height: 1.75;
                  "
                >
                  Hey ${customerName} 🎉
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
                  Great news — your order
                  <strong class="body-strong" style="color: #1a1a1a">${orderRef}</strong>
                  has been delivered! Here's what you received.
                </p>

                ${itemRows}

                <!-- Divider -->
                <table
                  class="divider"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin: 24px 0"
                >
                  <tr>
                    <td
                      height="1"
                      style="
                        background-color: #ebebeb;
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <!-- Rate card -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  class="rate-card"
                  style="
                    margin-bottom: 28px;
                    background-color: #f9fff5;
                    border-left: 4px solid #6ec93e;
                    border-radius: 0 8px 8px 0;
                  "
                >
                  <tr>
                    <td style="padding: 20px 24px">
                      <p
                        class="body-strong"
                        style="
                          margin: 0 0 6px;
                          font-size: 15px;
                          font-weight: 700;
                          color: #1a1a1a;
                        "
                      >
                        Enjoyed your order?
                      </p>
                      <p
                        class="body-subtext"
                        style="
                          margin: 0 0 16px;
                          font-size: 14px;
                          color: #444444;
                          line-height: 1.6;
                        "
                      >
                        Your feedback helps other shoppers. Tap the button below
                        to browse our store and leave a review on any of your
                        items.
                      </p>
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                      >
                        <tr>
                          <td
                            style="
                              background-color: #6ec93e;
                              border-radius: 50px;
                              text-align: center;
                            "
                          >
                            <a
                              class="cta-btn"
                              href="${collectionsUrl}"
                              style="
                                display: inline-block;
                                padding: 12px 28px;
                                font-size: 14px;
                                font-weight: 700;
                                color: #ffffff;
                                text-decoration: none;
                              "
                            >
                              Rate Your Items
                            </a>
                          </td>
                        </tr>
                      </table>
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
                        Reach us at
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
                  Thanks for your order.<br />
                  <strong style="color: #6ec93e">The NFTNG Team</strong>
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
                  You received this email because a delivery was confirmed for your order on unchainsummer.nftng.io.
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

// html/outside-order-preview.html
export function outsideOrderEmail({
  customerName,
  previewToken,
  items,
  countryName,
  storeUrl,
}: {
  customerName: string;
  previewToken: string;
  items: { productTitle: string; variantCombo: Record<string, string>; qty: number; unitPrice: number }[];
  countryName: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const previewUrl = `${storeUrl}/preview-order/${previewToken}`;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const itemRows = items.map((item) => {
    const combo = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
    return `<table class="item-row-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;background-color:#fafafa;border-radius:8px;"><tr><td style="padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td valign="top"><p class="body-strong" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1a1a1a;">${item.productTitle}</p>${combo ? `<p class="body-subtext" style="margin:0;font-size:12px;color:#888;">${combo} &middot; Qty ${item.qty}</p>` : `<p class="body-subtext" style="margin:0;font-size:12px;color:#888;">Qty ${item.qty}</p>`}</td><td valign="top" style="text-align:right;white-space:nowrap;"><p class="body-strong" style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">&#8358;${(item.unitPrice * item.qty).toLocaleString("en-NG")}</p></td></tr></table></td></tr></table>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>International Order Received — NFTNG Store</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .item-row-bg { background-color: #2c2c2e !important; }
        .divider { background-color: #3a3a3c !important; }
        .info-card { background-color: #1d2d1a !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .item-row-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .info-card { background-color: #1d2d1a !important; }
    </style>
  </head>
  <body id="body" style="margin:0;padding:0;background-color:#f4f4f4;font-family:&quot;SF Pro Display&quot;,-apple-system,BlinkMacSystemFont,&quot;Helvetica Neue&quot;,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px;">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px;">
          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026, The North Star" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;" />
          </td></tr>
          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px;">
            <p class="body-text" style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">Hey ${customerName} &#x1F44B;</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.75;">We&apos;ve received your international order to <strong class="body-strong" style="color:#1a1a1a;">${countryName}</strong>. Our team will reach out with delivery pricing, timeline, and next steps.</p>

            ${itemRows}

            <table class="divider" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;"><tr><td height="1" style="background-color:#ebebeb;font-size:0;line-height:0;">&nbsp;</td></tr></table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td class="item-row-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;">
                  <p class="body-subtext" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;">Subtotal</p>
                  <p class="body-strong" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">&#8358;${subtotal.toLocaleString("en-NG")} <span class="body-subtext" style="font-size:12px;font-weight:400;color:#888888;">(excl. international delivery)</span></p>
                </td>
              </tr>
            </table>

            <table class="info-card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;">
              <tr><td style="padding:20px 24px;">
                <p class="body-strong" style="margin:0 0 6px;font-size:15px;font-weight:700;color:#1a1a1a;">View your order summary</p>
                <p class="body-subtext" style="margin:0 0 16px;font-size:14px;color:#444444;line-height:1.6;">Keep this link bookmarked &mdash; it&apos;s your reference for your order. We&apos;ll reach out on the email you provided.</p>
                <table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="background-color:#6ec93e;border-radius:50px;text-align:center;">
                  <a class="cta-btn" href="${previewUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">View Your Order</a>
                </td></tr></table>
              </td></tr>
            </table>

            <p class="body-subtext" style="margin:0 0 28px;font-size:12px;color:#888888;">Or copy this link: <a href="${previewUrl}" style="color:#6ec93e;word-break:break-all;">${previewUrl}</a></p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Got questions?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px;">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto;" />
                </td>
              </tr>
            </table>

            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75;">Thanks for your order.<br /><strong style="color:#6ec93e;">The NFTNG Team</strong></p>
          </td></tr>

          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
              <tr>
                <td style="padding:0 10px;"><a href="https://x.com/NFT__NG" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" /></a></td>
                <td style="padding:0 10px;"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">You placed an international order on unchainsummer.nftng.io.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// html/international-order-resolved.html
export function internationalOrderResolvedEmail({
  customerName,
  previewToken,
  items,
  storeUrl,
}: {
  customerName: string;
  previewToken: string;
  items: { productTitle: string; productImage: string | null; variantCombo: Record<string, string>; qty: number; unitPrice: number; productId: string | null }[];
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const previewUrl = `${storeUrl}/preview-order/${previewToken}`;
  const collectionsUrl = `${storeUrl}/collections`;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const itemRows = items.map((item) => {
    const combo = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
    const imgCell = item.productImage
      ? `<img class="item-img" src="${item.productImage}" width="56" height="56" alt="${item.productTitle}" style="width:56px;height:56px;border-radius:6px;object-fit:cover;display:block;" />`
      : `<div style="width:56px;height:56px;border-radius:6px;background-color:#f0f0f0;">&nbsp;</div>`;
    return `<table class="item-row-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;background-color:#fafafa;border-radius:8px;"><tr><td style="padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td width="56" valign="top" style="padding-right:12px;">${imgCell}</td><td valign="top"><p class="body-strong" style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1a1a1a;">${item.productTitle}</p>${combo ? `<p class="body-subtext" style="margin:0 0 2px;font-size:12px;color:#888;">${combo}</p>` : ""}<p class="body-subtext" style="margin:0;font-size:12px;color:#888;">Qty: ${item.qty}</p></td><td valign="top" style="text-align:right;white-space:nowrap;"><p class="body-strong" style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">&#8358;${(item.unitPrice * item.qty).toLocaleString("en-NG")}</p></td></tr></table></td></tr></table>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Your International Order Has Been Arranged! — NFTNG Store</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
        .item-img { width: 48px !important; height: 48px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .item-row-bg { background-color: #2c2c2e !important; }
        .divider { background-color: #3a3a3c !important; }
        .rate-card { background-color: #1d2d1a !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .item-row-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .rate-card { background-color: #1d2d1a !important; }
    </style>
  </head>
  <body id="body" style="margin:0;padding:0;background-color:#f4f4f4;font-family:&quot;SF Pro Display&quot;,-apple-system,BlinkMacSystemFont,&quot;Helvetica Neue&quot;,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px;">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px;">
          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0;">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026, The North Star" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0;" />
          </td></tr>
          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px;">
            <p class="body-text" style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75;">Hey ${customerName} &#x1F30D;</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.75;">Great news &mdash; your international order has been arranged! Our team has confirmed your items and is coordinating delivery to you. Here&apos;s what&apos;s on its way.</p>

            ${itemRows}

            <table class="divider" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;"><tr><td height="1" style="background-color:#ebebeb;font-size:0;line-height:0;">&nbsp;</td></tr></table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
              <tr>
                <td class="item-row-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;">
                  <p class="body-subtext" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px;">Subtotal</p>
                  <p class="body-strong" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">&#8358;${subtotal.toLocaleString("en-NG")} <span class="body-subtext" style="font-size:12px;font-weight:400;color:#888888;">(excl. international delivery)</span></p>
                </td>
              </tr>
            </table>

            <table class="rate-card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;">
              <tr><td style="padding:20px 24px;">
                <p class="body-strong" style="margin:0 0 6px;font-size:15px;font-weight:700;color:#1a1a1a;">Order arranged &#x2714;&#xFE0F;</p>
                <p class="body-subtext" style="margin:0 0 16px;font-size:14px;color:#444444;line-height:1.6;">Our team will be in touch with shipping details and a tracking reference. In the meantime, feel free to browse more from our store.</p>
                <table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="background-color:#6ec93e;border-radius:50px;text-align:center;">
                  <a class="cta-btn" href="${collectionsUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Browse Collections</a>
                </td></tr></table>
              </td></tr>
            </table>

            <p class="body-subtext" style="margin:0 0 28px;font-size:12px;color:#888888;">View your order summary: <a href="${previewUrl}" style="color:#6ec93e;word-break:break-all;">${previewUrl}</a></p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">Got questions?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75;">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600;">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px;">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto;" />
                </td>
              </tr>
            </table>

            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75;">Thanks for your order.<br /><strong style="color:#6ec93e;">The NFTNG Team</strong></p>
          </td></tr>

          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center;">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px;">
              <tr>
                <td style="padding:0 10px;"><a href="https://x.com/NFT__NG" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block;" /></a></td>
                <td style="padding:0 10px;"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none;"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block;" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8;">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8;">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none;">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic;">You placed an international order on unchainsummer.nftng.io.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}


export function preorderNoticeEmail({
  customerName,
  orderRef,
  storeUrl,
}: {
  customerName: string;
  orderRef: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const trackUrl = `${storeUrl}/track-order`;

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Delivery Update — NFTNG Store</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .order-card { background-color: #1d2d1a !important; }
        .notice-card { background-color: #1d2d1a !important; }
        .divider { background-color: #3a3a3c !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .order-card { background-color: #1d2d1a !important; }
      [data-ogsc] .notice-card { background-color: #1d2d1a !important; }
    </style>
  </head>
  <body id="body" style="margin:0;padding:0;background-color:#f4f4f4;font-family:&quot;SF Pro Display&quot;,-apple-system,BlinkMacSystemFont,&quot;Helvetica Neue&quot;,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px">

          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026, The North Star" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0" />
          </td></tr>

          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px">
            <p class="body-text" style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75">Hey ${customerName} 👋</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75">We have an update on your Unchain Summer 2026 merch order. Read on for the details.</p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="order-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px">Your Order ID</p>
                <p class="body-strong" style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">${orderRef}</p>
                <p class="body-subtext" style="margin:6px 0 0;font-size:13px;color:#888888">Save this &mdash; you&rsquo;ll need it to track your order.</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="notice-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px">Delivery Update</p>
                <p class="body-strong" style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1a1a1a">Deliveries start July 1st, 2026</p>
                <p class="body-subtext" style="margin:0;font-size:14px;color:#444444;line-height:1.75">Your order is a preorder &mdash; all Unchain Summer 2026 merch is scheduled to begin shipping on <strong class="body-strong" style="color:#1a1a1a;font-weight:700">July 1st, 2026</strong>. We&rsquo;ll send you a shipping notification the moment your order is on its way. Thanks for your patience!</p>
              </td></tr>
            </table>

            <table class="divider" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px"><tr><td height="1" style="background-color:#f0f0f0;font-size:0;line-height:0;">&nbsp;</td></tr></table>

            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 32px">
              <tr><td style="background-color:#6ec93e;border-radius:8px;text-align:center">
                <a class="cta-btn" href="${trackUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px">Track Your Order</a>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a">Got questions?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto" />
                </td>
              </tr>
            </table>

            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75">Thanks for your order.<br /><strong style="color:#6ec93e">The NFTNG Team</strong></p>
          </td></tr>

          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px">
              <tr>
                <td style="padding:0 10px"><a href="https://x.com/NFT__NG" style="text-decoration:none"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block" /></a></td>
                <td style="padding:0 10px"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic">You received this email because you placed an order on unchainsummer.nftng.io.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

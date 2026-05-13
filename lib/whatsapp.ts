import "server-only";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const FROM = process.env.TWILIO_WHATSAPP_FROM!; // e.g. "+14155238886"

export const REGISTRATION_WA_MESSAGE = `You're officially in 🎉

Welcome to Unchain Summer 2026.

You just secured your spot on the list for Africa's most immersive Web3 experience.`;

export async function sendWhatsAppMessage(to: string, body: string) {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM) {
    console.warn("[whatsapp] Twilio env vars not set — skipping WhatsApp message");
    return;
  }

  // Ensure E.164 format — strip spaces, add + if missing
  const cleaned = to.replace(/\s+/g, "");
  const toE164 = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: `whatsapp:${FROM}`,
      To: `whatsapp:${toE164}`,
      Body: body,
    }).toString(),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(`Twilio WhatsApp error: ${json?.message ?? res.statusText}`);
  }
}

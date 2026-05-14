import "server-only";

const BREVO_API = "https://api.brevo.com/v3";
const API_KEY = process.env.BREVO_API_KEY!;
const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL!,
  name: process.env.BREVO_SENDER_NAME!,
};

type SendEmailParams = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
};

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ sender: SENDER, to, subject, htmlContent }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${body?.message ?? res.statusText}`);
  }
}

export async function addContactToList(
  email: string,
  listId: number,
  attributes?: Record<string, string>,
) {
  const res = await fetch(`${BREVO_API}/contacts`, {
    method: "POST",
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // "Contact already in list" is not an error we want to surface
    if (body?.code === "duplicate_parameter") return;
    throw new Error(`Brevo error: ${body?.message ?? res.statusText}`);
  }
}

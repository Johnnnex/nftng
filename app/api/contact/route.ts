import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/brevo";
import { contactReceiptEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { name, email, subject, x_handle, message } = parsed.data;
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL!;

  await sendEmail({
    to: [{ email: recipient }],
    subject: `[Contact] ${subject}`,
    htmlContent: contactReceiptEmail(name, email, subject, message, x_handle ?? undefined),
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/data";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { registrationConfirmationEmail } from "@/lib/email-templates";
import { sendWhatsAppMessage, REGISTRATION_WA_MESSAGE } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const { data: existing } = await supabase
    .from("registration")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered." },
      { status: 400 },
    );
  }

  const { error: dbError } = await supabase.from("registration").insert([data]);
  if (dbError) {
    console.error("[register] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "Failed to save registration." },
      { status: 500 },
    );
  }

  // Confirmation email — don't fail request if this errors
  try {
    await sendEmail({
      to: [{ email: data.email, name: data.alias }],
      subject: "Welcome to Unchain Summer",
      htmlContent: registrationConfirmationEmail(data),
    });
  } catch (err) {
    console.error("[register] Email error:", err);
  }

  // WhatsApp — disabled until Twilio WhatsApp Business approval is live.
  // To enable: set ENABLE_WHATSAPP=true in .env
  if (process.env.ENABLE_WHATSAPP === "true" && data.phone) {
    try {
      await sendWhatsAppMessage(data.phone, REGISTRATION_WA_MESSAGE);
    } catch (err) {
      console.error("[register] WhatsApp error:", err);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

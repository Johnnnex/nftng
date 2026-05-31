import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/data";
import { addContactToList } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const listId = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID ?? "1", 10);
  await addContactToList(parsed.data.email, listId);

  return NextResponse.json({ success: true });
}

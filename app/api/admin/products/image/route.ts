import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  if (!accountId || !apiToken)
    return NextResponse.json({ error: "Cloudflare Images not configured" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob))
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const upload = new FormData();
  upload.append("file", file);

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    { method: "POST", headers: { Authorization: `Bearer ${apiToken}` }, body: upload },
  );

  const cfData = await cfRes.json();
  if (!cfData.success)
    return NextResponse.json({ error: cfData.errors?.[0]?.message ?? "Upload failed" }, { status: 500 });

  const url: string = cfData.result.variants[0];
  return NextResponse.json({ data: { url } }, { status: 201 });
}

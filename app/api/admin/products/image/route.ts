import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const FOLDER = "product-images";

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
  if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL)
    return NextResponse.json({ error: "R2 storage not configured" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob))
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });

  const mimeType = file.type || "image/jpeg";
  if (!mimeType.startsWith("image/"))
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return NextResponse.json({ data: { url } }, { status: 201 });
}

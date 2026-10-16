import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.webp`;
    const targetPath = join(uploadDir, filename);

    // Compress to WebP
    const optimized = await sharp(buffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    await writeFile(targetPath, optimized);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process and upload image." }, { status: 500 });
  }
}

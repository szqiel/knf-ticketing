import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

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
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.webp`;

    // Compress to WebP
    const optimized = await sharp(buffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

    // Use Supabase Storage if configured (standard in Vercel / Production)
    if (supabaseUrl && supabaseKey) {
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "knf-media";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(`posters/${filename}`, optimized, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        return NextResponse.json(
          { error: `Storage upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(`posters/${filename}`);

      return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
    }

    // Fallback: Local filesystem (for local development)
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const targetPath = join(uploadDir, filename);
    await writeFile(targetPath, optimized);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process and upload image." }, { status: 500 });
  }
}

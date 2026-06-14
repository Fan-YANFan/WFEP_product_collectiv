import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB each

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const phone = (formData.get("phone") as string | null)?.trim();
    const locale = (formData.get("locale") as string | null) ?? "en";

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const photos: File[] = [];
    for (let i = 0; i < MAX_PHOTOS; i++) {
      const file = formData.get(`photo${i}`);
      if (file instanceof File && file.size > 0) photos.push(file);
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: "At least one photo is required." }, { status: 400 });
    }

    for (const file of photos) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are accepted." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Each photo must be under 8 MB." }, { status: 400 });
      }
    }

    const quoteId = `PQ-${Date.now().toString(36).toUpperCase()}`;
    const uploadDir = path.join(process.cwd(), "data", "photo-quotes", quoteId);
    await mkdir(uploadDir, { recursive: true });

    const savedNames: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `photo-${i + 1}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      savedNames.push(filename);
    }

    const manifest = {
      quoteId,
      phone,
      locale,
      photoCount: photos.length,
      photos: savedNames,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      note: "Routed to customer service / AI estimate queue for manual review.",
    };
    await writeFile(path.join(uploadDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    return NextResponse.json({
      ok: true,
      quoteId,
      message:
        locale === "zh"
          ? "已收到您的相片！我們的團隊將盡快透過 WhatsApp / 電話與您聯絡並提供報價。"
          : "Photos received! Our team will contact you shortly via WhatsApp / phone with a quote.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

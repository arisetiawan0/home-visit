import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

// POST /api/upload — Upload a photo to Cloudinary
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { error: "File wajib diupload" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const secureUrl = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({
      url: secureUrl,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("Cloudinary upload API error:", err);
    return NextResponse.json(
      { error: `Upload gagal: ${err.message || "Terjadi kesalahan server"}` },
      { status: 500 }
    );
  }
}

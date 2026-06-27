import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// PATCH /api/auth/profile — Update SPV profile (avatar_url)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { code, avatar_url } = body;

    if (!code || typeof avatar_url !== "string") {
      return NextResponse.json(
        { error: "Kode SPV dan URL foto wajib diisi" },
        { status: 400 }
      );
    }

    await query(
      "UPDATE quick_login_codes SET avatar_url = ? WHERE code = ? AND role = 'spv' AND is_active = 1",
      [avatar_url, code]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update API Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spvCode: string }> }
) {
  try {
    const { spvCode } = await params;

    const area = await query(
      "SELECT * FROM areas WHERE spv_code = ? LIMIT 1",
      [spvCode.toUpperCase()]
    );

    if (!area || area.length === 0) {
      return NextResponse.json(
        { error: "Area tidak ditemukan untuk SPV ini" },
        { status: 404 }
      );
    }

    return NextResponse.json({ area: area[0] });
  } catch (err) {
    console.error("Error getting area by SPV code:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

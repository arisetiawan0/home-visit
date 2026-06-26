import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role, code } = await request.json();

    if (!role || !code) {
      return NextResponse.json(
        { error: "Role dan kode wajib diisi" },
        { status: 400 }
      );
    }

    if (role === "spv") {
      // Validate SPV code
      const rows = await query(
        "SELECT * FROM quick_login_codes WHERE code = ? AND role = 'spv' AND is_active = 1 LIMIT 1",
        [code.toUpperCase()]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "Kode SPV tidak valid" },
          { status: 401 }
        );
      }

      const data = rows[0];

      return NextResponse.json({
        user: {
          role: "spv",
          code: data.code,
          label: data.label,
        },
      });
    } else if (role === "outlet") {
      // Validate outlet code
      const formatted = String(parseInt(code, 10)).padStart(2, "0");

      const rows = await query(
        "SELECT * FROM quick_login_codes WHERE code = ? AND role = 'outlet' AND is_active = 1 LIMIT 1",
        [formatted]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "Nomor outlet tidak valid" },
          { status: 401 }
        );
      }

      const data = rows[0];

      return NextResponse.json({
        user: {
          role: "outlet",
          code: data.code,
          outletCode: data.outlet_code,
          label: data.label,
        },
      });
    }

    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

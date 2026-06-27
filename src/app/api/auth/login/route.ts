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
      // SPV bisa login dengan code (SPV001) ATAU NIK
      const rows = await query(
        "SELECT qc.*, a.id as area_id, a.name as area_name, a.label as area_label, a.outlet_codes " +
        "FROM quick_login_codes qc " +
        "LEFT JOIN areas a ON qc.nik = a.nik " +
        "WHERE (qc.code = ? OR qc.nik = ?) AND qc.role = 'spv' AND qc.is_active = 1 LIMIT 1",
        [code.toUpperCase(), code]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "NIK / Kode SPV tidak valid" },
          { status: 401 }
        );
      }

      const data = rows[0];
      const outlets = data.area_id
        ? await query(
            "SELECT code, outlet_code, name FROM outlets_mapped WHERE area_id = ? AND is_active = 1 ORDER BY code",
            [data.area_id]
          )
        : [];

      return NextResponse.json({
        user: {
          role: "spv",
          code: data.code,
          label: data.label,
          avatar_url: data.avatar_url || null,
          nik: data.nik,
          areaId: data.area_id || null,
          areaName: data.area_name || null,
          areaLabel: data.area_label || null,
          areaOutletCodes: data.outlet_codes || null,
          outletCodes: outlets.map((outlet: any) => outlet.code),
          outlets: outlets.map((outlet: any) => ({
            code: outlet.code,
            outletCode: outlet.outlet_code,
            name: outlet.name,
          })),
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
          avatar_url: data.avatar_url || null,
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

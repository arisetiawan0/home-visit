import { query } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/visits/[id] — Get single visit
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const rows = await query("SELECT * FROM visits WHERE id = ? LIMIT 1", [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Kunjungan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ visit: rows[0] });
  } catch (err) {
    console.error("GET visit detail error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH /api/visits/[id] — Update visit fields
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: string[] = [];
    const params: any[] = [];

    if (body.outlet_code !== undefined) {
      updates.push("outlet_code = ?");
      params.push(body.outlet_code);
    }
    if (body.outlet_name !== undefined) {
      updates.push("outlet_name = ?");
      params.push(body.outlet_name);
    }
    if (body.visit_date !== undefined) {
      updates.push("visit_date = ?");
      params.push(body.visit_date);
    }
    if (body.spv_code !== undefined) {
      updates.push("spv_code = ?");
      params.push(body.spv_code);
    }
    if (body.divisi !== undefined) {
      updates.push("divisi = ?");
      params.push(body.divisi);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      params.push(body.status);
    }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE visits SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    const rows = await query("SELECT * FROM visits WHERE id = ? LIMIT 1", [id]);
    return NextResponse.json({ visit: rows[0] });
  } catch (err) {
    console.error("PATCH visit detail error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST /api/visits/[id]/submit — Submit/complete a visit
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await query("UPDATE visits SET status = 'completed' WHERE id = ?", [id]);

    const rows = await query("SELECT * FROM visits WHERE id = ? LIMIT 1", [id]);
    return NextResponse.json({ visit: rows[0] });
  } catch (err) {
    console.error("POST submit visit error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/checklist-items?visit_id=xxx — Get items for a visit
export async function GET(request: NextRequest) {
  try {
    const visitId = request.nextUrl.searchParams.get("visit_id");

    if (!visitId) {
      return NextResponse.json(
        { error: "visit_id wajib diisi" },
        { status: 400 }
      );
    }

    // Order by perspective_no and numeric conversion of point_no
    const items = await query(
      "SELECT * FROM checklist_items WHERE visit_id = ? ORDER BY perspective_no ASC, CAST(point_no AS UNSIGNED) ASC",
      [visitId]
    );

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET checklist items error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

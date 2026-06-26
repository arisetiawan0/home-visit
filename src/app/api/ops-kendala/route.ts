import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/ops-kendala?visit_id=xxx — Get OPS Kendala records for a visit
export async function GET(request: NextRequest) {
  try {
    const visitId = request.nextUrl.searchParams.get("visit_id");

    if (!visitId) {
      return NextResponse.json(
        { error: "visit_id wajib diisi" },
        { status: 400 }
      );
    }

    const kendalas = await query(
      `SELECT ok.* 
       FROM ops_kendala ok
       JOIN checklist_items ci ON ok.checklist_item_id = ci.id
       WHERE ci.visit_id = ?`,
      [visitId]
    );

    return NextResponse.json({ kendalas });
  } catch (err) {
    console.error("GET ops-kendala error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST /api/ops-kendala — Update Perspektif 6 OPS Kendala
export async function POST(request: Request) {
  try {
    const { visit_id, sub_item, uraian_temuan } = await request.json();

    if (!visit_id || !sub_item) {
      return NextResponse.json(
        { error: "visit_id dan sub_item wajib diisi" },
        { status: 400 }
      );
    }

    const ptNo = sub_item === "produk" ? "1" : sub_item === "fasilitas" ? "2" : "3";
    const hasUraian = (uraian_temuan && uraian_temuan.trim().length > 0) ? true : false;

    // Find the checklist item for this P6 sub-item
    const items = await query(
      "SELECT id FROM checklist_items WHERE visit_id = ? AND perspective_no = 6 AND point_no = ? LIMIT 1",
      [visit_id, ptNo]
    );

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Item Perspektif 6 tidak ditemukan" },
        { status: 404 }
      );
    }

    const item = items[0];

    // Update checklist item
    await query(
      "UPDATE checklist_items SET hasil_temuan = ?, rencana_perbaikan = '', deadline = NULL, support_divisi = '' WHERE id = ?",
      [hasUraian ? "X" : null, item.id]
    );

    // Update or create ops_kendala record
    if (hasUraian) {
      const existingKendala = await query(
        "SELECT id FROM ops_kendala WHERE checklist_item_id = ? LIMIT 1",
        [item.id]
      );

      if (existingKendala && existingKendala.length > 0) {
        await query(
          "UPDATE ops_kendala SET uraian_temuan = ? WHERE id = ?",
          [uraian_temuan, existingKendala[0].id]
        );
      } else {
        await query(
          "INSERT INTO ops_kendala (id, checklist_item_id, sub_item, uraian_temuan) VALUES (?, ?, ?, ?)",
          [crypto.randomUUID(), item.id, sub_item, uraian_temuan]
        );
      }

      // Ensure documentation entry exists
      const existingDocs = await query(
        "SELECT id FROM outlet_documentation WHERE checklist_item_id = ? LIMIT 1",
        [item.id]
      );

      if (!existingDocs || existingDocs.length === 0) {
        await query(
          "INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status) VALUES (?, ?, '', '[]', 'belum')",
          [crypto.randomUUID(), item.id]
        );
      }
    } else {
      // Remove ops_kendala and documentation if uraian is empty
      await query("DELETE FROM ops_kendala WHERE checklist_item_id = ?", [item.id]);
      await query("DELETE FROM outlet_documentation WHERE checklist_item_id = ?", [item.id]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST ops-kendala error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

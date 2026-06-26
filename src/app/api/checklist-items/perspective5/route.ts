import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/checklist-items/perspective5 — Add a Perspective 5 item
export async function POST(request: Request) {
  try {
    const { visit_id, description } = await request.json();

    if (!visit_id || !description) {
      return NextResponse.json(
        { error: "visit_id dan description wajib diisi" },
        { status: 400 }
      );
    }

    // Get count of existing P5 items to determine point_no
    const countRows = await query(
      "SELECT COUNT(*) AS total FROM checklist_items WHERE visit_id = ? AND perspective_no = 5",
      [visit_id]
    );
    const count = countRows[0]?.total || 0;
    const nextPtNo = count + 1;

    const itemId = crypto.randomUUID();

    // Create checklist item
    await query(
      "INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi) VALUES (?, ?, 5, 'Temuan / Issue Lain', ?, ?, 'X', '', NULL, '')",
      [itemId, visit_id, String(nextPtNo), description]
    );

    // Retrieve created item
    const items = await query("SELECT * FROM checklist_items WHERE id = ? LIMIT 1", [itemId]);
    if (!items || items.length === 0) {
      throw new Error("Gagal membuat item");
    }
    const item = items[0];

    // Auto-create documentation entry
    await query(
      "INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status) VALUES (?, ?, '', '[]', 'belum')",
      [crypto.randomUUID(), item.id]
    );

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("POST perspective5 error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE /api/checklist-items/perspective5 — Remove a P5 item
export async function DELETE(request: Request) {
  try {
    const { item_id } = await request.json();

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id wajib diisi" },
        { status: 400 }
      );
    }

    // Delete documentation first (cascade will also handle this)
    await query("DELETE FROM outlet_documentation WHERE checklist_item_id = ?", [item_id]);

    // Delete the checklist item
    await query(
      "DELETE FROM checklist_items WHERE id = ? AND perspective_no = 5",
      [item_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE perspective5 error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

import { query } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/checklist-items/[id] — Update a checklist item
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // If switching to V, clear the remediation fields
    if (body.hasil_temuan === "V") {
      body.rencana_perbaikan = "";
      body.deadline = null;
      body.support_divisi = "";
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.hasil_temuan !== undefined) {
      updates.push("hasil_temuan = ?");
      params.push(body.hasil_temuan);
    }
    if (body.rencana_perbaikan !== undefined) {
      updates.push("rencana_perbaikan = ?");
      params.push(body.rencana_perbaikan);
    }
    if (body.deadline !== undefined) {
      updates.push("deadline = ?");
      params.push(body.deadline);
    }
    if (body.support_divisi !== undefined) {
      updates.push("support_divisi = ?");
      params.push(body.support_divisi);
    }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE checklist_items SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    // Retrieve updated item
    const items = await query("SELECT * FROM checklist_items WHERE id = ? LIMIT 1", [id]);
    const updatedItem = items[0];

    // Handle outlet_documentation creation/deletion based on hasil_temuan
    if (body.hasil_temuan === "X") {
      // Check if documentation already exists
      const existingDocs = await query(
        "SELECT id FROM outlet_documentation WHERE checklist_item_id = ? LIMIT 1",
        [id]
      );

      if (!existingDocs || existingDocs.length === 0) {
        await query(
          "INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status) VALUES (?, ?, ?, ?, ?)",
          [crypto.randomUUID(), id, "", "[]", "belum"]
        );
      }
    } else if (body.hasil_temuan === "V") {
      // Remove documentation if switching back to compliant
      await query("DELETE FROM outlet_documentation WHERE checklist_item_id = ?", [id]);
    }

    return NextResponse.json({ item: updatedItem });
  } catch (err) {
    console.error("PATCH checklist item error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

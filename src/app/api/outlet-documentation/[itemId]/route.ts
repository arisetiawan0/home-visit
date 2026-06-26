import { query } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ itemId: string }> };

// PATCH /api/outlet-documentation/[itemId] — Update documentation for a checklist item
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();

    const updates: string[] = [];
    const params: any[] = [];

    if (body.catatan !== undefined) {
      updates.push("catatan = ?");
      params.push(body.catatan);
    }
    if (body.foto_urls !== undefined) {
      updates.push("foto_urls = ?");
      params.push(JSON.stringify(body.foto_urls));
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      params.push(body.status);
    }

    if (updates.length > 0) {
      params.push(itemId);
      await query(
        `UPDATE outlet_documentation SET ${updates.join(", ")} WHERE checklist_item_id = ?`,
        params
      );
    }

    const docs = await query(
      "SELECT * FROM outlet_documentation WHERE checklist_item_id = ? LIMIT 1",
      [itemId]
    );

    if (!docs || docs.length === 0) {
      return NextResponse.json(
        { error: "Dokumentasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const doc = docs[0];
    if (typeof doc.foto_urls === "string") {
      try {
        doc.foto_urls = JSON.parse(doc.foto_urls);
      } catch {
        doc.foto_urls = [];
      }
    }

    return NextResponse.json({ documentation: doc });
  } catch (err) {
    console.error("PATCH outlet-documentation error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

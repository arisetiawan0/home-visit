import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/outlet-documentation?visit_id=xxx — Get all documentation for a visit
export async function GET(request: NextRequest) {
  try {
    const visitId = request.nextUrl.searchParams.get("visit_id");

    if (!visitId) {
      return NextResponse.json(
        { error: "visit_id wajib diisi" },
        { status: 400 }
      );
    }

    // Get all checklist item IDs for this visit
    const items = await query(
      "SELECT id FROM checklist_items WHERE visit_id = ?",
      [visitId]
    );

    if (!items || items.length === 0) {
      return NextResponse.json({ documentations: [] });
    }

    const itemIds = items.map((i: any) => i.id);
    const placeholders = itemIds.map(() => "?").join(", ");

    const documentations = await query(
      `SELECT * FROM outlet_documentation WHERE checklist_item_id IN (${placeholders})`,
      itemIds
    );

    // Defensively map and parse foto_urls if returned as string
    const parsedDocumentations = documentations.map((doc: any) => {
      if (typeof doc.foto_urls === "string") {
        try {
          doc.foto_urls = JSON.parse(doc.foto_urls);
        } catch {
          doc.foto_urls = [];
        }
      }
      return doc;
    });

    return NextResponse.json({ documentations: parsedDocumentations });
  } catch (err) {
    console.error("GET outlet-documentation error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

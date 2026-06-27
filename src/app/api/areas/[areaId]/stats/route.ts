import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ areaId: string }> }
) {
  try {
    const { areaId } = await params;

    // Get area info
    const areaRows = await query(
      "SELECT * FROM areas WHERE id = ? LIMIT 1",
      [areaId]
    );

    if (!areaRows || areaRows.length === 0) {
      return NextResponse.json(
        { error: "Area tidak ditemukan" },
        { status: 404 }
      );
    }

    const area = areaRows[0];

    // Get all outlets for this area
    const outlets = await query(
      "SELECT code, outlet_code, name FROM outlets_mapped WHERE area_id = ? AND is_active = 1",
      [areaId]
    );

    // Calculate stats for current month
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
    const endYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    // Total visits this month by this SPV
    const [totalVisitsRows] = await query(
      `SELECT COUNT(*) as count FROM visits
       WHERE spv_code = ? AND visit_date >= ? AND visit_date < ?`,
      [area.spv_code, startDate, endDate]
    );

    // Completed visits
    const [completedVisitsRows] = await query(
      `SELECT COUNT(*) as count FROM visits
       WHERE spv_code = ? AND status = 'completed' AND visit_date >= ? AND visit_date < ?`,
      [area.spv_code, startDate, endDate]
    );

    // Stats per outlet
    const statsPerOutlet = await Promise.all(
      outlets.map(async (outlet: any) => {
        const [outletVisits] = await query(
          `SELECT COUNT(*) as count FROM visits
           WHERE outlet_code = ? AND visit_date >= ? AND visit_date < ?`,
          [outlet.code, startDate, endDate]
        );

        const [completedOutletVisits] = await query(
          `SELECT COUNT(*) as count FROM visits
           WHERE outlet_code = ? AND status = 'completed' AND visit_date >= ? AND visit_date < ?`,
          [outlet.code, startDate, endDate]
        );

        return {
          code: outlet.code,
          outlet_code: outlet.outlet_code,
          name: outlet.name,
          total: outletVisits.count,
          completed: completedOutletVisits.count,
        };
      })
    );

    const totalVisits = totalVisitsRows.count;
    const completedVisits = completedVisitsRows.count;

    return NextResponse.json({
      stats: {
        area: {
          id: area.id,
          name: area.name,
          label: area.label,
          spv_code: area.spv_code,
        },
        totalVisits,
        completedVisits,
        completionRate: totalVisits > 0
          ? Math.round((completedVisits / totalVisits) * 100)
          : 0,
        outletCount: outlets.length,
        visitedOutletCount: statsPerOutlet.filter((s: any) => s.total > 0).length,
        statsPerOutlet,
      },
    });
  } catch (err) {
    console.error("Error getting area stats:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

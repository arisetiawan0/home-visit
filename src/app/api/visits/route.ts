import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Master checklist data for creating new visits
const PERSPECTIVE_NAMES: Record<number, string> = {
  1: "Standar Pelayanan Advisor dan BA",
  2: "Standar Pelayanan Kasir",
  3: "Standar Kebersihan & Kenyamanan Outlet",
  4: "Standar Tertib Administrasi",
  5: "Temuan / Issue Lain",
  6: "Kendala OPS",
};

const MASTER_CHECKLIST = [
  { pNo: 1, ptNo: 1, desc: "Karyawan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada" },
  { pNo: 1, ptNo: 2, desc: "Karyawan bersikap ramah dalam memberikan pelayanan kepada pelanggan" },
  { pNo: 1, ptNo: 3, desc: "Karyawan mampu memberikan penjelasan tentang produk yang dijual" },
  { pNo: 1, ptNo: 4, desc: "Karyawan mampu berkomunikasi dengan baik kepada pelanggan" },
  { pNo: 1, ptNo: 5, desc: "Karyawan mampu melakukan Cross-selling dan Up-selling" },
  { pNo: 1, ptNo: 6, desc: "Grooming sesuai Standar" },
  { pNo: 1, ptNo: 7, desc: "Kecepatan Melayani Pelanggan" },
  { pNo: 1, ptNo: 8, desc: "Sikap dan etika kerja tim" },
  { pNo: 2, ptNo: 1, desc: "Kasir melakukan eye-contact dan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada" },
  { pNo: 2, ptNo: 2, desc: "Kasir mampu memberikan penjelasan tentang promosi yang sedang berjalan" },
  { pNo: 2, ptNo: 3, desc: "Kasir melakukan cross-selling, up-selling dan menawarkan membership" },
  { pNo: 2, ptNo: 4, desc: "Kasir mampu memberikan pelayanan pembayaran secara teliti dan cepat" },
  { pNo: 2, ptNo: 5, desc: "Kasir melakukan 7 step pelayanan kasir" },
  { pNo: 2, ptNo: 6, desc: "Kondisi Tester" },
  { pNo: 2, ptNo: 7, desc: "Area Kasir bersih dan Rapih" },
  { pNo: 3, ptNo: 1, desc: "Kebersihan lantai, kaca, produk dan rak selalu terjaga dengan baik" },
  { pNo: 3, ptNo: 2, desc: "Standar kenyamanan suhu ruangan area penjualan terjaga dengan baik (suhu 25–27°C)" },
  { pNo: 3, ptNo: 3, desc: "Standar penerangan area penjualan terjaga dengan baik (lumen 800–1.100)" },
  { pNo: 4, ptNo: 1, desc: "Mengecek form checklist buka-tutup toko" },
  { pNo: 4, ptNo: 2, desc: "Mengecek pelaksanaan worksheet dan checklist kebersihan" },
  { pNo: 4, ptNo: 3, desc: "Mengecek administrasi kasir (buku serah-terima modal, setoran kasir, void & refund)" },
  { pNo: 4, ptNo: 4, desc: "Mengecek kelengkapan pricecard dan perubahan harga jual" },
  { pNo: 4, ptNo: 5, desc: "Proses penerimaan barang internal dan eksternal" },
  { pNo: 4, ptNo: 6, desc: "Pelaksanaan Cek Body" },
  { pNo: 4, ptNo: 7, desc: "Penggunaan LOKER" },
  { pNo: 6, ptNo: 1, desc: "Produk / Ketersediaan Barang" },
  { pNo: 6, ptNo: 2, desc: "Fasilitas" },
  { pNo: 6, ptNo: 3, desc: "SDM" },
];

// GET /api/visits — List visits with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let sql = "SELECT * FROM visits WHERE 1=1";
    const params: any[] = [];

    // Filter by outlet_code
    const outletCode = searchParams.get("outlet_code");
    if (outletCode) {
      sql += " AND outlet_code = ?";
      params.push(outletCode);
    }

    // Filter by status
    const status = searchParams.get("status");
    if (status && (status === "draft" || status === "completed")) {
      sql += " AND status = ?";
      params.push(status);
    }

    // Filter by month (YYYY-MM format)
    const month = searchParams.get("month");
    if (month) {
      const [year, m] = month.split("-");
      const startDate = `${year}-${m}-01`;
      const endMonth = parseInt(m) === 12 ? 1 : parseInt(m) + 1;
      const endYear = parseInt(m) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      sql += " AND visit_date >= ? AND visit_date < ?";
      params.push(startDate, endDate);
    }

    sql += " ORDER BY created_at DESC";

    const data = await query(sql, params);

    return NextResponse.json({ visits: data });
  } catch (err) {
    console.error("GET visits error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST /api/visits — Create a new visit with checklist items
export async function POST(request: Request) {
  let visitId: string | null = null;
  try {
    const { outlet_code, visit_date, spv_code } = await request.json();

    if (!outlet_code || !visit_date) {
      return NextResponse.json(
        { error: "Outlet dan tanggal kunjungan wajib diisi" },
        { status: 400 }
      );
    }

    const outletName = `Beauty ${outlet_code}`;
    visitId = crypto.randomUUID();

    // Create visit
    await query(
      "INSERT INTO visits (id, outlet_code, outlet_name, visit_date, spv_code, divisi, status) VALUES (?, ?, ?, ?, ?, 'OPS', 'draft')",
      [visitId, outlet_code, outletName, visit_date, spv_code || "SPV2024"]
    );

    // Retrieve the created visit
    const visits = await query("SELECT * FROM visits WHERE id = ? LIMIT 1", [visitId]);
    if (!visits || visits.length === 0) {
      throw new Error("Failed to create visit record");
    }
    const visit = visits[0];

    // Create checklist items from master data
    const checklistInserts = MASTER_CHECKLIST.map((master) => ({
      id: crypto.randomUUID(),
      visit_id: visit.id,
      perspective_no: master.pNo,
      perspective_name: PERSPECTIVE_NAMES[master.pNo],
      point_no: String(master.ptNo),
      point_description: master.desc,
      hasil_temuan: null,
      rencana_perbaikan: "",
      deadline: null,
      support_divisi: "",
    }));

    const placeholders = checklistInserts.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const params = checklistInserts.flatMap((item) => [
      item.id,
      item.visit_id,
      item.perspective_no,
      item.perspective_name,
      item.point_no,
      item.point_description,
      item.hasil_temuan,
      item.rencana_perbaikan,
      item.deadline,
      item.support_divisi,
    ]);

    await query(
      `INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi) VALUES ${placeholders}`,
      params
    );

    return NextResponse.json({ visit }, { status: 201 });
  } catch (err: any) {
    console.error("POST visits error:", err);
    if (visitId) {
      // Rollback: delete the visit if checklist creation fails
      await query("DELETE FROM visits WHERE id = ?", [visitId]);
    }
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

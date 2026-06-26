"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Visit,
  ChecklistItem,
  OutletDocumentation,
  useAppStore,
  apiGetVisit,
  apiGetChecklistItems,
  apiGetOutletDocumentations,
  apiUpdateChecklistItem,
} from "@/lib/mockStore";
import { motion } from "framer-motion";
import {
  IconArrowLeft,
  IconPrinter,
  IconPhoto,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconCalendar,
  IconFileText
} from "@tabler/icons-react";
import html2canvas from "html2canvas-pro";

export default function VisitSummaryPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [outletDocumentations, setOutletDocumentations] = useState<OutletDocumentation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      if (!id) return;
      setDataLoading(true);
      try {
        const visitData = await apiGetVisit(id as string);
        setVisit(visitData);
        if (visitData) {
          const items = await apiGetChecklistItems(visitData.id);
          setChecklistItems(items);
          const docs = await apiGetOutletDocumentations(visitData.id);
          setOutletDocumentations(docs);
        }
      } catch (err) {
        console.error("Failed to fetch summary data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (!mounted || dataLoading || !visit) {
    return (
      <div className="h-64 bg-[#0f172a] border border-[#1e293b] rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Load items for this visit
  const visitItems = checklistItems.filter((i) => i.visit_id === visit.id);
  // Get all X findings (standard, custom P5, and active P6)
  const findings = visitItems.filter((i) => i.hasil_temuan === "X");

  // Calculations
  const totalPoints = visitItems.length;
  const totalFindings = findings.length;
  
  const completedItemIds = findings.map(i => i.id);
  const resolvedDocs = outletDocumentations.filter(
    doc => completedItemIds.includes(doc.checklist_item_id) && doc.status === "selesai"
  );
  const totalResolved = resolvedDocs.length;
  const totalPending = totalFindings - totalResolved;

  const isEditMode = currentUser?.role === "spv" && !exporting;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = () => {
    if (!reportRef.current) return;
    setExporting(true);

    // Allow React to re-render the DOM without input text boxes before html2canvas capture
    setTimeout(async () => {
      try {
        if (!reportRef.current) return;
        const canvas = await html2canvas(reportRef.current, {
          useCORS: true,
          scale: 2, // better quality
          backgroundColor: "#090d16", // match theme
        });

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `HV-Summary-${visit.outlet_name}-${visit.visit_date}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Gagal ekspor gambar:", err);
      } finally {
        setExporting(false);
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER NAVIGATION (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-card-border pb-5">
        <div className="space-y-1">
          <button
            onClick={() => router.push(`/visits/${visit.id}`)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400 transition-colors duration-200 cursor-pointer mb-2"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Form Checklist
          </button>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Ringkasan & Ekspor Laporan
          </h1>
          <p className="text-muted text-xs">
            Review layout cetak dan ekspor ringkasan kunjungan {visit.outlet_name} ke PDF atau PNG.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-card hover:bg-card-hover text-secondary hover:text-foreground font-semibold text-xs border border-card-border rounded-xl transition-all duration-200 cursor-pointer"
          >
            <IconPrinter className="w-4 h-4" />
            Cetak / Ekspor PDF
          </button>
          <button
            onClick={handleExportPNG}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <IconPhoto className="w-4 h-4" />
            {exporting ? "Mengekspor..." : "Ekspor PNG"}
          </button>
        </div>
      </div>

      {/* 2. REPORT METRICS BRIEF (Hidden on Print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-card-darker rounded-xl text-muted border border-card-border">
            <IconFileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Poin Diperiksa</p>
            <h4 className="text-lg font-bold text-secondary">{totalPoints} Poin</h4>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-card-darker rounded-xl text-rose-400 border border-card-border">
            <IconX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Total Temuan (X)</p>
            <h4 className="text-lg font-bold text-rose-400">{totalFindings} Temuan</h4>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-card-darker rounded-xl text-emerald-400 border border-card-border">
            <IconCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Perbaikan Selesai</p>
            <h4 className="text-lg font-bold text-emerald-400">
              {totalResolved} / {totalFindings} ({totalFindings > 0 ? Math.round((totalResolved / totalFindings) * 100) : 100}%)
            </h4>
          </div>
        </div>
      </div>

      {/* Mode Rencana Perbaikan Banner for SPV */}
      {currentUser?.role === "spv" && (
        <div className="no-print p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-450 flex items-start gap-3 text-xs shadow-sm">
          <IconAlertCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-foreground block">Mode Rencana Perbaikan (Hasil Meeting)</span>
            <p className="text-muted leading-relaxed">
              Sebagai Supervisor, Anda dapat menyusun dan mengisi <strong>Rencana Perbaikan</strong>, <strong>Deadline</strong>, dan <strong>PIC</strong> hasil koordinasi/meeting dengan tim outlet langsung pada tabel di bawah ini. Perubahan akan disimpan secara otomatis.
            </p>
          </div>
        </div>
      )}

      {/* 3. PRINTABLE REPORT TEMPLATE */}
      <div
        ref={reportRef}
        className="bg-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl print-card print:border-none print:shadow-none"
      >
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* A. Kop Surat Official */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b-2 border-card-border pb-6 print:border-slate-350">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground print-title">
                BEAUTY KENDARI
              </h2>
              <p className="text-muted text-xs uppercase tracking-wider font-bold print-title">
                Laporan Ringkasan Kunjungan (Home Visit)
              </p>
            </div>
            <div className="text-muted text-xs sm:text-right font-mono space-y-1 print-title">
              <div>No Dok: <span className="font-semibold text-secondary">HV/{visit.visit_date.replace(/-/g, "/")}/{visit.id.substring(6, 11).toUpperCase()}</span></div>
              <div>Tanggal Kunjungan: <span className="font-semibold text-secondary">{new Date(visit.visit_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
            </div>
          </div>

          {/* B. Metadata Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card-darker/40 border border-card-border rounded-xl p-4 print:bg-transparent print:border-slate-350">
            <div className="space-y-2 text-xs">
              <div className="flex">
                <span className="w-24 text-muted font-semibold uppercase tracking-wider">Outlet:</span>
                <span className="font-bold text-secondary print-title">{visit.outlet_name}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted font-semibold uppercase tracking-wider">Divisi:</span>
                <span className="text-secondary print-title">{visit.divisi}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs sm:pl-8">
              <div className="flex">
                <span className="w-24 text-muted font-semibold uppercase tracking-wider">Petugas SPV:</span>
                <span className="font-mono text-secondary font-semibold print-title">{visit.spv_code}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted font-semibold uppercase tracking-wider">Status Form:</span>
                <span className="font-semibold text-emerald-400">SELESAI (SUBMITTED)</span>
              </div>
            </div>
          </div>

          {/* C. Findings & Plans Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider print-title">
              Daftar Temuan (X) & Rencana Perbaikan
            </h3>
            
            {findings.length === 0 ? (
              <div className="p-8 border border-dashed border-card-border rounded-xl text-center text-muted text-xs print:border-slate-300">
                <IconCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-secondary">Kunjungan Sempurna!</p>
                <p>Tidak ditemukan ketidaksesuaian pada butir checklist di outlet ini.</p>
              </div>
            ) : (
              <div className="border border-card-border rounded-xl overflow-hidden print:border-slate-350">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-card-darker/60 text-muted uppercase tracking-wider font-mono border-b border-card-border print:bg-slate-100 print:text-black print:border-slate-350">
                      <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
                      <th className="px-4 py-3 font-semibold w-32">Perspektif</th>
                      <th className="px-4 py-3 font-semibold w-[22%]">Deskripsi Butir</th>
                      <th className="px-4 py-3 font-semibold w-[32%]">Rencana Perbaikan (SPV)</th>
                      <th className="px-4 py-3 font-semibold w-[15%]">Deadline</th>
                      <th className="px-4 py-3 font-semibold w-[15%]">PIC</th>
                      <th className="px-4 py-3 font-semibold w-24 text-center">Status Perbaikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-secondary print:divide-slate-350 print:text-black">
                    {findings.map((item, idx) => {
                      const doc = outletDocumentations.find((d) => d.checklist_item_id === item.id);
                      return (
                        <tr key={item.id} className="align-top hover:bg-card-hover/10">
                          <td className="px-4 py-3 font-mono text-center">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-muted print-title">
                            P{item.perspective_no} - {item.perspective_name.replace("Standar Pelayanan ", "").replace("Standar ", "")}
                          </td>
                          <td className="px-4 py-3 leading-relaxed">
                            {item.point_description}
                          </td>
                          <td className="px-4 py-3 italic text-secondary print-title leading-relaxed">
                            {isEditMode ? (
                              <>
                                <textarea
                                  value={item.rencana_perbaikan}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, rencana_perbaikan: val } : i));
                                    apiUpdateChecklistItem(item.id, { rencana_perbaikan: val });
                                  }}
                                  placeholder="Uraikan rencana perbaikan..."
                                  rows={2}
                                  className="print:hidden w-full bg-card-darker/80 border border-card-border hover:border-card-hover focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y min-h-[55px] transition-colors duration-150"
                                />
                                <span className="hidden print:inline-block whitespace-pre-wrap">{item.rencana_perbaikan || "-"}</span>
                              </>
                            ) : (
                              <span>{item.rencana_perbaikan || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {isEditMode ? (
                              <>
                                <input
                                  type="date"
                                  value={item.deadline ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, deadline: val } : i));
                                    apiUpdateChecklistItem(item.id, { deadline: val });
                                  }}
                                  className="print:hidden w-full bg-card-darker/80 border border-card-border hover:border-card-hover focus:border-emerald-500 rounded-lg px-2.5 py-2 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors duration-150 min-h-[36px]"
                                />
                                <span className="hidden print:inline-block">
                                  {item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                </span>
                              </>
                            ) : (
                              <span>
                                {item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {isEditMode ? (
                              <>
                                <input
                                  type="text"
                                  value={item.support_divisi}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, support_divisi: val } : i));
                                    apiUpdateChecklistItem(item.id, { support_divisi: val });
                                  }}
                                  placeholder="E.g. IT, GA, SPV"
                                  className="print:hidden w-full bg-card-darker/80 border border-card-border hover:border-card-hover focus:border-emerald-500 rounded-lg px-2.5 py-2 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors duration-150 min-h-[36px]"
                                />
                                <span className="hidden print:inline-block">{item.support_divisi || "-"}</span>
                              </>
                            ) : (
                              <span>{item.support_divisi || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase print:bg-transparent print:border print:text-black ${
                                doc?.status === "selesai"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:border-emerald-500"
                                  : doc?.status === "proses"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 print:border-amber-500"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20 print:border-rose-500"
                              }`}
                            >
                              {doc?.status === "selesai" ? "Selesai" : doc?.status === "proses" ? "Proses" : "Belum"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* D. Signature Blocks */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-16">
              <p className="text-muted uppercase tracking-wider font-semibold">Dibuat Oleh,</p>
              <div className="space-y-1">
                <p className="font-mono font-semibold text-secondary border-b border-dashed border-card-border pb-1.5 w-48 mx-auto print-title">
                  {visit.spv_code}
                </p>
                <p className="text-muted">Supervisor Lapangan</p>
              </div>
            </div>
            
            <div className="space-y-16">
              <p className="text-muted uppercase tracking-wider font-semibold">Disetujui Oleh,</p>
              <div className="space-y-1">
                <p className="font-semibold text-secondary border-b border-dashed border-card-border pb-1.5 w-48 mx-auto print-title">
                  Kepala Toko {visit.outlet_name}
                </p>
                <p className="text-muted">Store Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

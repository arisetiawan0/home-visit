"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  apiGetAreaStats,
  apiGetVisits,
  apiGetChecklistItems,
  apiGetOutletDocumentations,
  useAppStore,
  AreaStats,
  Visit,
  ChecklistItem,
  OutletDocumentation,
} from "@/lib/mockStore";
import { motion } from "framer-motion";
import {
  IconCalendar,
  IconFilter,
  IconPlus,
  IconClipboardText,
  IconFileExport,
  IconAlertCircle,
  IconChartBar,
  IconTargetArrow,
} from "@tabler/icons-react";
import CustomSelect from "@/components/CustomSelect";

export default function SpvDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [outletDocumentations, setOutletDocumentations] = useState<OutletDocumentation[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Filter States
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Hydration handling
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from API
  useEffect(() => {
    if (!mounted) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const visitsData = await apiGetVisits({
          outlet_codes: currentUser?.outletCodes?.length ? currentUser.outletCodes : undefined,
        });
        setVisits(visitsData);
        if (currentUser?.areaId) {
          setAreaStats(await apiGetAreaStats(currentUser.areaId));
        }
        
        // Fetch checklist items and docs for all visits
        const allItems: ChecklistItem[] = [];
        const allDocs: OutletDocumentation[] = [];
        
        await Promise.all(
          visitsData.map(async (v) => {
            const items = await apiGetChecklistItems(v.id);
            allItems.push(...items);
            const docs = await apiGetOutletDocumentations(v.id);
            allDocs.push(...docs);
          })
        );
        
        setChecklistItems(allItems);
        setOutletDocumentations(allDocs);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [mounted, currentUser]);

  if (!mounted || dataLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-card rounded-2xl" />
        <div className="h-96 bg-card rounded-2xl" />
      </div>
    );
  }

  // --- STATS COMPUTATION ---
  // Target bulanan: minimal 10 kunjungan/bulan (bisa lebih; 1 outlet boleh dikunjungi >1x).
  const MONTHLY_TARGET = 10;
  const totalVisits = visits.length;
  const managedOutletCount = areaStats?.outletCount ?? currentUser?.outlets?.length ?? 0;
  const visitCoverage = Math.round((totalVisits / MONTHLY_TARGET) * 100);
  
  // Total checklist items marked as X (temuan) across completed visits
  const completedVisitIds = visits.filter(v => v.status === "completed").map(v => v.id);
  const totalFindings = checklistItems.filter(
    item => completedVisitIds.includes(item.visit_id) && item.hasil_temuan === "X"
  ).length;

  // Resolved findings (documentation status = 'selesai')
  const completedItemIds = checklistItems
    .filter(item => completedVisitIds.includes(item.visit_id) && item.hasil_temuan === "X")
    .map(i => i.id);
  
  const resolvedFindings = outletDocumentations.filter(
    doc => completedItemIds.includes(doc.checklist_item_id) && doc.status === "selesai"
  ).length;

  const openFindings = totalFindings - resolvedFindings;
  const resolutionRate = totalFindings > 0 ? Math.round((resolvedFindings / totalFindings) * 100) : 100;

  // --- FILTER LOGIC ---
  const filteredVisits = visits.filter((v) => {
    // Outlet Filter
    if (selectedOutlet && v.outlet_code !== selectedOutlet) return false;
    
    // Status Filter (Repair status is computed based on its items)
    if (selectedStatus) {
      const visitItems = checklistItems.filter(item => item.visit_id === v.id);
      const hasX = visitItems.some(i => i.hasil_temuan === "X");
      
      let computedRepairStatus: "belum" | "proses" | "selesai" = "selesai";
      if (hasX) {
        const itemIds = visitItems.filter(i => i.hasil_temuan === "X").map(i => i.id);
        const docs = outletDocumentations.filter(d => itemIds.includes(d.checklist_item_id));
        
        const allDone = docs.length > 0 && docs.every(d => d.status === "selesai");
        const anyProses = docs.some(d => d.status === "proses");
        
        if (allDone) {
          computedRepairStatus = "selesai";
        } else if (anyProses || docs.length > 0) {
          computedRepairStatus = "proses";
        } else {
          computedRepairStatus = "belum";
        }
      }

      if (selectedStatus === "completed" && v.status !== "completed") return false;
      if (selectedStatus === "draft" && v.status !== "draft") return false;
      if (selectedStatus === "repair_belum" && (v.status !== "completed" || computedRepairStatus !== "belum")) return false;
      if (selectedStatus === "repair_proses" && (v.status !== "completed" || computedRepairStatus !== "proses")) return false;
      if (selectedStatus === "repair_selesai" && (v.status !== "completed" || computedRepairStatus !== "selesai")) return false;
    }

    // Month Filter
    if (selectedMonth) {
      const visitMonth = v.visit_date.substring(0, 7); // 'YYYY-MM'
      if (visitMonth !== selectedMonth) return false;
    }

    return true;
  });

  // --- FILTERED STATS (for per-outlet KPI cards) ---
  const filteredTotalVisits = filteredVisits.length;
  const filteredCompletedVisitIds = filteredVisits
    .filter((v) => v.status === "completed")
    .map((v) => v.id);
  const filteredTotalFindings = checklistItems.filter(
    (item) => filteredCompletedVisitIds.includes(item.visit_id) && item.hasil_temuan === "X"
  ).length;
  const filteredResolvedFindings = outletDocumentations.filter(
    (doc) =>
      checklistItems.some(
        (item) =>
          item.id === doc.checklist_item_id &&
          filteredCompletedVisitIds.includes(item.visit_id) &&
          item.hasil_temuan === "X"
      ) && doc.status === "selesai"
  ).length;
  const filteredOpenFindings = filteredTotalFindings - filteredResolvedFindings;
  const filteredResolutionRate =
    filteredTotalFindings > 0
      ? Math.round((filteredResolvedFindings / filteredTotalFindings) * 100)
      : 100;

  // Unique months helper for filter dropdown
  const uniqueMonths = Array.from(
    new Set(visits.map((v) => v.visit_date.substring(0, 7)))
  ).sort();

  // Custom Select Options
  const outletOptions = [
    { value: "", label: currentUser?.areaLabel ? `Semua Outlet ${currentUser.areaLabel}` : "Semua Outlet" },
    ...(currentUser?.outlets?.length
      ? currentUser.outlets.map((outlet) => ({
          value: outlet.code,
          label: `${outlet.outletCode} - ${outlet.name}`,
        }))
      : Array.from({ length: 27 }, (_, i) => {
          const code = String(i + 1).padStart(2, "0");
          return { value: code, label: `Beauty ${code}` };
        })),
  ];

  const monthOptions = [
    { value: "", label: "Semua Bulan" },
    ...uniqueMonths.map((m) => {
      const [year, month] = m.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString("id-ID", { month: "long" });
      return { value: m, label: `${monthName} ${year}` };
    }),
  ];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "draft", label: "Checklist: Draft" },
    { value: "completed", label: "Checklist: Selesai" },
    { value: "repair_belum", label: "Perbaikan: Belum Mulai" },
    { value: "repair_proses", label: "Perbaikan: Sedang Proses" },
    { value: "repair_selesai", label: "Perbaikan: Selesai" },
  ];

  return (
    <div className="space-y-8">
      {currentUser?.areaLabel && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-card border border-card-border rounded-2xl p-5"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {currentUser.areaLabel}
              </p>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
                {currentUser.areaName || currentUser.label}
              </h1>
              <p className="text-sm text-muted mt-1">
                NIK {currentUser.nik} mengelola {managedOutletCount} outlet dalam area ini.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-64">
              <div className="rounded-xl border border-card-border bg-card-darker/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Target Bulanan</p>
                <p className="text-3xl font-extrabold text-foreground mt-2">{MONTHLY_TARGET}+</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card-darker/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cakupan</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">{visitCoverage}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 1. TOP CARDS: DASHBOARD KPIs */}
      <div className={`grid gap-5 ${selectedOutlet ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
        {(
          selectedOutlet
            ? [
                {
                  title: "Total Kunjungan",
                  value: filteredTotalVisits,
                  desc: `Kunjungan ke outlet terpilih`,
                  icon: IconClipboardText,
                  color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
                },
                {
                  title: "Jumlah Temuan",
                  value: filteredTotalFindings,
                  desc: "Total temuan tercatat",
                  icon: IconAlertCircle,
                  color: "text-rose-400 bg-rose-500/5 border-rose-500/10",
                },
                {
                  title: "Temuan Selesai",
                  value: filteredResolvedFindings,
                  desc: "Temuan sudah ditindaklanjuti",
                  icon: IconChartBar,
                  color: "text-violet-400 bg-violet-500/5 border-violet-500/10",
                },
                {
                  title: "Persentase",
                  value: `${filteredResolutionRate}%`,
                  desc: "Rasio penyelesaian temuan",
                  icon: IconTargetArrow,
                  color: "text-amber-400 bg-amber-500/5 border-amber-500/10",
                },
              ]
            : [
                {
                  title: "Total Kunjungan",
                  value: totalVisits,
                  desc: currentUser?.areaLabel ? `Dalam ${currentUser.areaLabel}` : "Semua outlet",
                  icon: IconClipboardText,
                  color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
                },
                {
                  title: "Target Kunjungan",
                  value: `${MONTHLY_TARGET}+`,
                  desc: "Min. 10 kunjungan/bulan",
                  icon: IconTargetArrow,
                  color: "text-violet-400 bg-violet-500/5 border-violet-500/10",
                },
                {
                  title: "Cakupan",
                  value: `${visitCoverage}%`,
                  desc: "Persentase target tercapai",
                  icon: IconChartBar,
                  color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
                },
              ]
        ).map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              key={card.title}
              className={`group bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between gap-4 h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${card.color.split(" ")[2]}`}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {card.title}
                </p>
                <h3 className="text-4xl font-extrabold text-foreground tracking-tight mt-2">
                  {card.value}
                </h3>
                <p className="text-xs text-muted mt-2">{card.desc}</p>
              </div>
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${card.color.split(" ").slice(0, 2).join(" ")}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. FILTER ACTION ROW */}
      <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <IconFilter className="w-4 h-4 text-emerald-400" />
            Filter & Pencarian
          </div>
          <button
            onClick={() => {
              setSelectedOutlet("");
              setSelectedMonth("");
              setSelectedStatus("");
            }}
            className="text-xs text-muted hover:text-emerald-400 transition-colors duration-200 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Outlet Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Pilih Outlet
            </label>
            <CustomSelect
              options={outletOptions}
              value={selectedOutlet}
              onChange={setSelectedOutlet}
              placeholder="Pilih Outlet"
            />
          </div>

          {/* Month Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Bulan Kunjungan
            </label>
            <CustomSelect
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              placeholder="Semua Bulan"
            />
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Status Kunjungan & Perbaikan
            </label>
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Semua Status"
            />
          </div>
        </div>
      </div>

      {/* 3. MONITORING TABLE */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-card-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Daftar Kunjungan Home Visit</h3>
            <p className="text-muted text-xs mt-1">
              Menampilkan {filteredVisits.length} dari {visits.length} kunjungan terdaftar
            </p>
          </div>
          <button
            onClick={() => router.push("/visits/new")}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer w-full sm:w-auto"
          >
            <IconPlus className="w-4 h-4" />
            Kunjungan Baru
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          {filteredVisits.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted space-y-2">
              <IconClipboardText className="w-12 h-12 mx-auto text-muted animate-pulse" />
              <p className="text-sm font-semibold">Tidak Ada Kunjungan Ditemukan</p>
              <p className="text-xs max-w-[40ch] mx-auto">
                Coba sesuaikan filter pencarian atau buat kunjungan baru untuk memulai monitoring.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-card-darker/40 text-muted text-xs font-mono uppercase tracking-wider border-b border-card-border">
                  <th className="px-6 py-4 font-semibold w-16">No</th>
                  <th className="px-6 py-4 font-semibold">Outlet</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">SPV</th>
                  <th className="px-6 py-4 font-semibold text-center">Status Checklist</th>
                  <th className="px-6 py-4 font-semibold text-center">Status Perbaikan</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-secondary">
                {filteredVisits.map((visit, index) => {
                  // Compute checklist status
                  const isCompleted = visit.status === "completed";
                  
                  // Compute repair status
                  const visitItems = checklistItems.filter(item => item.visit_id === visit.id);
                  const hasX = visitItems.some(i => i.hasil_temuan === "X");
                  
                  let repairStatus: "belum" | "proses" | "selesai" = "selesai";
                  if (hasX) {
                    const itemIds = visitItems.filter(i => i.hasil_temuan === "X").map(i => i.id);
                    const docs = outletDocumentations.filter(d => itemIds.includes(d.checklist_item_id));
                    
                    const allDone = docs.length > 0 && docs.every(d => d.status === "selesai");
                    const anyProses = docs.some(d => d.status === "proses");
                    
                    if (allDone) {
                      repairStatus = "selesai";
                    } else if (anyProses || docs.length > 0) {
                      repairStatus = "proses";
                    } else {
                      repairStatus = "belum";
                    }
                  }

                  return (
                    <tr
                      key={visit.id}
                      className="hover:bg-card-hover/40 transition-colors duration-150"
                    >
                      <td className="px-6 py-4.5 font-mono text-xs">{index + 1}</td>
                      <td className="px-6 py-4.5 font-bold text-foreground">
                        {visit.outlet_name}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="flex items-center gap-1.5 text-xs">
                          <IconCalendar className="w-3.5 h-3.5 text-muted" />
                          {new Date(visit.visit_date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs text-muted">
                        {visit.spv_code}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-500/10 text-muted border border-card-border"
                          }`}
                        >
                          {isCompleted ? "Selesai" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        {!isCompleted ? (
                          <span className="text-xs text-muted font-medium">-</span>
                        ) : !hasX ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Tidak Ada Temuan
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                              repairStatus === "selesai"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : repairStatus === "proses"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {repairStatus === "selesai"
                              ? "Selesai"
                              : repairStatus === "proses"
                              ? "Sedang Proses"
                              : "Menunggu"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => router.push(`/visits/${visit.id}`)}
                            className="p-1.5 hover:bg-card-hover text-secondary hover:text-emerald-400 border border-card-border rounded-lg transition-all duration-150 cursor-pointer"
                            title={isCompleted ? "Lihat Detail" : "Edit Checklist"}
                          >
                            <IconClipboardText className="w-4 h-4" />
                          </button>
                          {isCompleted && (
                            <button
                              onClick={() => router.push(`/visits/${visit.id}/summary`)}
                              className="p-1.5 hover:bg-card-hover text-secondary hover:text-cyan-400 border border-card-border rounded-lg transition-all duration-150 cursor-pointer"
                              title="Lihat & Export Laporan"
                            >
                              <IconFileExport className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

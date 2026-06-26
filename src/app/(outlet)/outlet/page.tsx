"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, apiGetVisits, apiGetChecklistItems, apiGetOutletDocumentations, Visit, ChecklistItem, OutletDocumentation } from "@/lib/mockStore";
import { IconCalendar, IconUser, IconClipboardText, IconChevronRight, IconAlertCircle, IconCheck, IconBuildingStore } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function OutletDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [outletDocumentations, setOutletDocumentations] = useState<OutletDocumentation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from API
  useEffect(() => {
    if (!mounted || !currentUser?.outletCode) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const visitsData = await apiGetVisits({ outlet_code: currentUser.outletCode });
        setVisits(visitsData);

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
        console.error("Failed to fetch outlet data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [mounted, currentUser]);

  if (!mounted || !currentUser || !currentUser.outletCode || dataLoading) {
    return (
      <div className="h-64 bg-card rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter visits for this specific outlet
  const outletVisits = visits.filter(v => v.outlet_code === currentUser.outletCode);

  // Compute stats: how many visits need perbaikan action
  const pendingActionVisitsCount = outletVisits.filter(v => {
    if (v.status !== "completed") return false;
    
    // Check if visit has any X findings
    const visitItems = checklistItems.filter(i => i.visit_id === v.id);
    const hasX = visitItems.some(i => i.hasil_temuan === "X");
    if (!hasX) return false;

    // Check if any of those findings are not 'selesai'
    const xItemIds = visitItems.filter(i => i.hasil_temuan === "X").map(i => i.id);
    const docs = outletDocumentations.filter(d => xItemIds.includes(d.checklist_item_id));
    const allDone = docs.length > 0 && docs.every(d => d.status === "selesai");
    
    return !allDone;
  }).length;

  return (
    <div className="space-y-8 text-foreground">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-card-border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <IconBuildingStore className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Selamat Datang, Beauty {currentUser.outletCode}
              </h1>
            </div>
            <p className="text-muted text-sm max-w-[60ch] leading-relaxed">
              Gunakan portal ini untuk menindaklanjuti rencana perbaikan dari temuan hasil kunjungan Supervisor (SPV).
            </p>
          </div>

          <div className="shrink-0">
            {pendingActionVisitsCount > 0 ? (
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-450 text-xs font-semibold shadow-inner max-w-sm">
                <IconAlertCircle className="w-5 h-5 shrink-0 animate-bounce" />
                <div className="space-y-0.5">
                  <span className="block font-extrabold text-amber-350">Perlu Tindakan</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Terdapat {pendingActionVisitsCount} laporan kunjungan yang memerlukan perbaikan.</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-450 text-xs font-semibold shadow-inner max-w-sm">
                <IconCheck className="w-5 h-5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="block font-extrabold text-emerald-400">Semua Selesai</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Semua temuan outlet Anda telah berhasil diselesaikan.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Visits List section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border pb-3">
          <IconClipboardText className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold text-secondary uppercase tracking-wider">
            Daftar Kunjungan Home Visit
          </h3>
        </div>

        {outletVisits.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-12 text-center text-muted space-y-2">
            <IconClipboardText className="w-12 h-12 mx-auto text-muted animate-pulse" />
            <p className="font-semibold text-sm">Belum Ada Kunjungan Terdaftar</p>
            <p className="text-xs">
              Supervisor belum menginput riwayat kunjungan ke outlet Anda.
            </p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-1 gap-4.5"
          >
            {outletVisits.map((visit) => {
              const isCompleted = visit.status === "completed";
              const visitItems = checklistItems.filter(i => i.visit_id === visit.id);
              const hasX = visitItems.some(i => i.hasil_temuan === "X");
              
              let repairStatus: "belum" | "proses" | "selesai" = "selesai";
              let xCount = 0;
              let resolvedCount = 0;

              if (hasX) {
                const xItems = visitItems.filter(i => i.hasil_temuan === "X");
                xCount = xItems.length;
                const xItemIds = xItems.map(i => i.id);
                const docs = outletDocumentations.filter(d => xItemIds.includes(d.checklist_item_id));
                
                resolvedCount = docs.filter(d => d.status === "selesai").length;
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

              const hasUnresolved = hasX && (xCount > resolvedCount);

              const cardVariant = {
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
              };

              return (
                <motion.div
                  variants={cardVariant}
                  key={visit.id}
                  onClick={() => {
                    if (isCompleted) {
                      router.push(`/outlet/${visit.id}`);
                    }
                  }}
                  className={`relative bg-card border rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 group overflow-hidden ${
                    isCompleted
                      ? "border-card-border hover:border-emerald-500/30 hover:shadow-lg cursor-pointer active:scale-[0.995]"
                      : "border-card-border/60 opacity-60 border-dashed cursor-not-allowed"
                  }`}
                >
                  {/* Premium left accent indicator strip */}
                  {isCompleted && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-200 ${
                        !hasX || !hasUnresolved
                          ? "bg-emerald-500" 
                          : "bg-rose-500"
                      }`} 
                    />
                  )}

                  <div className="space-y-3 pl-1.5 sm:pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-muted bg-card-darker px-2.5 py-1 rounded-lg border border-card-border">
                        HV/{visit.visit_date.replace(/-/g, "")}
                      </span>
                      
                      {/* Visit status */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide border ${
                          isCompleted
                             ? "bg-emerald-500/10 text-emerald-455 border-emerald-500/20"
                             : "bg-slate-500/10 text-muted border-card-border"
                        }`}
                      >
                        {isCompleted ? "Checklist Selesai" : "Menunggu SPV (Draft)"}
                      </span>

                      {/* Repair Status Badge */}
                      {isCompleted && hasX && (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide border ${
                            repairStatus === "selesai"
                              ? "bg-emerald-500/10 text-emerald-455 border-emerald-500/20"
                              : repairStatus === "proses"
                              ? "bg-amber-500/10 text-amber-455 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-455 border-rose-500/20"
                          }`}
                        >
                          Perbaikan: {repairStatus === "selesai" ? "Selesai" : repairStatus === "proses" ? "Proses" : "Belum Mulai"}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-foreground group-hover:text-emerald-450 transition-colors duration-150">
                      Kunjungan Tanggal {new Date(visit.visit_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </h4>

                    <div className="flex flex-wrap gap-4 items-center text-xs text-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <IconUser className="w-3.5 h-3.5 text-muted shrink-0" />
                        SPV Pemeriksa: <strong className="text-secondary font-semibold">{visit.spv_code}</strong>
                      </span>
                      {isCompleted && hasX && (
                        <span 
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors duration-150 ${
                            hasUnresolved 
                              ? "text-rose-455 bg-rose-500/5 border-rose-500/15" 
                              : "text-emerald-455 bg-emerald-500/5 border-emerald-500/15"
                          }`}
                        >
                          {hasUnresolved ? (
                            <>
                              <IconAlertCircle className="w-3.5 h-3.5 text-rose-450 shrink-0" />
                              {xCount - resolvedCount} dari {xCount} temuan tersisa
                            </>
                          ) : (
                            <>
                              <IconCheck className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
                              Semua temuan perbaikan selesai
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-card-darker border border-card-border text-muted group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all duration-200 shrink-0 self-start sm:self-center">
                      <IconChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted italic font-medium shrink-0 self-start sm:self-center pr-3">
                      Menunggu SPV
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

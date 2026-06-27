"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Visit,
  ChecklistItem,
  OutletDocumentation,
  apiGetVisit,
  apiGetChecklistItems,
  apiGetOutletDocumentations,
  apiSaveOutletDocumentation,
  apiUploadPhoto,
} from "@/lib/mockStore";
import { IconArrowLeft, IconCalendar, IconUser, IconClipboardCheck, IconDeviceFloppy, IconPhotoPlus, IconTrash, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OutletVisitDetailsPage() {
  const router = useRouter();
  const { visitId } = useParams();
  const [mounted, setMounted] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [outletDocumentations, setOutletDocumentations] = useState<OutletDocumentation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [itemSuccessMsg, setItemSuccessMsg] = useState<Record<string, boolean>>({});
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [submittingItem, setSubmittingItem] = useState<string | null>(null);
  const [saveAllLoading, setSaveAllLoading] = useState(false);

  // Local state to manage form fields per item
  const [formStates, setFormStates] = useState<
    Record<
      string,
      {
        fotoUrls: string[];
        status: "belum" | "proses" | "selesai";
      }
    >
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from API
  useEffect(() => {
    if (!mounted || !visitId) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const visitData = await apiGetVisit(visitId as string);
        setVisit(visitData);
        if (visitData) {
          const items = await apiGetChecklistItems(visitData.id);
          setChecklistItems(items);
          const docs = await apiGetOutletDocumentations(visitData.id);
          setOutletDocumentations(docs);
        }
      } catch (err) {
        console.error("Failed to fetch visit data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [mounted, visitId]);

  // Initialize local states when data loads
  useEffect(() => {
    if (visit && !dataLoading) {
      const items = checklistItems.filter((i) => i.visit_id === visit.id && i.hasil_temuan === "X");
      const initialStates: typeof formStates = {};
      
      items.forEach((item) => {
        const doc = outletDocumentations.find((d) => d.checklist_item_id === item.id);
        initialStates[item.id] = {
          fotoUrls: doc?.foto_urls || [],
          status: doc?.status || "belum",
        };
      });
      setFormStates(initialStates);
    }
  }, [visit, checklistItems, outletDocumentations, dataLoading]);

  if (!mounted || dataLoading || !visit) {
    return (
      <div className="h-64 bg-card rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter checklist items requiring action (temuan X)
  const itemsToFix = checklistItems.filter((i) => i.visit_id === visit.id && i.hasil_temuan === "X");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0 || uploadingItem) return;

    const currentPhotos = formStates[itemId]?.fotoUrls || [];
    if (currentPhotos.length >= 3) {
      alert("Maksimal 3 foto per item");
      return;
    }

    const availableSlots = 3 - currentPhotos.length;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    setUploadingItem(itemId);

    try {
      for (const file of filesToUpload) {
        const result = await apiUploadPhoto(file, `visit-${visit.id}`);
        if (result.url) {
          setFormStates((prev) => {
            const itemPhotos = prev[itemId]?.fotoUrls || [];
            if (itemPhotos.length >= 3) return prev;
            return {
              ...prev,
              [itemId]: {
                ...prev[itemId],
                fotoUrls: [...itemPhotos, result.url!],
                status: "selesai",
              },
            };
          });
        } else {
          alert(result.error || "Gagal mengupload foto");
        }
      }
    } finally {
      setUploadingItem(null);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (itemId: string, photoIdx: number) => {
    setFormStates((prev) => {
      const current = prev[itemId]?.fotoUrls || [];
      const updatedPhotos = current.filter((_, idx) => idx !== photoIdx);
      const newStatus = updatedPhotos.length > 0 ? "selesai" : "belum";
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          fotoUrls: updatedPhotos,
          status: newStatus,
        },
      };
    });
  };

  const handleSubmitItem = async (itemId: string) => {
    if (submittingItem) return;

    const state = formStates[itemId];
    if (!state) return;

    setSubmittingItem(itemId);
    try {
      // Save specific item to Supabase
      const success = await apiSaveOutletDocumentation(itemId, "", state.fotoUrls, state.status);

      if (success) {
        // Refresh docs so UI (isSubmitted, status) reflects saved state immediately
        if (visit) {
          const refreshedDocs = await apiGetOutletDocumentations(visit.id);
          setOutletDocumentations(refreshedDocs);
        }

        // Show inline success message
        setItemSuccessMsg((prev) => ({ ...prev, [itemId]: true }));
        setTimeout(() => {
          setItemSuccessMsg((prev) => ({ ...prev, [itemId]: false }));
        }, 3000);
      }
    } finally {
      setSubmittingItem(null);
    }
  };

  const handleSave = async () => {
    if (saveAllLoading) return;

    setSaveAllLoading(true);
    try {
      // Save each item state to Supabase
      await Promise.all(
        Object.entries(formStates).map(([itemId, state]) =>
          apiSaveOutletDocumentation(itemId, "", state.fotoUrls, state.status)
        )
      );

      setSuccessMsg("Laporan tindak lanjut berhasil disimpan!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        router.push("/outlet");
      }, 1500);
    } catch (err) {
      console.error("Failed to save outlet documentation:", err);
      setSaveAllLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. BACK HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-card-border pb-5">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/outlet")}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-450 transition-colors duration-200 cursor-pointer mb-2 animate-fade-in"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Portal
          </button>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Tindak Lanjut Perbaikan
          </h1>
          <p className="text-muted text-xs font-mono">
            Kunjungan: {new Date(visit.visit_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saveAllLoading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer self-start disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saveAllLoading ? (
            <div className="w-4 h-4 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
          ) : (
            <IconDeviceFloppy className="w-4 h-4" />
          )}
          {saveAllLoading ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-450 text-xs font-semibold flex items-center gap-2"
          >
            <IconCheck className="w-5 h-5 animate-bounce" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. INSTRUCTION DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card-darker/40 border border-card-border rounded-xl p-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <IconCalendar className="w-4 h-4 text-muted" />
          <span>Tanggal Kunjungan: <strong className="text-secondary">{visit.visit_date}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <IconUser className="w-4 h-4 text-muted" />
          <span>Supervisor Pemeriksa: <strong className="text-secondary">{visit.spv_code}</strong></span>
        </div>
      </div>

      {/* 3. LIST OF ITEMS REQUIRING CORRECTION */}
      <div className="space-y-6">
        <h3 className="text-xs font-extrabold text-muted uppercase tracking-wider">
          Temuan Yang Membutuhkan Tindakan ({itemsToFix.length})
        </h3>

        {itemsToFix.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-muted text-xs">
            Tidak ada temuan yang memerlukan tindakan perbaikan dari outlet pada kunjungan ini.
          </div>
        ) : (
          itemsToFix.map((item, index) => {
            const doc = outletDocumentations.find((d) => d.checklist_item_id === item.id);
            const state = formStates[item.id] || { fotoUrls: [], status: "belum" as const };
            const isSubmitted = !!(doc && doc.status === "selesai" && JSON.stringify(doc.foto_urls) === JSON.stringify(state.fotoUrls));

            return (
              <div
                key={item.id}
                className="bg-card border border-card-border rounded-2xl p-6 space-y-4 shadow-sm"
              >
                {/* Item header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-card-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/10 uppercase tracking-wider font-semibold">
                      Temuan {index + 1} (P{item.perspective_no})
                    </span>
                    <h4 className="text-secondary text-sm font-bold mt-1.5">
                      {item.point_description}
                    </h4>
                  </div>

                  {/* Status Badge (Read-only) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                      Status:
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wide transition-colors duration-200 ${
                        state.status === "selesai"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450"
                          : state.status === "proses"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-450"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-450"
                      }`}
                    >
                      {state.status === "selesai"
                        ? "Selesai"
                        : state.status === "proses"
                        ? "Dalam Proses"
                        : "Belum Dikerjakan"}
                    </span>
                  </div>
                </div>

                {/* Plans from SPV */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card-darker/40 p-4 rounded-xl border border-card-border text-xs text-muted">
                  <div>
                    <span className="text-muted font-bold block mb-1">Rencana Perbaikan SPV:</span>
                    <p className="text-secondary italic">{item.rencana_perbaikan || "Tidak ada rincian khusus."}</p>
                  </div>
                  <div>
                    <span className="text-muted font-bold block mb-1">Tenggat Waktu (Deadline):</span>
                    <p className="text-secondary font-semibold font-mono">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted font-bold block mb-1">PIC:</span>
                    <p className="text-secondary font-semibold">{item.support_divisi || "-"}</p>
                  </div>
                </div>

                {/* Outlet Inputs */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 bg-card-darker/20 p-5 rounded-xl border border-card-border">
                  {/* Photo Uploader */}
                  <div className="space-y-3 flex-1">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                      Dokumentasi Foto Perbaikan (Maks 3)
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Photo previews */}
                      {state.fotoUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 bg-card-darker border border-card-border rounded-xl overflow-hidden shrink-0 group">
                          <img src={url} alt="Pratinjau" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(item.id, idx)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-450 transition-opacity duration-150 cursor-pointer"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Button if less than 3 */}
                      {state.fotoUrls.length < 3 && (
                        <label
                          className={`w-20 h-20 border border-dashed border-card-border rounded-xl flex flex-col items-center justify-center text-muted transition-all duration-200 ${
                            uploadingItem
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:border-emerald-500/40 hover:bg-card-hover/30 hover:text-emerald-450 cursor-pointer"
                          }`}
                        >
                          {uploadingItem === item.id ? (
                            <div className="w-5 h-5 mb-1 border-2 border-emerald-450 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <IconPhotoPlus className="w-5 h-5 mb-1" />
                          )}
                          <span className="text-[9px] font-semibold uppercase">
                            {uploadingItem === item.id ? "Proses" : "Unggah"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={uploadingItem !== null}
                            onChange={(e) => handleFileUpload(e, item.id)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Submit Button per Item */}
                  <div className="flex flex-col items-stretch sm:items-end justify-end gap-2 min-w-[200px] self-stretch md:self-end">
                    <AnimatePresence>
                      {itemSuccessMsg[item.id] && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[11px] font-semibold text-emerald-450 text-center sm:text-right"
                        >
                          Bukti berhasil dikirim!
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {isSubmitted ? (
                      <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-bold rounded-xl self-end">
                        <IconCheck className="w-4 h-4 animate-bounce" />
                        Sudah Dikirim
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmitItem(item.id)}
                        disabled={state.fotoUrls.length === 0 || submittingItem !== null}
                        className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all duration-200 self-end ${
                          state.fotoUrls.length > 0 && submittingItem === null
                            ? "bg-emerald-500 hover:bg-emerald-600 text-[#022c22] shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer"
                            : "bg-muted/15 border border-card-border text-muted cursor-not-allowed"
                        }`}
                      >
                        {submittingItem === item.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <IconDeviceFloppy className="w-4 h-4" />
                        )}
                        {submittingItem === item.id ? "Mengirim..." : "Kirim Bukti Perbaikan"}
                      </button>
                    )}
                    
                    {state.fotoUrls.length === 0 && (
                      <span className="text-[10px] text-muted italic text-center sm:text-right block w-full">
                        * Unggah minimal 1 foto untuk kirim
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

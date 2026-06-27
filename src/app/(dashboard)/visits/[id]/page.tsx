"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChecklistItem,
  OpsKendala,
  OutletDocumentation,
  Visit,
  apiGetVisit,
  apiGetChecklistItems,
  apiGetOutletDocumentations,
  apiUpdateChecklistItem,
  apiAddPerspective5Item,
  apiRemovePerspective5Item,
  apiUpdateOpsKendala,
  apiSubmitVisit,
} from "@/lib/mockStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconDeviceFloppy,
  IconSend,
  IconExclamationCircle,
  IconChevronRight,
  IconChevronLeft
} from "@tabler/icons-react";

export default function VisitChecklistPage() {
  const router = useRouter();
  const { id } = useParams();


  const [mounted, setMounted] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [opsKendalas, setOpsKendalas] = useState<OpsKendala[]>([]);
  const [outletDocumentations, setOutletDocumentations] = useState<OutletDocumentation[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [addP5Loading, setAddP5Loading] = useState(false);
  const [saveOpsLoading, setSaveOpsLoading] = useState(false);
  const [removingP5Item, setRemovingP5Item] = useState<string | null>(null);
  const [updatingChecklistKey, setUpdatingChecklistKey] = useState<string | null>(null);
  
  // Ops Modal state
  const [opsModalOpen, setOpsModalOpen] = useState(false);
  const [tempOpsProduk, setTempOpsProduk] = useState("");
  const [tempOpsFasilitas, setTempOpsFasilitas] = useState("");
  const [tempOpsSdm, setTempOpsSdm] = useState("");

  const [p5InputText, setP5InputText] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch data from API
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

          // Fetch ops kendala data
          const res = await fetch(`/api/ops-kendala?visit_id=${visitData.id}`);
          if (res.ok) {
            const data = await res.json();
            setOpsKendalas(data.kendalas || []);
          }

          // Fetch outlet documentations
          const docs = await apiGetOutletDocumentations(visitData.id);
          setOutletDocumentations(docs);
          
          // Initialize OPS modal inputs
          const p6Items = items.filter((i: ChecklistItem) => i.perspective_no === 6);
          p6Items.forEach((item: ChecklistItem) => {
            // We'll set these from ops_kendala data if available
            if (String(item.point_no) === "1") setTempOpsProduk("");
            if (String(item.point_no) === "2") setTempOpsFasilitas("");
            if (String(item.point_no) === "3") setTempOpsSdm("");
          });
        }
      } catch (err) {
        console.error("Failed to fetch visit data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Update OPS temp fields when opsKendalas change
  useEffect(() => {
    if (opsKendalas.length > 0) {
      opsKendalas.forEach((ok) => {
        if (ok.sub_item === "produk") setTempOpsProduk(ok.uraian_temuan);
        if (ok.sub_item === "fasilitas") setTempOpsFasilitas(ok.uraian_temuan);
        if (ok.sub_item === "sdm") setTempOpsSdm(ok.uraian_temuan);
      });
    }
  }, [opsKendalas]);

  if (!mounted || dataLoading || !visit) {
    return (
      <div className="h-64 bg-[#0f172a] border border-[#1e293b] rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCompleted = visit.status === "completed";

  // Filter checklist items for this visit and group by perspective
  const visitItems = checklistItems.filter((item) => item.visit_id === visit.id);

  // Group items by perspective
  const p1Items = visitItems.filter((i) => i.perspective_no === 1);
  const p2Items = visitItems.filter((i) => i.perspective_no === 2);
  const p3Items = visitItems.filter((i) => i.perspective_no === 3);
  const p4Items = visitItems.filter((i) => i.perspective_no === 4);
  const p5Items = visitItems.filter((i) => i.perspective_no === 5);
  const p6Items = visitItems.filter((i) => i.perspective_no === 6);

  const getTabItems = (tabNum: number) => {
    switch (tabNum) {
      case 1: return p1Items;
      case 2: return p2Items;
      case 3: return p3Items;
      case 4: return p4Items;
      case 5: return p5Items;
      case 6: return p6Items;
      default: return [];
    }
  };

  const handleAddP5 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p5InputText.trim() || addP5Loading) return;

    setAddP5Loading(true);
    try {
      const newItem = await apiAddPerspective5Item(visit.id, p5InputText.trim());
      if (newItem) {
        setChecklistItems(prev => [...prev, newItem]);
        showToast("Temuan baru berhasil ditambahkan!");
      }
      setP5InputText("");
    } finally {
      setAddP5Loading(false);
    }
  };

  const handleSaveOpsModal = async () => {
    if (saveOpsLoading) return;

    setSaveOpsLoading(true);
    try {
      await apiUpdateOpsKendala(visit.id, "produk", tempOpsProduk);
      await apiUpdateOpsKendala(visit.id, "fasilitas", tempOpsFasilitas);
      await apiUpdateOpsKendala(visit.id, "sdm", tempOpsSdm);
      // Re-fetch items & ops kendala to get updated state
      const items = await apiGetChecklistItems(visit.id);
      setChecklistItems(items);
      const res = await fetch(`/api/ops-kendala?visit_id=${visit.id}`);
      if (res.ok) {
        const data = await res.json();
        setOpsKendalas(data.kendalas || []);
      }
      showToast("Kendala OPS berhasil disimpan!");
      setOpsModalOpen(false);
    } finally {
      setSaveOpsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    router.push("/dashboard");
  };

  const handleSubmitVisit = async () => {
    if (submitLoading) return;

    setValidationErrors([]);
    const errors: string[] = [];

    // Business Rules Verification:
    // 1. All pre-defined items (P1-P4) must have hasil_temuan selected (V, X, or N/A)
    const p1ToP4 = visitItems.filter((i) => i.perspective_no >= 1 && i.perspective_no <= 4);
    p1ToP4.forEach((item) => {
      if (item.hasil_temuan === null) {
        errors.push(
          `Perspektif ${item.perspective_no} - Point ${item.point_no}: Hasil temuan (√ / X) wajib diisi`
        );
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to error banner
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Submit report
    setSubmitLoading(true);
    try {
      await apiSubmitVisit(visit.id);
      router.push(`/visits/${visit.id}/summary`);
    } catch (err) {
      console.error("Failed to submit visit:", err);
      setSubmitLoading(false);
    }
  };

  const currentTabItems = getTabItems(activeTab);

  return (
    <div className="space-y-6 relative text-foreground">
      {/* 1. BACK HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-card-border pb-5">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400 transition-colors duration-200 cursor-pointer mb-2"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Checklist Home Visit: {visit.outlet_name}
          </h1>
          <p className="text-muted text-xs font-mono">
            Tanggal: {new Date(visit.visit_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Action buttons (only in draft mode) */}
        {!isCompleted && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-card hover:bg-card-hover text-secondary hover:text-foreground font-semibold text-xs border border-card-border rounded-xl transition-all duration-200 cursor-pointer"
            >
              <IconDeviceFloppy className="w-4 h-4" />
              Simpan Draft
            </button>
            <button
              onClick={handleSubmitVisit}
              disabled={submitLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <div className="w-4 h-4 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconSend className="w-4 h-4" />
              )}
              {submitLoading ? "Memproses..." : "Selesai & Submit"}
            </button>
          </div>
        )}
      </div>

      {/* 2. VALIDATION ERROR BANNER */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 space-y-2 text-xs"
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <IconExclamationCircle className="w-5 h-5 shrink-0" />
            <span>Formulir Belum Lengkap ({validationErrors.length} kesalahan):</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {validationErrors.length > 5 && (
              <li className="font-semibold text-muted">
                ...dan {validationErrors.length - 5} kesalahan lainnya. Harap cek kembali checklist Anda.
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {/* 3. PERSPECTIVES TABS NAV */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-card-border">
        {[
          { no: 1, label: "P1: Pelayanan Staff" },
          { no: 2, label: "P2: Kasir" },
          { no: 3, label: "P3: Kebersihan Outlet" },
          { no: 4, label: "P4: Administrasi" },
          { no: 5, label: "P5: Temuan Lain" },
          { no: 6, label: "P6: Kendala OPS" },
        ].map((tab) => (
          <button
            key={tab.no}
            onClick={() => setActiveTab(tab.no)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeTab === tab.no
                ? "bg-card-hover text-emerald-400 border-card-border shadow-md"
                : "text-muted hover:text-foreground border-transparent hover:bg-card-hover/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. CURRENT TAB CONTENT */}
      <div className="space-y-4">
        {/* Tab 5 header (special input for SPV) */}
        {activeTab === 5 && !isCompleted && (
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <form onSubmit={handleAddP5} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={p5InputText}
                onChange={(e) => setP5InputText(e.target.value)}
                placeholder="Tulis deskripsi temuan baru di sini..."
                className="flex-1 bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl px-4 py-2.5 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={addP5Loading || !p5InputText.trim()}
                className="flex items-center justify-center gap-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addP5Loading ? (
                  <div className="w-4 h-4 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IconPlus className="w-4 h-4" />
                )}
                {addP5Loading ? "Menambahkan..." : "Tambah Temuan"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 6 header (special trigger for OPS modal) */}
        {activeTab === 6 && (
          <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-bold text-foreground text-sm">Logika Kendala OPS</h4>
              <p className="text-muted text-xs mt-1">
                Isi rincian kendala operasional outlet untuk Produk, Fasilitas, atau SDM.
              </p>
            </div>
            {!isCompleted && (
              <button
                onClick={() => setOpsModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-semibold text-xs rounded-xl cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                Isi Kendala OPS
              </button>
            )}
          </div>
        )}

        {/* List of items */}
        <div className="space-y-4">
          {currentTabItems.length === 0 ? (
            <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-muted text-xs space-y-1">
              <IconAlertCircle className="w-8 h-8 mx-auto text-muted" />
              <p className="font-semibold">Belum Ada Temuan</p>
              {activeTab === 5 && <p>Gunakan form di atas untuk menambahkan temuan eksternal baru.</p>}
            </div>
          ) : (
            currentTabItems.map((item, idx) => {
              const opsRec = opsKendalas.find((o) => o.checklist_item_id === item.id);
              const hasDoc = outletDocumentations.find((d) => d.checklist_item_id === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-card border border-card-border rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  {/* Point Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                          Butir {item.point_no}
                        </span>
                        {activeTab === 5 && !isCompleted && (
                          <button
                            disabled={removingP5Item === item.id}
                            onClick={async () => {
                              if (removingP5Item) return;

                              setRemovingP5Item(item.id);
                              try {
                                await apiRemovePerspective5Item(item.id);
                                setChecklistItems(prev => prev.filter(i => i.id !== item.id));
                                showToast("Temuan berhasil dihapus!");
                              } finally {
                                setRemovingP5Item(null);
                              }
                            }}
                            className="p-1 text-muted hover:text-rose-400 hover:bg-card-hover rounded transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {removingP5Item === item.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <IconTrash className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <h4 className="text-foreground text-sm font-semibold leading-relaxed">
                        {item.point_description}
                      </h4>
                      {/* Show OPS modal summary description if active */}
                      {activeTab === 6 && opsRec && (
                        <div className="bg-card-darker/60 border border-card-border rounded-xl p-3 text-xs mt-2">
                          <span className="text-muted font-bold block mb-1">Temuan SPV:</span>
                          <p className="text-secondary italic">{opsRec.uraian_temuan}</p>
                        </div>
                      )}
                    </div>

                    {/* Radio Group for V / X / NA (only active for P1-P4, P5 & P6 are automatically X when active) */}
                    {activeTab <= 4 && (
                      <div className="flex items-center gap-2 bg-card-darker p-1 rounded-xl border border-card-border self-start">
                        {[
                          { val: "V", label: "Sesuai", icon: IconCheck, color: "text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/5", activeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                          { val: "X", label: "Temuan", icon: IconX, color: "text-rose-400 border-rose-500/10 hover:bg-rose-500/5", activeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
                        ].map((btn) => {
                          const Icon = btn.icon;
                          const isSelected = item.hasil_temuan === btn.val;
                          const loadingKey = `${item.id}:${btn.val}`;
                          const isUpdating = updatingChecklistKey === loadingKey;
                          return (
                            <button
                              key={btn.val}
                              type="button"
                              disabled={isCompleted || updatingChecklistKey !== null}
                              onClick={async () => {
                                if (updatingChecklistKey) return;

                                setUpdatingChecklistKey(loadingKey);
                                try {
                                  const updated = await apiUpdateChecklistItem(item.id, {
                                    hasil_temuan: btn.val as "V" | "X",
                                  });
                                  if (updated) {
                                    setChecklistItems(prev => prev.map(i => i.id === item.id ? updated : i));
                                    showToast(`Butir ${item.point_no}: ${btn.label}`);
                                  }
                                } finally {
                                  setUpdatingChecklistKey(null);
                                }
                              }}
                              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                isSelected ? btn.activeColor : `bg-transparent border-transparent ${btn.color}`
                              }`}
                              title={btn.label}
                            >
                              {isUpdating ? (
                                <div className="w-4.5 h-4.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                Icon && <Icon className="w-4.5 h-4.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Expandable Section if marked X (Temuan) */}
                  <AnimatePresence>
                    {item.hasil_temuan === "X" && isCompleted && hasDoc && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-card-border pt-4"
                      >
                        {/* Outlet Feedback Status Display if exists */}
                        <div className="p-4 bg-card-darker/60 border border-card-border rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-muted">Dokumentasi Tindak Lanjut Toko:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                hasDoc.status === "selesai"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : hasDoc.status === "proses"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              }`}
                            >
                              {hasDoc.status === "selesai" ? "Selesai" : hasDoc.status === "proses" ? "Dalam Proses" : "Belum Dikerjakan"}
                            </span>
                          </div>
                          <p className="text-secondary italic">
                            {hasDoc.catatan || "Belum ada deskripsi catatan perbaikan."}
                          </p>
                          {hasDoc.foto_urls.length > 0 && (
                            <div className="flex gap-2 pt-1.5">
                              {hasDoc.foto_urls.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Foto perbaikan ${i + 1}`}
                                  className="w-16 h-12 object-cover rounded-lg border border-card-border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Tab Navigation Buttons (Sebelumnya / Selanjutnya) */}
        <div className="flex items-center justify-between border-t border-card-border pt-6 mt-8">
          {activeTab > 1 ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab((prev) => prev - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-card hover:bg-card-hover text-secondary hover:text-foreground font-semibold text-xs border border-card-border rounded-xl transition-all duration-200 cursor-pointer"
            >
              <IconChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
          ) : (
            <div />
          )}

          {activeTab < 6 ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
            >
              Selanjutnya
              <IconChevronRight className="w-4 h-4" />
            </button>
          ) : (
            !isCompleted && (
              <button
                type="button"
                onClick={handleSubmitVisit}
                disabled={submitLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <div className="w-4 h-4 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IconSend className="w-4 h-4" />
                )}
                {submitLoading ? "Memproses..." : "Selesai & Submit"}
              </button>
            )
          )}
        </div>
      </div>

      {/* 5. OPS KENDALA MODAL DIALOG */}
      <AnimatePresence>
        {opsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card border border-card-border w-full max-w-lg shadow-2xl relative z-10 overflow-hidden rounded-2xl"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-card-border">
                <h3 className="text-base font-bold text-foreground">Uraian Kendala OPS</h3>
                <p className="text-muted text-xs mt-1">
                  Masukkan uraian temuan untuk kendala-kendala berikut (kosongkan jika tidak ada kendala).
                </p>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* 1. Produk */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    1. Produk / Ketersediaan Barang
                  </label>
                  <textarea
                    value={tempOpsProduk}
                    onChange={(e) => setTempOpsProduk(e.target.value)}
                    placeholder="Contoh: Stok moisturizer habis selama 3 hari terakhir..."
                    className="w-full h-20 bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl px-3 py-2 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* 2. Fasilitas */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    2. Fasilitas
                  </label>
                  <textarea
                    value={tempOpsFasilitas}
                    onChange={(e) => setTempOpsFasilitas(e.target.value)}
                    placeholder="Contoh: AC area penjualan mati, air radiator bocor..."
                    className="w-full h-20 bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl px-3 py-2 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* 3. SDM */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                    3. SDM / Karyawan
                  </label>
                  <textarea
                    value={tempOpsSdm}
                    onChange={(e) => setTempOpsSdm(e.target.value)}
                    placeholder="Contoh: Kurang 1 staff advisor shift pagi, keterlambatan kehadiran..."
                    className="w-full h-20 bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl px-3 py-2 text-secondary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4.5 bg-card-darker/40 border-t border-card-border flex items-center justify-end gap-3">
                <button
                  onClick={() => setOpsModalOpen(false)}
                  disabled={saveOpsLoading}
                  className="px-4 py-2 border border-card-border hover:bg-card-hover text-secondary font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveOpsModal}
                  disabled={saveOpsLoading}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveOpsLoading && (
                    <div className="w-4 h-4 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
                  )}
                  {saveOpsLoading ? "Menyimpan..." : "Simpan Temuan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-emerald-500 text-[#022c22] font-semibold text-xs rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-400/20"
          >
            <IconCheck className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

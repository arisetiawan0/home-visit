"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, apiCreateVisit } from "@/lib/mockStore";
import { motion } from "framer-motion";
import { IconBuildingStore, IconCalendar, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import CustomSelect from "@/components/CustomSelect";

export default function NewVisitPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("01");
  const [visitDate, setVisitDate] = useState("");
  const [loading, setLoading] = useState(false);

  const outletOptions = currentUser?.outlets?.length
    ? currentUser.outlets.map((outlet) => ({
        value: outlet.code,
        label: `${outlet.outletCode} - ${outlet.name}`,
      }))
    : Array.from({ length: 27 }, (_, i) => {
        const num = String(i + 1).padStart(2, "0");
        return { value: num, label: `Beauty ${num}` };
      });

  // Set default date to today in YYYY-MM-DD
  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().substring(0, 10);
    setVisitDate(today);
  }, []);

  useEffect(() => {
    if (currentUser?.outlets?.length) {
      setSelectedOutlet(currentUser.outlets[0].code);
    }
  }, [currentUser]);

  if (!mounted || !currentUser) {
    return (
      <div className="h-64 bg-card rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call create visit API
      const result = await apiCreateVisit(
        selectedOutlet,
        visitDate,
        currentUser.code
      );
      
      if (result.visit) {
        // Redirect to checklist form
        router.push(`/visits/${result.visit.id}`);
      } else {
        console.error(result.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400 transition-colors duration-200 cursor-pointer no-print"
      >
        <IconArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Dashboard
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Buat Kunjungan Baru
        </h1>
        <p className="text-muted text-sm mt-1">
          Pilih outlet sesuai area dan tanggal untuk memulai pengisian checklist penilaian.
        </p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border border-card-border rounded-2xl p-6 md:p-8 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Outlet Selection */}
          <div className="space-y-2">
            <label
              htmlFor="newVisitOutlet"
              className="block text-xs font-semibold text-muted uppercase tracking-wider"
            >
              Outlet Yang Dikunjungi
            </label>
            <CustomSelect
              options={outletOptions}
              value={selectedOutlet}
              onChange={setSelectedOutlet}
              icon={<IconBuildingStore className="w-4.5 h-4.5" />}
              placeholder="Pilih Outlet"
            />
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label
              htmlFor="newVisitDate"
              className="block text-xs font-semibold text-muted uppercase tracking-wider"
            >
              Tanggal Kunjungan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <IconCalendar className="w-4 h-4" />
              </div>
              <input
                id="newVisitDate"
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-secondary text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Metadata Display */}
          <div className="p-4 bg-card-darker/40 border border-card-border rounded-xl text-xs text-muted space-y-2">
            <div className="flex justify-between">
              <span>Divisi Terkait:</span>
              <span className="font-semibold text-foreground">OPS (Operations)</span>
            </div>
            <div className="flex justify-between">
              <span>Petugas SPV:</span>
              <span className="font-semibold text-foreground">{currentUser.label}</span>
            </div>
            {currentUser.areaLabel && (
              <div className="flex justify-between">
                <span>Area:</span>
                <span className="font-semibold text-foreground">{currentUser.areaLabel}</span>
              </div>
            )}
            {currentUser.nik && (
              <div className="flex justify-between">
                <span>NIK:</span>
                <span className="font-mono text-foreground font-semibold">{currentUser.nik}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Kode SPV:</span>
              <span className="font-mono text-foreground font-semibold">{currentUser.code}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#022c22] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <IconPlus className="w-4 h-4" />
                Mulai Kunjungan
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, apiLogin } from "@/lib/mockStore";
import { motion } from "framer-motion";
import { IconBuildingStore, IconUserShield, IconChevronRight, IconAlertCircle, IconSun, IconMoon } from "@tabler/icons-react";
import CustomSelect from "@/components/CustomSelect";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, theme, toggleTheme, setCurrentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"spv" | "outlet">("spv");
  const [code, setCode] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("01");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const outletOptions = Array.from({ length: 27 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return { value: num, label: `Beauty ${num}` };
  });

  // Sync theme
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  // Handle Hydration
  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      if (currentUser.role === "spv") {
        router.replace("/dashboard");
      } else {
        router.replace("/outlet");
      }
    }
  }, [currentUser, router]);

  // Synchronize code input for outlet when dropdown selection changes
  useEffect(() => {
    if (role === "outlet") {
      setCode(selectedOutlet);
    } else {
      setCode("");
    }
    setError("");
  }, [role, selectedOutlet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const codeToVerify = role === "outlet" ? selectedOutlet : code.trim();
    if (!codeToVerify) {
      setError("Kode login tidak boleh kosong");
      setLoading(false);
      return;
    }

    const result = await apiLogin(role, codeToVerify);
    setLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      if (role === "spv") {
        router.push("/dashboard");
      } else {
        router.push("/outlet");
      }
    } else {
      setError(
        result.error ||
          (role === "spv"
            ? "NIK / Kode SPV tidak valid"
            : "Nomor outlet tidak valid")
      );
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-card-hover text-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg"
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === "dark" ? <IconSun className="w-5 h-5 text-amber-400" /> : <IconMoon className="w-5 h-5 text-indigo-400" />}
        </button>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono tracking-wider uppercase mb-3"
          >
            Beauty Kendari
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Home Visit Portal
          </h1>
          <p className="text-muted text-sm mt-2">
            Masuk untuk mengisi checklist dan rencana perbaikan
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-md relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Pilih Hak Akses
              </label>
              <div className="grid grid-cols-2 gap-3 bg-card-darker p-1 rounded-xl border border-card-border">
                <button
                  type="button"
                  onClick={() => setRole("spv")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    role === "spv"
                      ? "bg-card-hover text-emerald-400 shadow-md border border-card-border"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <IconUserShield className="w-4 h-4" />
                  Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => setRole("outlet")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    role === "outlet"
                      ? "bg-card-hover text-emerald-400 shadow-md border border-card-border"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <IconBuildingStore className="w-4 h-4" />
                  Outlet
                </button>
              </div>
            </div>

            {/* Conditionally Render Inputs */}
            {role === "spv" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label
                  htmlFor="spvCode"
                  className="block text-xs font-semibold text-muted uppercase tracking-wider"
                >
                  Masukkan NIK / Kode SPV
                </label>
                <input
                  id="spvCode"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Masukkan NIK (contoh: 20120100051)"
                  className="w-full bg-card-darker border border-card-border focus:border-emerald-500 rounded-xl px-4 py-3 text-secondary text-sm placeholder-muted focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  autoComplete="off"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="outletSelect"
                    className="block text-xs font-semibold text-muted uppercase tracking-wider"
                  >
                    Pilih Nomor Outlet
                  </label>
                  <CustomSelect
                    options={outletOptions}
                    value={selectedOutlet}
                    onChange={setSelectedOutlet}
                    icon={<IconBuildingStore className="w-4.5 h-4.5" />}
                    placeholder="Pilih Nomor Outlet"
                  />
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs"
              >
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#022c22] font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
              <IconChevronRight className="w-4 h-4" />
            </motion.button>
          </form>
        </div>

        {/* Info kode login */}
        <div className="mt-6 text-center text-xs text-muted bg-card/40 border border-card-border rounded-xl p-3">
          <span className="font-semibold text-muted">Info Login SPV:</span>
          <br />
          <span className="text-secondary">Gunakan NIK untuk login:</span>
          <br />
          <code className="text-secondary bg-card-darker px-1 py-0.5 rounded">Toni Irawan (20120100051)</code>
          <br />
          <code className="text-secondary bg-card-darker px-1 py-0.5 rounded">Zulkifli (2022070361)</code>
          <br />
          <code className="text-secondary bg-card-darker px-1 py-0.5 rounded">Choirul Amin Nurfauzi (2021120331)</code>
          <br className="mt-2" />
          <span className="text-muted">Atau gunakan kode: SPV001 / SPV002 / SPV003</span>
          {" | "}
          Outlet: Pilih nomor, misal <code className="text-secondary bg-card-darker px-1 py-0.5 rounded">05</code>
        </div>
      </motion.div>
    </main>
  );
}

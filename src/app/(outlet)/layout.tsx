"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, apiLogin } from "@/lib/mockStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBuildingStore,
  IconLogout,
  IconRefresh,
  IconUser,
  IconX,
  IconCircleDot,
  IconSun,
  IconMoon
} from "@tabler/icons-react";

export default function OutletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, logout, theme, toggleTheme, setCurrentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);

  // Sync theme
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  // Authenticate and Guard access
  useEffect(() => {
    setMounted(true);
    if (!currentUser) {
      router.replace("/");
    } else if (currentUser.role !== "outlet") {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (!mounted || !currentUser || currentUser.role !== "outlet") {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const switchRole = async (newRole: "spv" | "outlet", newCode: string) => {
    const result = await apiLogin(newRole, newCode);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    if (newRole === "spv") {
      router.push("/dashboard");
    } else {
      router.push("/outlet");
    }
  };

  return (
    <div data-theme={theme} className="min-h-dvh flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-card-border bg-card sticky top-0 z-30 backdrop-blur-md no-print transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <IconBuildingStore className="w-6 h-6 text-emerald-400" />
          <span className="font-extrabold text-foreground tracking-tight text-sm sm:text-base">
            Beauty Kendari | Portal Outlet
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-card-border bg-card hover:bg-card-hover text-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          >
            {theme === "dark" ? <IconSun className="w-4 h-4 text-amber-400" /> : <IconMoon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Metadata Display */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted bg-card-darker/20 dark:bg-card-darker/60 border border-card-border px-3 py-1 rounded-lg">
            <span className="flex items-center gap-1.5">
              <IconCircleDot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Outlet: {currentUser.code}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer"
          >
            <IconLogout className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto pb-24">
        {children}
      </main>

      {/* 3. FLOATING SWITCHER WIDGET FOR DEMO */}
      <div className="no-print fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {showRoleSwitcher ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-card border border-card-border rounded-2xl p-5 shadow-2xl w-80 text-xs shadow-black/50"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <IconUser className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-foreground">Prototype Demo Switcher</span>
                </div>
                <button
                  onClick={() => setShowRoleSwitcher(false)}
                  className="p-0.5 hover:bg-card-hover rounded text-muted hover:text-foreground"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-muted mb-3 leading-relaxed">
                Ganti peran dengan cepat untuk menguji alur pengisian checklist SPV dan rencana perbaikan outlet.
              </p>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchRole("spv", "SPV2024")}
                    className="py-1.5 bg-card-hover hover:bg-card-hover/80 text-emerald-400 border border-card-border rounded-lg font-medium cursor-pointer"
                  >
                    SPV2024
                  </button>
                  <button
                    onClick={() => switchRole("spv", "SPV2026")}
                    className="py-1.5 bg-card-hover hover:bg-card-hover/80 text-emerald-400 border border-card-border rounded-lg font-medium cursor-pointer"
                  >
                    SPV2026
                  </button>
                </div>

                <div className="pt-1">
                  <label className="block text-muted mb-1 font-semibold">Ganti ke Outlet:</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["01", "05", "12", "15"].map((code) => (
                      <button
                        key={code}
                        onClick={() => switchRole("outlet", code)}
                        className="py-1 bg-card-darker hover:bg-card-hover text-secondary border border-card-border rounded text-[10px] cursor-pointer"
                      >
                        B {code}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="w-full mt-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  Reset Data Demo
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRoleSwitcher(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs border border-emerald-400 shadow-emerald-500/20 cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" />
              Demo Switcher
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

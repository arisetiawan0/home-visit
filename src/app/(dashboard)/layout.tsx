"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, apiLogin } from "@/lib/mockStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLayoutDashboard,
  IconPlus,
  IconLogout,
  IconBuildingStore,
  IconMenu2,
  IconX,
  IconUser,
  IconRefresh,
  IconCircleDot,
  IconSun,
  IconMoon
} from "@tabler/icons-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, theme, toggleTheme, setCurrentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    } else if (currentUser.role !== "spv") {
      router.replace("/outlet");
    }
  }, [currentUser, router]);

  if (!mounted || !currentUser || currentUser.role !== "spv") {
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

  const navItems = [
    {
      label: "Monitoring",
      href: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      label: "Kunjungan Baru",
      href: "/visits/new",
      icon: IconPlus,
    },
  ];

  // Floating switcher actions
  const switchRole = async (newRole: "spv" | "outlet", newCode: string) => {
    const result = await apiLogin(newRole, newCode);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    setMobileMenuOpen(false);
    if (newRole === "spv") {
      router.push("/dashboard");
    } else {
      router.push("/outlet");
    }
  };

  return (
    <div data-theme={theme} className="min-h-dvh flex bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-card-border bg-card shrink-0 transition-colors duration-300">
        {/* Brand header */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-card-border">
          <IconBuildingStore className="w-6 h-6 text-emerald-400" />
          <span className="font-extrabold text-foreground tracking-tight text-lg">
            Beauty Kendari
          </span>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-card-border bg-card-darker/20 dark:bg-card-darker/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              SP
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-bold">
                Supervisor
              </p>
              <p className="text-sm font-semibold text-secondary">
                {currentUser.code}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-card-hover text-emerald-400 border border-card-border shadow-md"
                    : "text-muted hover:text-foreground hover:bg-card-hover/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-card-border space-y-1.5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover/40 transition-all duration-200 cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <IconSun className="w-5 h-5 text-amber-400" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <IconMoon className="w-5 h-5 text-indigo-400" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer"
          >
            <IconLogout className="w-5 h-5" />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* 2. MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-72 max-w-sm bg-card border-r border-card-border flex flex-col h-full z-10 transition-colors duration-300"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <IconBuildingStore className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-foreground tracking-tight">
                    Beauty Kendari
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-card-hover"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Profile */}
              <div className="p-4 border-b border-card-border bg-card-darker/20 dark:bg-card-darker/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-xs">
                    SP
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">
                      Supervisor
                    </p>
                    <p className="text-sm font-semibold text-secondary">
                      {currentUser.code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Nav */}
              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer ${
                        isActive
                          ? "bg-card-hover text-emerald-400 border border-card-border"
                          : "text-muted hover:text-foreground hover:bg-card-hover/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="p-4 border-t border-card-border space-y-1.5">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover/40 transition-all duration-200 cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <IconSun className="w-5 h-5 text-amber-400" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <IconMoon className="w-5 h-5 text-indigo-400" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/5 cursor-pointer"
                >
                  <IconLogout className="w-5 h-5" />
                  Keluar (Logout)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header / Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-card-border bg-card md:bg-transparent sticky top-0 z-30 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover"
            >
              <IconMenu2 className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-foreground md:text-lg">
              {pathname === "/dashboard"
                ? "Monitoring Kunjungan"
                : pathname === "/visits/new"
                ? "Mulai Kunjungan Baru"
                : pathname.includes("/summary")
                ? "Summary Kunjungan"
                : "Checklist Kunjungan"}
            </h2>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-card-border bg-card hover:bg-card-hover text-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <IconSun className="w-4 h-4 text-amber-400" /> : <IconMoon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Desktop header metadata */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-muted bg-card-darker/20 dark:bg-card-darker/60 border border-card-border px-3.5 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <IconCircleDot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Role: Supervisor
              </span>
              <span className="w-px h-3 bg-card-border" />
              <span>ID: {currentUser.code}</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
          {children}
        </main>
      </div>

      {/* 4. FLOATING DEMO ROLE SWITCHER (For Testing Multi-role flow easily) */}
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
                  Logout & Kembali
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

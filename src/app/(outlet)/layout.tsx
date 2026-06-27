"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/mockStore";
import {
  IconBuildingStore,
  IconLogout,
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
  const { currentUser, logout, theme, toggleTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

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
    </div>
  );
}

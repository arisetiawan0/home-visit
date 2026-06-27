"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, apiUploadPhoto, apiUpdateProfileAvatar } from "@/lib/mockStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLayoutDashboard,
  IconPlus,
  IconLogout,
  IconBuildingStore,
  IconMenu2,
  IconX,
  IconCircleDot,
  IconSun,
  IconMoon,
  IconCamera,
  IconUser
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !currentUser) return;
    setUploading(true);
    const upload = await apiUploadPhoto(selectedFile, "avatars");
    if (upload.error || !upload.url) {
      alert(upload.error || "Gagal mengunggah foto");
      setUploading(false);
      return;
    }
    const update = await apiUpdateProfileAvatar(currentUser.code, upload.url);
    if (!update.success) {
      alert(update.error || "Gagal menyimpan foto profil");
      setUploading(false);
      return;
    }
    setCurrentUser({ ...currentUser, avatar_url: upload.url });
    setPreviewUrl(null);
    setSelectedFile(null);
    setProfileModalOpen(false);
    setUploading(false);
  };

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

  return (
    <div data-theme={theme} className="min-h-dvh flex bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-card-border bg-card shrink-0 sticky top-0 h-screen overflow-y-auto transition-colors duration-300 no-print">
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
            <button
              onClick={() => setProfileModalOpen(true)}
              className="shrink-0 relative w-9 h-9 rounded-lg overflow-hidden bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm hover:opacity-80 transition-opacity cursor-pointer"
            >
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="Foto profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(currentUser.label)}</span>
              )}
            </button>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-bold">
                {currentUser.areaLabel || "Supervisor"}
              </p>
              <p className="text-sm font-semibold text-secondary">
                {currentUser.label}
              </p>
              {currentUser.nik && (
                <p className="text-[11px] text-muted font-mono">
                  NIK: {currentUser.nik}
                </p>
              )}
              {currentUser.outlets?.length ? (
                <p className="text-[11px] text-muted mt-1">
                  {currentUser.outlets.length} outlet area
                </p>
              ) : null}
            </div>
          </div>
          {currentUser.areaOutletCodes?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {currentUser.areaOutletCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 text-[10px] font-mono text-emerald-400"
                >
                  {code}
                </span>
              ))}
            </div>
          ) : null}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? "bg-card-hover text-emerald-400 border-card-border shadow-sm"
                    : "text-muted border-transparent hover:text-foreground hover:bg-card-hover/40"
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
          <div className="fixed inset-0 z-50 md:hidden flex no-print">
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
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="shrink-0 relative w-8 h-8 rounded-lg overflow-hidden bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-xs hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt="Foto profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(currentUser.label)}</span>
                    )}
                  </button>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">
                      Supervisor
                    </p>
                    <p className="text-sm font-semibold text-secondary">
                      {currentUser.label}
                    </p>
                    <p className="text-[11px] text-muted">
                      {currentUser.areaLabel || currentUser.code}
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-card-border bg-card md:bg-transparent sticky top-0 z-30 backdrop-blur-md transition-colors duration-300 no-print">
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
              <span>{currentUser.areaLabel || currentUser.code}</span>
              {currentUser.nik && (
                <>
                  <span className="w-px h-3 bg-card-border" />
                  <span>NIK: {currentUser.nik}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
          {children}
        </main>
      </div>

      
      {/* Profile Photo Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseProfileModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-sm bg-card border border-card-border rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Foto Profil</h3>
              <button
                onClick={handleCloseProfileModal}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-card-border bg-card-darker flex items-center justify-center text-3xl text-emerald-400 font-bold">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Pratinjau"
                    className="w-full h-full object-cover"
                  />
                ) : currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt="Foto profil"
                    className="w-full h-full object-cover"
                  />
                ) : currentUser ? (
                  <span>{getInitials(currentUser.label)}</span>
                ) : (
                  <IconUser className="w-10 h-10" />
                )}
              </div>

              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border bg-card-darker hover:bg-card-hover text-sm font-medium text-secondary transition-colors">
                <IconCamera className="w-4 h-4" />
                Pilih Foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {selectedFile && (
                <p className="text-xs text-muted">{selectedFile.name}</p>
              )}

              <button
                onClick={handleUploadAvatar}
                disabled={!selectedFile || uploading}
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-[#022c22] font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                {uploading ? "Mengunggah..." : "Simpan Foto"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- TYPES (re-exported for backward compatibility) ---
export interface Visit {
  id: string;
  outlet_code: string;
  outlet_name: string;
  visit_date: string;
  spv_code: string;
  divisi: string;
  status: "draft" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  visit_id: string;
  perspective_no: number;
  perspective_name: string;
  point_no: number | string;
  point_description: string;
  hasil_temuan: "V" | "X" | null;
  rencana_perbaikan: string;
  deadline: string | null;
  support_divisi: string;
}

export interface OutletDocumentation {
  id: string;
  checklist_item_id: string;
  catatan: string;
  foto_urls: string[];
  status: "belum" | "proses" | "selesai";
  updated_at: string;
}

export interface OpsKendala {
  id: string;
  checklist_item_id: string;
  sub_item: "produk" | "fasilitas" | "sdm";
  uraian_temuan: string;
}

export interface UserSession {
  role: "spv" | "outlet";
  code: string;
  outletCode?: string;
  label: string;
}

// --- APP STORE (UI state only) ---
interface AppStoreState {
  currentUser: UserSession | null;
  theme: "dark" | "light";

  // Actions
  setCurrentUser: (user: UserSession | null) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      theme: "dark",

      setCurrentUser: (user) => set({ currentUser: user }),

      logout: () => set({ currentUser: null }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "beauty-kendari-app-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        theme: state.theme,
      }),
    }
  )
);

// --- API HELPER FUNCTIONS ---
// These replace the old Zustand data actions with fetch calls to the API routes.

export async function apiLogin(
  role: "spv" | "outlet",
  code: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, code }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: "Koneksi gagal" };
  }
}

export async function apiGetVisits(params?: {
  outlet_code?: string;
  status?: string;
  month?: string;
}): Promise<Visit[]> {
  const searchParams = new URLSearchParams();
  if (params?.outlet_code) searchParams.set("outlet_code", params.outlet_code);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.month) searchParams.set("month", params.month);

  const res = await fetch(`/api/visits?${searchParams.toString()}`);
  const data = await res.json();
  return data.visits || [];
}

export async function apiGetVisit(id: string): Promise<Visit | null> {
  const res = await fetch(`/api/visits/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.visit;
}

export async function apiCreateVisit(
  outletCode: string,
  date: string,
  spvCode: string
): Promise<{ visit?: Visit; error?: string }> {
  const res = await fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outlet_code: outletCode, visit_date: date, spv_code: spvCode }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return { visit: data.visit };
}

export async function apiSubmitVisit(id: string): Promise<boolean> {
  const res = await fetch(`/api/visits/${id}`, { method: "POST" });
  return res.ok;
}

export async function apiGetChecklistItems(visitId: string): Promise<ChecklistItem[]> {
  const res = await fetch(`/api/checklist-items?visit_id=${visitId}`);
  const data = await res.json();
  return data.items || [];
}

export async function apiUpdateChecklistItem(
  itemId: string,
  fields: Partial<ChecklistItem>
): Promise<ChecklistItem | null> {
  const res = await fetch(`/api/checklist-items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.item;
}

export async function apiAddPerspective5Item(
  visitId: string,
  description: string
): Promise<ChecklistItem | null> {
  const res = await fetch("/api/checklist-items/perspective5", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visit_id: visitId, description }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.item;
}

export async function apiRemovePerspective5Item(itemId: string): Promise<boolean> {
  const res = await fetch("/api/checklist-items/perspective5", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId }),
  });
  return res.ok;
}

export async function apiUpdateOpsKendala(
  visitId: string,
  subItem: "produk" | "fasilitas" | "sdm",
  uraian: string
): Promise<boolean> {
  const res = await fetch("/api/ops-kendala", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visit_id: visitId, sub_item: subItem, uraian_temuan: uraian }),
  });
  return res.ok;
}

export async function apiGetOutletDocumentations(
  visitId: string
): Promise<OutletDocumentation[]> {
  const res = await fetch(`/api/outlet-documentation?visit_id=${visitId}`);
  const data = await res.json();
  return data.documentations || [];
}

export async function apiSaveOutletDocumentation(
  itemId: string,
  catatan: string,
  fotoUrls: string[],
  status: "belum" | "proses" | "selesai"
): Promise<boolean> {
  const res = await fetch(`/api/outlet-documentation/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ catatan, foto_urls: fotoUrls, status }),
  });
  return res.ok;
}

export async function apiUploadPhoto(
  file: File,
  folder?: string
): Promise<{ url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return { url: data.url };
}

// Master data constant (for reference in pages)
export const PERSPECTIVE_NAMES = [
  "",
  "Standar Pelayanan Advisor dan BA",
  "Standar Pelayanan Kasir",
  "Standar Kebersihan & Kenyamanan Outlet",
  "Standar Tertib Administrasi",
  "Temuan / Issue Lain",
  "Kendala OPS"
];

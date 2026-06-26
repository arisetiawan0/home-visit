// Auto-generated TypeScript types matching the Supabase schema.
// These provide type safety for all database queries.

export interface Database {
  public: {
    Tables: {
      quick_login_codes: {
        Row: {
          code: string;
          role: "spv" | "outlet";
          outlet_code: string | null;
          label: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          code: string;
          role: "spv" | "outlet";
          outlet_code?: string | null;
          label: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          role?: "spv" | "outlet";
          outlet_code?: string | null;
          label?: string;
          is_active?: boolean;
        };
      };
      visits: {
        Row: {
          id: string;
          outlet_code: string;
          outlet_name: string;
          visit_date: string;
          spv_code: string;
          divisi: string;
          status: "draft" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          outlet_code: string;
          outlet_name: string;
          visit_date: string;
          spv_code: string;
          divisi?: string;
          status?: "draft" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          outlet_code?: string;
          outlet_name?: string;
          visit_date?: string;
          spv_code?: string;
          divisi?: string;
          status?: "draft" | "completed";
          updated_at?: string;
        };
      };
      checklist_items: {
        Row: {
          id: string;
          visit_id: string;
          perspective_no: number;
          perspective_name: string;
          point_no: string;
          point_description: string;
          hasil_temuan: "V" | "X" | null;
          rencana_perbaikan: string;
          deadline: string | null;
          support_divisi: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          visit_id: string;
          perspective_no: number;
          perspective_name: string;
          point_no: string;
          point_description: string;
          hasil_temuan?: "V" | "X" | null;
          rencana_perbaikan?: string;
          deadline?: string | null;
          support_divisi?: string;
          created_at?: string;
        };
        Update: {
          visit_id?: string;
          perspective_no?: number;
          perspective_name?: string;
          point_no?: string;
          point_description?: string;
          hasil_temuan?: "V" | "X" | null;
          rencana_perbaikan?: string;
          deadline?: string | null;
          support_divisi?: string;
        };
      };
      outlet_documentation: {
        Row: {
          id: string;
          checklist_item_id: string;
          catatan: string;
          foto_urls: string[];
          status: "belum" | "proses" | "selesai";
          updated_at: string;
        };
        Insert: {
          id?: string;
          checklist_item_id: string;
          catatan?: string;
          foto_urls?: string[];
          status?: "belum" | "proses" | "selesai";
          updated_at?: string;
        };
        Update: {
          checklist_item_id?: string;
          catatan?: string;
          foto_urls?: string[];
          status?: "belum" | "proses" | "selesai";
          updated_at?: string;
        };
      };
      ops_kendala: {
        Row: {
          id: string;
          checklist_item_id: string;
          sub_item: "produk" | "fasilitas" | "sdm";
          uraian_temuan: string;
        };
        Insert: {
          id?: string;
          checklist_item_id: string;
          sub_item: "produk" | "fasilitas" | "sdm";
          uraian_temuan?: string;
        };
        Update: {
          checklist_item_id?: string;
          sub_item?: "produk" | "fasilitas" | "sdm";
          uraian_temuan?: string;
        };
      };
    };
  };
}

// Convenience type aliases
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type VisitInsert = Database["public"]["Tables"]["visits"]["Insert"];
export type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
export type ChecklistItemInsert = Database["public"]["Tables"]["checklist_items"]["Insert"];
export type ChecklistItemUpdate = Database["public"]["Tables"]["checklist_items"]["Update"];
export type OutletDocumentation = Database["public"]["Tables"]["outlet_documentation"]["Row"];
export type OutletDocumentationUpdate = Database["public"]["Tables"]["outlet_documentation"]["Update"];
export type OpsKendala = Database["public"]["Tables"]["ops_kendala"]["Row"];
export type QuickLoginCode = Database["public"]["Tables"]["quick_login_codes"]["Row"];

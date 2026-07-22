/**
 * Hand-written until the Supabase project exists and
 * `mcp__supabase__generate_typescript_types` can regenerate this file from
 * the live schema. Keep in sync with supabase/migrations/*.sql until then.
 * Shape follows what the Supabase CLI's `gen types typescript` emits, which
 * @supabase/postgrest-js's generics require (Tables/Views/Functions,
 * Relationships on every table).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string;
          role: "member" | "moderator" | "scholar" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          role?: "member" | "moderator" | "scholar" | "admin";
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          role?: "member" | "moderator" | "scholar" | "admin";
        };
        Relationships: [];
      };
      quran_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          surah_number: number;
          ayah_number: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah_number: number;
          ayah_number: number;
          note?: string | null;
        };
        Update: {
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quran_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quran_progress: {
        Row: {
          id: string;
          user_id: string;
          surah_number: number;
          last_ayah_number: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah_number: number;
          last_ayah_number: number;
        };
        Update: {
          surah_number?: number;
          last_ayah_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quran_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      hadith_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book: string;
          section_number: number;
          hadith_number: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book: string;
          section_number: number;
          hadith_number: number;
          note?: string | null;
        };
        Update: {
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      hadith_progress: {
        Row: {
          id: string;
          user_id: string;
          book: string;
          last_section_number: number;
          last_hadith_number: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book: string;
          last_section_number: number;
          last_hadith_number: number;
        };
        Update: {
          last_section_number?: number;
          last_hadith_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

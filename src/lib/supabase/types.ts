/**
 * Hand-written until the Supabase project exists and
 * `mcp__supabase__generate_typescript_types` can regenerate this file from
 * the live schema. Keep in sync with supabase/migrations/*.sql until then.
 * Shape follows what the Supabase CLI's `gen types typescript` emits, which
 * @supabase/postgrest-js's generics require (Tables/Views/Functions,
 * Relationships on every table).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
      content_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          content_type: "quran_ayah" | "hadith";
          content_key: string;
          data: Json;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: "quran_ayah" | "hadith";
          content_key: string;
          data?: Json;
          note?: string | null;
        };
        Update: {
          data?: Json;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "content_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      content_progress: {
        Row: {
          id: string;
          user_id: string;
          content_type: "quran" | "hadith";
          content_key: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: "quran" | "hadith";
          content_key: string;
          data?: Json;
        };
        Update: {
          data?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "content_progress_user_id_fkey";
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

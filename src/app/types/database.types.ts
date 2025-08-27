/**
 * This file defines TypeScript types for your Supabase database tables
 * You can generate these types from your actual Supabase database using the Supabase CLI:
 * npx supabase gen types typescript --project-id your-project-id > src/app/types/database.types.ts
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
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      polls: {
        Row: {
          id: number;
          title: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          created_at?: string;
          created_by?: string | null;
        };
      };
      poll_options: {
        Row: {
          id: number;
          poll_id: number;
          text: string;
          votes: number;
        };
        Insert: {
          id?: number;
          poll_id: number;
          text: string;
          votes?: number;
        };
        Update: {
          id?: number;
          poll_id?: number;
          text?: string;
          votes?: number;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: number;
          option_id: number;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: number;
          option_id: number;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: number;
          option_id?: number;
          user_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

// Add attendance_sessions type to your Database type
export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          grade: number;
          teacher: string;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      attendance_sessions: {
        Row: {
          id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attendance_sessions']['Insert']>;
      };
    };
  };
};
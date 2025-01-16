export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          role: string
          created_at: string
          updated_at: string | null
          is_superadmin?: boolean
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
          is_superadmin?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
          is_superadmin?: boolean
        }
      }
      ip_sessions: {
        Row: {
          id: string
          user_id: string
          ip_address: string
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          ip_address: string
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string
          created_at?: string
          last_activity?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
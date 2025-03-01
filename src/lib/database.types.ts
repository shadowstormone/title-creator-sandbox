
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
          is_superadmin: boolean
          is_banned: boolean
          is_active: boolean
          deactivated_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          role?: string
          is_superadmin?: boolean
          is_banned?: boolean
          is_active?: boolean
          deactivated_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          role?: string
          is_superadmin?: boolean
          is_banned?: boolean
          is_active?: boolean
          deactivated_at?: string | null
          created_at?: string
          updated_at?: string | null
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
      animes: {
        Row: {
          id: number
          title: string
          title_en: string
          description: string | null
          genres: string[]
          total_episodes: number
          uploaded_episodes: number
          year: number | null
          season: string | null
          studio: string | null
          voice_acting: string | null
          timing: string | null
          image_url: string | null
          views: number
          rating: number
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: never
          title: string
          title_en: string
          description?: string | null
          genres?: string[]
          total_episodes?: number
          uploaded_episodes?: number
          year?: number | null
          season?: string | null
          studio?: string | null
          voice_acting?: string | null
          timing?: string | null
          image_url?: string | null
          views?: number
          rating?: number
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: never
          title?: string
          title_en?: string
          description?: string | null
          genres?: string[]
          total_episodes?: number
          uploaded_episodes?: number
          year?: number | null
          season?: string | null
          studio?: string | null
          voice_acting?: string | null
          timing?: string | null
          image_url?: string | null
          views?: number
          rating?: number
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
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

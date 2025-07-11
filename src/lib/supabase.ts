import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Controlla se le variabili d'ambiente sono configurate correttamente
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseKey !== 'your_supabase_anon_key' &&
  supabaseUrl.startsWith('http')

// Se Supabase non è configurato, crea un client dummy per evitare errori
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://dummy.supabase.co', 'dummy-key')

// Esporta flag per verificare se Supabase è configurato
export const isSupabaseReady = isSupabaseConfigured

// Export types for database tables
export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          aura: number
          created_at: string
          profile_image: string | null
          bio: string | null
        }
        Insert: {
          id?: string
          name: string
          aura?: number
          created_at?: string
          profile_image?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          name?: string
          aura?: number
          created_at?: string
          profile_image?: string | null
          bio?: string | null
        }
      }
      aura_actions: {
        Row: {
          id: string
          player_id: string
          player_name: string
          change: number
          timestamp: string
          reason: string | null
        }
        Insert: {
          id?: string
          player_id: string
          player_name: string
          change: number
          timestamp?: string
          reason?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          player_name?: string
          change?: number
          timestamp?: string
          reason?: string | null
        }
      }
      game_sessions: {
        Row: {
          id: string
          code: string
          name: string
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          created_at?: string
          last_activity?: string
        }
      }
    }
  }
}

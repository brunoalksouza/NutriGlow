import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          age: number | null
          height_cm: number | null
          weight_kg: number | null
          goal: string | null
          activity: string | null
          restrictions: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          goal?: string | null
          activity?: string | null
          restrictions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          goal?: string | null
          activity?: string | null
          restrictions?: string | null
          created_at?: string
        }
      }
      diets: {
        Row: {
          id: string
          user_id: string
          plan: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: any
          created_at?: string
        }
      }
    }
  }
}

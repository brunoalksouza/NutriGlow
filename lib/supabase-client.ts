import { createClient } from "@supabase/supabase-js"

// Use as variáveis de ambiente que estão disponíveis no v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined")
}

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key (first 10 chars):", supabaseAnonKey.substring(0, 10) + "...")

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

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
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
          created_at?: string
        }
      }
    }
  }
}

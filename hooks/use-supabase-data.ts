"use client"

import { useState, useEffect } from "react"
import { useSupa } from "@/contexts/supa-provider"

export function useProfile() {
  const { user, supabase } = useSupa()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" error
          setError(error.message)
          return
        }

        setProfile(data)
      } catch (err) {
        setError("Erro inesperado")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  const updateProfile = async (updates: any) => {
    if (!user) return { error: "Usuário não autenticado" }

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
      })

      if (error) return { error: error.message }

      setProfile((prev: any) => ({ ...prev, ...updates }))
      return { success: true }
    } catch (err) {
      return { error: "Erro inesperado" }
    }
  }

  return { profile, loading, error, updateProfile }
}

export function useDiets() {
  const { user, supabase } = useSupa()
  const [diets, setDiets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDiets = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("diets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          setError(error.message)
          return
        }

        setDiets(data || [])
      } catch (err) {
        setError("Erro inesperado")
      } finally {
        setLoading(false)
      }
    }

    loadDiets()
  }, [user, supabase])

  const addDiet = async (plan: any) => {
    if (!user) return { error: "Usuário não autenticado" }

    try {
      const { data, error } = await supabase
        .from("diets")
        .insert({
          user_id: user.id,
          plan,
        })
        .select()
        .single()

      if (error) return { error: error.message }

      setDiets((prev: any) => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      return { error: "Erro inesperado" }
    }
  }

  const deleteDiet = async (dietId: string) => {
    try {
      const { error } = await supabase.from("diets").delete().eq("id", dietId)

      if (error) return { error: error.message }

      setDiets((prev: any) => prev.filter((diet: any) => diet.id !== dietId))
      return { success: true }
    } catch (err) {
      return { error: "Erro inesperado" }
    }
  }

  return { diets, loading, error, addDiet, deleteDiet }
}

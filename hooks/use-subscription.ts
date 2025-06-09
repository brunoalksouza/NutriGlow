"use client"

import { useState, useEffect } from "react"
import { useSupa } from "@/contexts/supa-provider"

export type SubscriptionStatus = "loading" | "free" | "active" | "past_due" | "canceled"

export function useSubscription() {
  const { user, supabase } = useSupa()
  const [status, setStatus] = useState<SubscriptionStatus>("loading")
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) {
      setStatus("free")
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          setStatus("free")
          return
        }

        const isActive = data.status === "active" || data.status === "trialing"
        setStatus(isActive ? "active" : (data.status as SubscriptionStatus))

        if (data.current_period_end) {
          setCurrentPeriodEnd(new Date(data.current_period_end))
        }
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setStatus("free")
      }
    }

    fetchSubscription()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("subscriptions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any
            const isActive = newData.status === "active" || newData.status === "trialing"
            setStatus(isActive ? "active" : newData.status)

            if (newData.current_period_end) {
              setCurrentPeriodEnd(new Date(newData.current_period_end))
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const createCheckoutSession = async () => {
    if (!user) throw new Error("User not authenticated")

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create checkout session")
    }

    const { url } = await response.json()
    return url
  }

  return {
    status,
    currentPeriodEnd,
    isActive: status === "active",
    isPro: status === "active",
    createCheckoutSession,
  }
}

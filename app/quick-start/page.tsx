"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function QuickStart() {
  const router = useRouter()
  const [dietPlan, setDietPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDiet = () => {
      // Try to get diet from localStorage first
      const storedDiet = localStorage.getItem("currentDiet")
      if (storedDiet) {
        try {
          const parsedDiet = JSON.parse(storedDiet)
          setDietPlan(parsedDiet)
          setIsLoading(false)
          return
        } catch (error) {
          console.error("Error parsing stored diet:", error)
        }
      }

      // If no stored diet, redirect to onboarding
      router.push("/onboarding")
    }

    loadDiet()
  }, [router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Your Diet Plan</h1>
      {dietPlan ? (
        <div>
          {/* Display diet plan details here */}
          <pre>{JSON.stringify(dietPlan, null, 2)}</pre>
        </div>
      ) : (
        <p>No diet plan found.</p>
      )}
    </div>
  )
}

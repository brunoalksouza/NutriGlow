import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Here you would integrate with Grok AI API
    // For now, we'll return a mock response

    const mockDietPlan = {
      totalCalories: calculateCalories(formData),
      protein: Math.round(formData.weight * 1.6),
      carbs: Math.round(formData.weight * 2.5),
      fat: Math.round(formData.weight * 0.8),
      meals: generateMeals(formData),
    }

    return NextResponse.json(mockDietPlan)
  } catch (error) {
    console.error("Error generating diet:", error)
    return NextResponse.json({ error: "Failed to generate diet plan" }, { status: 500 })
  }
}

function calculateCalories(formData: any) {
  const { weight, height, age, goal, activityLevel } = formData

  // Basic BMR calculation (Mifflin-St Jeor Equation for women)
  const bmr = 10 * Number.parseFloat(weight) + 6.25 * Number.parseFloat(height) - 5 * Number.parseFloat(age) - 161

  // Activity multiplier
  const activityMultipliers = {
    low: 1.2,
    moderate: 1.55,
    high: 1.725,
  }

  let calories = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]

  // Adjust based on goal
  if (goal === "lose") {
    calories -= 500 // 500 calorie deficit for weight loss
  } else if (goal === "gain") {
    calories += 300 // 300 calorie surplus for muscle gain
  }

  return Math.round(calories)
}

function generateMeals(formData: any) {
  // This would be replaced with actual Grok AI integration
  return [
    {
      name: "Café da Manhã",
      time: "07:00",
      calories: 350,
      foods: ["1 fatia de pão integral", "1 ovo mexido", "1/2 abacate", "1 xícara de chá verde"],
    },
    {
      name: "Lanche da Manhã",
      time: "10:00",
      calories: 150,
      foods: ["1 iogurte grego natural", "1 colher de mel", "Castanhas (30g)"],
    },
    {
      name: "Almoço",
      time: "12:30",
      calories: 500,
      foods: ["150g peito de frango grelhado", "1 xícara de arroz integral", "Salada verde", "1 colher de azeite"],
    },
    {
      name: "Lanche da Tarde",
      time: "15:30",
      calories: 200,
      foods: ["1 banana", "2 colheres de pasta de amendoim", "1 copo de água de coco"],
    },
    {
      name: "Jantar",
      time: "19:00",
      calories: 450,
      foods: ["150g salmão grelhado", "Batata doce assada", "Brócolis refogado", "Salada de rúcula"],
    },
  ]
}

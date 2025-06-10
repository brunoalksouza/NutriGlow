import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    console.log("Received form data:", formData)

    // Validate required fields
    if (!formData.age || !formData.weight || !formData.height) {
      console.log("Missing required fields, using defaults")
      formData.age = formData.age || 25
      formData.weight = formData.weight || 65
      formData.height = formData.height || 165
    }

    // Always use mock data for now to ensure reliability
    console.log("Using mock data for diet generation")
    const mockDiet = generateMockDiet(formData)
    return NextResponse.json(mockDiet)
  } catch (error) {
    console.error("Error generating diet:", error)
    // Return a basic mock diet even if we can't parse the request
    const basicMockDiet = generateBasicMockDiet()
    return NextResponse.json(basicMockDiet)
  }
}

function generateMockDiet(formData: any) {
  const calories = calculateCalories(formData)
  const weight = Number.parseFloat(formData.weight) || 65
  const protein = Math.round(weight * 1.6)
  const carbs = Math.round(weight * 2.5)
  const fat = Math.round(weight * 0.8)

  return {
    totalCalories: calories,
    protein,
    carbs,
    fat,
    meals: generateMeals(formData, calories),
    source: "mock_data",
    timestamp: new Date().toISOString(),
  }
}

function generateBasicMockDiet() {
  return {
    totalCalories: 1800,
    protein: 120,
    carbs: 180,
    fat: 60,
    meals: [
      {
        name: "Café da Manhã",
        time: "07:00",
        calories: 450,
        foods: ["1 fatia de pão integral", "1 ovo mexido", "1/2 abacate", "1 xícara de chá verde"],
      },
      {
        name: "Lanche da Manhã",
        time: "10:00",
        calories: 180,
        foods: ["1 iogurte grego natural", "1 colher de mel", "Castanhas (30g)"],
      },
      {
        name: "Almoço",
        time: "12:30",
        calories: 630,
        foods: ["150g peito de frango grelhado", "1 xícara de arroz integral", "Salada verde", "1 colher de azeite"],
      },
      {
        name: "Lanche da Tarde",
        time: "15:30",
        calories: 180,
        foods: ["1 banana", "2 colheres de pasta de amendoim", "1 copo de água de coco"],
      },
      {
        name: "Jantar",
        time: "19:00",
        calories: 360,
        foods: ["150g salmão grelhado", "Batata doce assada", "Brócolis refogado", "Salada de rúcula"],
      },
    ],
    source: "basic_mock_data",
    timestamp: new Date().toISOString(),
  }
}

function calculateCalories(formData: any) {
  const weight = Number.parseFloat(formData.weight) || 65
  const height = Number.parseFloat(formData.height) || 165
  const age = Number.parseFloat(formData.age) || 25
  const { goal, activityLevel } = formData

  // Basic BMR calculation (Mifflin-St Jeor Equation for women)
  const bmr = 10 * weight + 6.25 * height - 5 * age - 161

  // Activity multiplier
  const activityMultipliers = {
    low: 1.2,
    moderate: 1.55,
    high: 1.725,
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
  }

  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55
  let calories = bmr * multiplier

  // Adjust based on goal
  if (goal === "lose" || goal === "weightLoss") {
    calories -= 500
  } else if (goal === "gain" || goal === "muscleGain") {
    calories += 300
  }

  return Math.round(Math.max(calories, 1200))
}

function generateMeals(formData: any, totalCalories: number) {
  const { mealsPerDay, restrictions, dietaryRestrictions } = formData
  const mealsCount = Number.parseInt(mealsPerDay) || 5
  const allRestrictions = [restrictions, dietaryRestrictions].filter(Boolean).join(" ").toLowerCase()

  const baseMeals = [
    {
      name: "Café da Manhã",
      time: "07:00",
      calories: Math.round(totalCalories * 0.25),
      foods: ["1 fatia de pão integral", "1 ovo mexido", "1/2 abacate", "1 xícara de chá verde"],
    },
    {
      name: "Lanche da Manhã",
      time: "10:00",
      calories: Math.round(totalCalories * 0.1),
      foods: ["1 iogurte grego natural", "1 colher de mel", "Castanhas (30g)"],
    },
    {
      name: "Almoço",
      time: "12:30",
      calories: Math.round(totalCalories * 0.35),
      foods: ["150g peito de frango grelhado", "1 xícara de arroz integral", "Salada verde", "1 colher de azeite"],
    },
    {
      name: "Lanche da Tarde",
      time: "15:30",
      calories: Math.round(totalCalories * 0.1),
      foods: ["1 banana", "2 colheres de pasta de amendoim", "1 copo de água de coco"],
    },
    {
      name: "Jantar",
      time: "19:00",
      calories: Math.round(totalCalories * 0.2),
      foods: ["150g salmão grelhado", "Batata doce assada", "Brócolis refogado", "Salada de rúcula"],
    },
  ]

  // Adjust meals based on restrictions
  if (allRestrictions.includes("lactose")) {
    baseMeals[1].foods = ["1 banana", "Castanhas (30g)", "1 colher de pasta de amendoim"]
  }

  if (allRestrictions.includes("vegetarian") || allRestrictions.includes("vegetariana")) {
    baseMeals[2].foods = ["150g tofu grelhado", "1 xícara de quinoa", "Salada verde", "1 colher de azeite"]
    baseMeals[4].foods = ["150g grão-de-bico refogado", "Batata doce assada", "Brócolis refogado", "Salada de rúcula"]
  }

  return baseMeals.slice(0, mealsCount)
}

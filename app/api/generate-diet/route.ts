import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    console.log("Received form data:", formData)

    // Validate required fields
    if (!formData.age || !formData.weight || !formData.height) {
      return NextResponse.json({ error: "Dados obrigatórios faltando (idade, peso, altura)" }, { status: 400 })
    }

    // Check if Grok API key is properly configured
    const grokApiKey = process.env.GROK_API_KEY
    console.log("Grok API Key status:", grokApiKey ? "Present" : "Missing")

    if (!grokApiKey || grokApiKey === "NOT_SET" || grokApiKey.length < 10) {
      console.log("Grok API key not properly configured, using mock data")
      const mockDiet = generateMockDiet(formData)
      return NextResponse.json(mockDiet)
    }

    // Try Grok AI first
    const grokResponse = await generateDietWithGrok(formData)

    if (grokResponse.error) {
      console.error("Grok AI Error:", grokResponse.error)
      // Fallback to mock data if Grok fails
      const mockDiet = generateMockDiet(formData)
      return NextResponse.json(mockDiet)
    }

    return NextResponse.json(grokResponse.data)
  } catch (error) {
    console.error("Error generating diet:", error)
    // Fallback to mock data on any error
    try {
      const formData = await request.json().catch(() => ({}))
      const mockDiet = generateMockDiet(formData)
      return NextResponse.json(mockDiet)
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError)
      // Return a basic mock diet even if we can't parse the request
      const basicMockDiet = generateBasicMockDiet()
      return NextResponse.json(basicMockDiet)
    }
  }
}

async function generateDietWithGrok(formData: any) {
  try {
    const grokApiKey = process.env.GROK_API_KEY

    // Validate API key format
    if (!grokApiKey || !grokApiKey.startsWith("gsk-") || grokApiKey.length < 20) {
      return { error: "Invalid Grok API key format" }
    }

    const prompt = createDietPrompt(formData)
    console.log("Sending prompt to Grok...")

    const requestBody = {
      messages: [
        {
          role: "system",
          content:
            "Você é uma nutricionista especializada em dietas personalizadas para mulheres. Responda APENAS com JSON válido, sem texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "grok-beta",
      stream: false,
      temperature: 0.3,
      max_tokens: 2000,
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log("Grok response status:", response.status)

    if (!response.ok) {
      return {
        error: `Grok API error: ${response.status} - ${responseText}`,
      }
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Grok response:", parseError)
      return { error: "Invalid JSON response from Grok" }
    }

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return { error: "No content received from Grok" }
    }

    // Parse the structured response from Grok
    const dietPlan = parseDietResponse(content, formData)
    return { data: dietPlan }
  } catch (error) {
    console.error("Grok integration error:", error)
    return { error: `Grok integration error: ${error}` }
  }
}

function createDietPrompt(formData: any) {
  const { goal, age, weight, height, activityLevel, restrictions, mealsPerDay } = formData

  // Map form values to Portuguese descriptions
  const goalText =
    {
      lose: "Emagrecer",
      maintain: "Manter peso",
      gain: "Ganhar massa muscular",
      weightLoss: "Emagrecer",
      muscleGain: "Ganhar massa muscular",
      maintainWeight: "Manter peso",
    }[goal] || "Manter peso"

  const activityText =
    {
      low: "Baixo (sedentária)",
      moderate: "Moderado (2-3x/semana)",
      high: "Alto (4+ vezes/semana)",
      sedentary: "Sedentário",
      lightlyActive: "Levemente ativo",
      moderatelyActive: "Moderadamente ativo",
      veryActive: "Muito ativo",
      extraActive: "Extremamente ativo",
    }[activityLevel] || "Moderado"

  const mealsCount = mealsPerDay || "5"

  return `
Crie uma dieta personalizada para uma mulher com as seguintes características:

PERFIL:
- Idade: ${age} anos
- Peso: ${weight} kg
- Altura: ${height} cm
- Objetivo: ${goalText}
- Nível de atividade: ${activityText}
- Refeições por dia: ${mealsCount}
- Restrições alimentares: ${restrictions || "Nenhuma"}

REQUISITOS:
1. Calcule as calorias diárias necessárias
2. Distribua os macronutrientes (proteína, carboidrato, gordura)
3. Crie ${mealsCount} refeições balanceadas
4. Use alimentos brasileiros e acessíveis
5. Inclua horários sugeridos para cada refeição
6. Considere as restrições alimentares mencionadas

FORMATO DE RESPOSTA (JSON):
{
  "totalCalories": 1800,
  "protein": 120,
  "carbs": 180,
  "fat": 60,
  "meals": [
    {
      "name": "Café da Manhã",
      "time": "07:00",
      "calories": 450,
      "foods": ["1 fatia de pão integral", "1 ovo mexido", "1/2 abacate"]
    }
  ]
}

Responda APENAS com o JSON válido, sem texto adicional.
`
}

function parseDietResponse(content: string, formData: any) {
  try {
    // Clean the content - remove any markdown formatting
    let cleanContent = content.trim()

    // Remove markdown code blocks if present
    cleanContent = cleanContent.replace(/```json\s*/g, "").replace(/```\s*/g, "")

    // Try to find JSON in the response
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      // Validate the parsed data
      if (parsed.totalCalories && parsed.meals && Array.isArray(parsed.meals)) {
        return parsed
      }
    }
  } catch (error) {
    console.error("Error parsing Grok response:", error)
  }

  // Fallback to mock data if parsing fails
  console.log("Falling back to mock data due to parsing error")
  return generateMockDiet(formData)
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
    source: "mock_data", // Indicator that this is mock data
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
    calories -= 500 // 500 calorie deficit for weight loss
  } else if (goal === "gain" || goal === "muscleGain") {
    calories += 300 // 300 calorie surplus for muscle gain
  }

  return Math.round(Math.max(calories, 1200)) // Minimum 1200 calories
}

function generateMeals(formData: any, totalCalories: number) {
  const { mealsPerDay, restrictions, dietaryRestrictions } = formData
  const mealsCount = Number.parseInt(mealsPerDay) || 5
  const allRestrictions = [restrictions, dietaryRestrictions].filter(Boolean).join(" ").toLowerCase()

  // Base meals structure
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useSupa } from "@/contexts/supa-provider"

interface FormData {
  goal: string
  age: string
  weight: string
  height: string
  hasRestrictions: string
  restrictions: string
  mealsPerDay: string
  activityLevel: string
}

const questions = [
  {
    id: "goal",
    title: "Qual é o seu objetivo principal?",
    type: "radio",
    options: [
      { value: "lose", label: "Emagrecer" },
      { value: "maintain", label: "Manter Peso" },
      { value: "gain", label: "Ganhar Massa" },
    ],
  },
  {
    id: "age",
    title: "Qual é a sua idade?",
    type: "input",
    inputType: "number",
    placeholder: "Ex: 25",
  },
  {
    id: "weight",
    title: "Qual é o seu peso atual?",
    type: "input",
    inputType: "number",
    placeholder: "Ex: 65",
    suffix: "kg",
  },
  {
    id: "height",
    title: "Qual é a sua altura?",
    type: "input",
    inputType: "number",
    placeholder: "Ex: 165",
    suffix: "cm",
  },
  {
    id: "hasRestrictions",
    title: "Possui restrições alimentares?",
    type: "radio",
    options: [
      { value: "no", label: "Não" },
      { value: "yes", label: "Sim" },
    ],
  },
  {
    id: "mealsPerDay",
    title: "Quantas refeições você costuma fazer por dia?",
    type: "radio",
    options: [
      { value: "3", label: "3 refeições" },
      { value: "4", label: "4 refeições" },
      { value: "5", label: "5 refeições" },
      { value: "6", label: "6 refeições" },
    ],
  },
  {
    id: "activityLevel",
    title: "Qual é o seu nível de atividade física?",
    type: "radio",
    options: [
      { value: "low", label: "Baixo - Sedentária" },
      { value: "moderate", label: "Moderado - Exercícios 2-3x/semana" },
      { value: "high", label: "Alto - Exercícios 4+ vezes/semana" },
    ],
  },
]

function OnboardingContent() {
  const router = useRouter()
  const { user, supabase } = useSupa()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FormData>({
    goal: "",
    age: "",
    weight: "",
    height: "",
    hasRestrictions: "",
    restrictions: "",
    mealsPerDay: "",
    activityLevel: "",
  })

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save to Supabase and generate diet
      await handleFinish()
    }
  }

  const handleFinish = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Save profile to Supabase
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name: user.user_metadata?.name || "",
        age: Number.parseInt(formData.age),
        height_cm: Number.parseInt(formData.height),
        weight_kg: Number.parseInt(formData.weight),
        goal: formData.goal,
        activity: formData.activityLevel,
        restrictions: formData.hasRestrictions === "yes" ? formData.restrictions : null,
      })

      if (profileError) {
        setError("Erro ao salvar perfil: " + profileError.message)
        return
      }

      // Store form data for diet generation
      localStorage.setItem("dietFormData", JSON.stringify(formData))

      // Navigate to loading screen
      router.push("/loading")
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentQuestion = questions[currentStep]
  const currentValue = formData[currentQuestion.id as keyof FormData]
  const isValid = currentValue && currentValue.trim() !== ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentStep + 1} de {questions.length}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="border-pink-200 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 text-center">{currentQuestion.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={currentValue}
                onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-pink-50 transition-colors"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "input" && (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={currentQuestion.inputType}
                    placeholder={currentQuestion.placeholder}
                    value={currentValue}
                    onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                    className="text-center text-lg py-6"
                  />
                  {currentQuestion.suffix && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {currentQuestion.suffix}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Restrictions textarea */}
            {currentQuestion.id === "hasRestrictions" && formData.hasRestrictions === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="restrictions">Especifique suas restrições:</Label>
                <Textarea
                  id="restrictions"
                  placeholder="Ex: Intolerância à lactose, vegetariana, alergia a nozes..."
                  value={formData.restrictions}
                  onChange={(e) => handleInputChange("restrictions", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Button
          onClick={handleNext}
          disabled={!isValid || loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Salvando...</span>
            </div>
          ) : currentStep === questions.length - 1 ? (
            "Gerar Minha Dieta"
          ) : (
            "Próximo"
          )}
          {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  )
}

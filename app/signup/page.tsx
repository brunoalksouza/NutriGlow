"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useSupa } from "@/contexts/supa-provider"

export default function SignupPage() {
  const router = useRouter()
  const { supabase, isConnected } = useSupa()
  const [formData, setFormData] = useState({
    name: "Maria Silva",
    email: "maria@exemplo.com",
    password: "123456",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Debug info para verificar o estado
    const debug = {
      isConnected,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      timestamp: new Date().toISOString(),
    }
    setDebugInfo(debug)
    console.log("Signup Page Debug Info:", debug)
  }, [isConnected])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("=== SIGNUP ATTEMPT ===")
    console.log("Form data:", { name: formData.name, email: formData.email })
    console.log("Is connected:", isConnected)
    console.log("Debug info:", debugInfo)

    try {
      // Se não estiver conectado ao Supabase, usar modo demo
      if (!isConnected) {
        console.log("🎭 DEMO MODE: Simulating signup")

        // Simular delay de rede
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simular sucesso e criar usuário demo
        const demoUser = {
          id: "demo-user-" + Date.now(),
          email: formData.email,
          name: formData.name,
          created_at: new Date().toISOString(),
          mode: "demo",
        }

        localStorage.setItem("demoUser", JSON.stringify(demoUser))
        console.log("✅ Demo user created:", demoUser)

        // Redirecionar para onboarding
        router.push("/onboarding")
        return
      }

      // Modo real com Supabase
      console.log("🔗 REAL MODE: Attempting Supabase signup")

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      console.log("Supabase signup response:", { data, error })

      if (error) {
        console.error("❌ Signup error:", error)
        setError(`Erro no cadastro: ${error.message}`)
        return
      }

      if (data.user) {
        console.log("✅ User created successfully:", data.user.id)
        router.push("/onboarding")
      }
    } catch (err) {
      console.error("💥 Unexpected error:", err)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="border-blue-200 bg-blue-50 mb-4">
            <CardContent className="p-3">
              <h4 className="text-xs font-bold mb-2">Debug Info:</h4>
              <div className="text-xs space-y-1">
                <div>Connected: {isConnected ? "✅ Yes" : "❌ No"}</div>
                <div>Mode: {isConnected ? "🔗 Real" : "🎭 Demo"}</div>
                <div>URL: {debugInfo.hasSupabaseUrl ? "✅ Set" : "❌ Missing"}</div>
                <div>Key: {debugInfo.hasSupabaseKey ? "✅ Set" : "❌ Missing"}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Status */}
        {!isConnected ? (
          <Alert className="border-yellow-200 bg-yellow-50 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-700">
              <strong>Modo Demo Ativo</strong>
              <br />
              Funcionando sem conexão com banco de dados. Seus dados serão simulados para demonstração.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <strong>Conectado ao Supabase</strong>
              <br />
              Seus dados serão salvos com segurança.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
          <p className="text-gray-600">
            {isConnected
              ? "Comece sua jornada para uma vida mais saudável"
              : "Teste a experiência completa em modo demo"}
          </p>
        </div>

        {/* Signup Form */}
        <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              {isConnected ? "Cadastre-se gratuitamente" : "🎭 Demo - Cadastro Simulado"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={isConnected ? "Seu nome" : "Ex: Maria Silva (demo)"}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={isConnected ? "seu@email.com" : "demo@exemplo.com"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isConnected ? "Mínimo 6 caracteres" : "123456 (demo)"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="border-pink-200 focus:border-pink-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isConnected ? "Criando conta..." : "Simulando cadastro..."}</span>
                  </div>
                ) : isConnected ? (
                  "Criar Conta"
                ) : (
                  "🎭 Continuar Demo"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Instructions */}
        {!isConnected && (
          <Card className="border-blue-200 bg-blue-50 mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Como testar:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use qualquer nome e email</li>
                <li>• Senha mínima: 6 caracteres</li>
                <li>• Todos os dados são simulados</li>
                <li>• Experiência completa disponível</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Terms */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Ao criar uma conta, você concorda com nossos{" "}
          <Link href="/terms" className="text-pink-600 hover:underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="text-pink-600 hover:underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  )
}

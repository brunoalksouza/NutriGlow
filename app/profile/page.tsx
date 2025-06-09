"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Settings, Crown, History, Edit, LogOut } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useSupa } from "@/contexts/supa-provider"

interface Profile {
  name: string
  age: number
  weight_kg: number
  height_cm: number
  goal: string
  activity: string
  restrictions: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, supabase } = useSupa()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dietCount, setDietCount] = useState(0)
  const [daysSinceStart, setDaysSinceStart] = useState(0)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        // Load profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
          setError("Erro ao carregar perfil")
          return
        }

        if (profileData) {
          setProfile({
            name: profileData.name || user.user_metadata?.name || "",
            age: profileData.age || 0,
            weight_kg: profileData.weight_kg || 0,
            height_cm: profileData.height_cm || 0,
            goal: profileData.goal || "",
            activity: profileData.activity || "",
            restrictions: profileData.restrictions,
          })

          // Calculate days since start
          const createdAt = new Date(profileData.created_at)
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - createdAt.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setDaysSinceStart(diffDays)
        }

        // Load diet count
        const { count, error: dietError } = await supabase
          .from("diets")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (!dietError && count !== null) {
          setDietCount(count)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Erro inesperado")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: profile.name,
        age: profile.age,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        goal: profile.goal,
        activity: profile.activity,
        restrictions: profile.restrictions,
      })

      if (error) {
        setError("Erro ao salvar perfil: " + error.message)
        return
      }

      setSuccess("Perfil atualizado com sucesso!")
      setIsEditing(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Erro inesperado ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  const getGoalLabel = (goal: string) => {
    const goals = {
      lose: "Emagrecer",
      maintain: "Manter Peso",
      gain: "Ganhar Massa",
    }
    return goals[goal as keyof typeof goals] || goal
  }

  const getActivityLabel = (activity: string) => {
    const activities = {
      low: "Baixo",
      moderate: "Moderado",
      high: "Alto",
    }
    return activities[activity as keyof typeof activities] || activity
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
            <p className="text-gray-600 text-sm">{user?.email}</p>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Profile Card */}
          {profile && (
            <Card className="border-pink-200 bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => prev && { ...prev, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) =>
                        setProfile((prev) => prev && { ...prev, age: Number.parseInt(e.target.value) || 0 })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight_kg}
                      onChange={(e) =>
                        setProfile((prev) => prev && { ...prev, weight_kg: Number.parseInt(e.target.value) || 0 })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height_cm}
                    onChange={(e) =>
                      setProfile((prev) => prev && { ...prev, height_cm: Number.parseInt(e.target.value) || 0 })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Objetivo Atual</Label>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                    {getGoalLabel(profile.goal)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Nível de Atividade</Label>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {getActivityLabel(profile.activity)}
                  </Badge>
                </div>

                {profile.restrictions && (
                  <div className="space-y-2">
                    <Label>Restrições Alimentares</Label>
                    <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{profile.restrictions}</p>
                  </div>
                )}

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats Card */}
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <History className="w-5 h-5 mr-2 text-pink-600" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{daysSinceStart}</div>
                  <div className="text-sm text-gray-600">Dias ativos</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{dietCount}</div>
                  <div className="text-sm text-gray-600">Dietas criadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Card */}
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="w-6 h-6 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-800">NutriGlow Premium</h3>
                    <p className="text-sm text-gray-600">Recursos exclusivos</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  Assinar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2 text-pink-600" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={() => router.push("/onboarding")}
              >
                Refazer Questionário
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Notificações
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Privacidade
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Suporte
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation currentPage="profile" />
      </div>
    </AuthGuard>
  )
}

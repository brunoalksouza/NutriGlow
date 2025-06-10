"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Table, Play, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase-v0"

interface TableStatus {
  name: string
  exists: boolean
  created?: boolean
  error?: string
}

export function DatabaseInitializer() {
  const [initializing, setInitializing] = useState(false)
  const [tables, setTables] = useState<TableStatus[]>([])
  const [step, setStep] = useState<"check" | "create" | "verify" | "done">("check")
  const [autoStarted, setAutoStarted] = useState(false)

  // SQL para criar as tabelas
  const createTablesSql = {
    profiles: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        name TEXT,
        age INTEGER,
        height_cm INTEGER,
        weight_kg INTEGER,
        goal TEXT,
        activity TEXT,
        restrictions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
      CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
      CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    `,
    diets: `
      CREATE TABLE IF NOT EXISTS diets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        plan JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own diets" ON diets FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own diets" ON diets FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own diets" ON diets FOR UPDATE USING (auth.uid() = user_id);
    `,
    subscriptions: `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        status TEXT,
        current_period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
    `,
  }

  // Verificar se as tabelas existem
  const checkTables = async () => {
    setStep("check")
    const tablesToCheck = ["profiles", "diets", "subscriptions"]
    const results: TableStatus[] = []

    for (const tableName of tablesToCheck) {
      try {
        // Verificar se a tabela existe
        const { error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

        results.push({
          name: tableName,
          exists: !error,
          error: error?.message,
        })
      } catch (error: any) {
        results.push({
          name: tableName,
          exists: false,
          error: error.message,
        })
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setTables(results)
    return results
  }

  // Criar tabelas que não existem
  const createMissingTables = async (tableStatus: TableStatus[]) => {
    setStep("create")
    const updatedStatus = [...tableStatus]

    for (let i = 0; i < updatedStatus.length; i++) {
      const table = updatedStatus[i]
      if (!table.exists) {
        try {
          // Criar a tabela usando SQL
          const sql = createTablesSql[table.name as keyof typeof createTablesSql]
          const { error } = await supabase.rpc("exec_sql", { sql })

          updatedStatus[i] = {
            ...table,
            created: !error,
            error: error?.message,
          }
        } catch (error: any) {
          updatedStatus[i] = {
            ...table,
            created: false,
            error: error.message,
          }
        }
        setTables([...updatedStatus])
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return updatedStatus
  }

  // Verificar novamente após criar
  const verifyTables = async () => {
    setStep("verify")
    return await checkTables()
  }

  // Inicializar o banco de dados
  const initializeDatabase = async () => {
    setInitializing(true)

    try {
      // Passo 1: Verificar tabelas existentes
      const initialStatus = await checkTables()

      // Passo 2: Criar tabelas faltantes
      const afterCreate = await createMissingTables(initialStatus)

      // Passo 3: Verificar novamente
      await verifyTables()

      // Concluído
      setStep("done")
    } catch (error) {
      console.error("Erro ao inicializar banco:", error)
    } finally {
      setInitializing(false)
    }
  }

  // Auto-iniciar
  useEffect(() => {
    if (!autoStarted) {
      initializeDatabase()
      setAutoStarted(true)
    }
  }, [autoStarted])

  // Status geral
  const allTablesExist = tables.length > 0 && tables.every((t) => t.exists || t.created)
  const someTablesExist = tables.some((t) => t.exists || t.created)
  const hasErrors = tables.some((t) => t.error && !(t.exists || t.created))

  // Ícone do passo atual
  const getStepIcon = () => {
    switch (step) {
      case "check":
        return <Database className="w-4 h-4 mr-2" />
      case "create":
        return <Table className="w-4 h-4 mr-2" />
      case "verify":
        return <RefreshCw className="w-4 h-4 mr-2" />
      case "done":
        return <CheckCircle className="w-4 h-4 mr-2" />
    }
  }

  // Texto do passo atual
  const getStepText = () => {
    switch (step) {
      case "check":
        return "Verificando tabelas..."
      case "create":
        return "Criando tabelas..."
      case "verify":
        return "Verificando criação..."
      case "done":
        return "Inicialização concluída!"
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />🚀 Inicialização do Banco de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={initializeDatabase} disabled={initializing} className="w-full bg-blue-600 hover:bg-blue-700">
            {initializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getStepText()}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {step === "done" ? "Reiniciar Verificação" : "Inicializar Banco de Dados"}
              </>
            )}
          </Button>

          {tables.length > 0 && (
            <div className="space-y-2">
              {tables.map((table, index) => (
                <Alert
                  key={index}
                  className={
                    table.exists || table.created
                      ? "border-green-200 bg-green-50"
                      : table.error
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                  }
                >
                  <div className="flex items-start gap-2">
                    {table.exists ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    ) : table.created ? (
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-xs">
                        Tabela: <code>{table.name}</code>
                      </div>
                      <AlertDescription className="text-xs mt-1">
                        {table.exists ? (
                          <div className="text-green-700">
                            ✅ <strong>Já existe</strong> no banco de dados
                          </div>
                        ) : table.created ? (
                          <div className="text-blue-700">
                            🆕 <strong>Criada com sucesso</strong>
                          </div>
                        ) : (
                          <div className="text-red-700">
                            ❌ <strong>Não existe</strong>
                            {table.error && <div className="text-xs mt-1 text-red-600">Erro: {table.error}</div>}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {!initializing && tables.length > 0 && (
            <Alert
              className={
                allTablesExist
                  ? "border-green-200 bg-green-50"
                  : hasErrors
                    ? "border-red-200 bg-red-50"
                    : "border-yellow-200 bg-yellow-50"
              }
            >
              <div className="flex items-center gap-2">
                {allTablesExist ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : hasErrors ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Database className="w-4 h-4 text-yellow-600" />
                )}
                <AlertDescription className="text-xs">
                  {allTablesExist ? (
                    <span className="text-green-700">
                      🎉 <strong>Banco de dados pronto!</strong> Todas as tabelas estão configuradas.
                    </span>
                  ) : hasErrors ? (
                    <span className="text-red-700">
                      ❌ <strong>Erro na criação das tabelas.</strong> Verifique as permissões do banco.
                    </span>
                  ) : (
                    <span className="text-yellow-700">
                      ⚠️ <strong>Algumas tabelas não foram criadas.</strong> Tente novamente.
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {hasErrors && (
            <Alert className="border-blue-200 bg-blue-50">
              <Database className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700">
                💡 <strong>Dica:</strong> Se a criação automática falhar, execute o script{" "}
                <code className="bg-blue-100 px-1 rounded">fix-database-issues.sql</code> no painel de scripts SQL.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

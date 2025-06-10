"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Table } from "lucide-react"
import { supabase } from "@/lib/supabase-v0"

interface TableStatus {
  name: string
  exists: boolean
  rowCount?: number
  error?: string
  policies?: number
}

export function DatabaseTablesCheck() {
  const [checking, setChecking] = useState(false)
  const [tables, setTables] = useState<TableStatus[]>([])
  const [autoChecked, setAutoChecked] = useState(false)

  const checkTables = async () => {
    setChecking(true)
    setTables([])

    const tablesToCheck = [
      { name: "profiles", description: "Perfis de usuários" },
      { name: "diets", description: "Planos de dieta" },
      { name: "subscriptions", description: "Assinaturas premium" },
    ]

    const results: TableStatus[] = []

    for (const table of tablesToCheck) {
      try {
        // Check if table exists and get row count
        const { count, error } = await supabase.from(table.name).select("*", { count: "exact", head: true })

        if (error) {
          results.push({
            name: table.name,
            exists: false,
            error: error.message,
          })
        } else {
          // Check policies
          let policyCount = 0
          try {
            const { data: policies } = await supabase.rpc("get_table_policies", { table_name: table.name })
            policyCount = policies?.length || 0
          } catch {
            // Ignore policy check errors
          }

          results.push({
            name: table.name,
            exists: true,
            rowCount: count || 0,
            policies: policyCount,
          })
        }
      } catch (error: any) {
        results.push({
          name: table.name,
          exists: false,
          error: error.message,
        })
      }
    }

    setTables(results)
    setChecking(false)
  }

  useEffect(() => {
    if (!autoChecked) {
      checkTables()
      setAutoChecked(true)
    }
  }, [autoChecked])

  const allTablesExist = tables.length > 0 && tables.every((t) => t.exists)
  const someTablesExist = tables.some((t) => t.exists)

  return (
    <Card className="border-green-200 bg-green-50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Table className="w-4 h-4" />📊 Status das Tabelas do Banco
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={checkTables} disabled={checking} className="w-full bg-green-600 hover:bg-green-700">
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando tabelas...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />🔄 Verificar Tabelas
              </>
            )}
          </Button>

          {tables.length > 0 && (
            <div className="space-y-2">
              {tables.map((table, index) => (
                <Alert
                  key={index}
                  className={table.exists ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <div className="flex items-start gap-2">
                    {table.exists ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-xs">
                        Tabela: <code>{table.name}</code>
                      </div>
                      <AlertDescription className="text-xs mt-1">
                        {table.exists ? (
                          <div className="space-y-1">
                            <div className="text-green-700">
                              ✅ <strong>Existe</strong> • {table.rowCount} registros
                            </div>
                            {table.policies !== undefined && (
                              <div className="text-green-600">🔒 {table.policies} políticas de segurança</div>
                            )}
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

          {!checking && tables.length > 0 && (
            <Alert
              className={
                allTablesExist
                  ? "border-green-200 bg-green-50"
                  : someTablesExist
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-center gap-2">
                {allTablesExist ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : someTablesExist ? (
                  <Database className="w-4 h-4 text-yellow-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className="text-xs">
                  {allTablesExist ? (
                    <span className="text-green-700">
                      🎉 <strong>Todas as tabelas existem!</strong> Banco de dados configurado corretamente.
                    </span>
                  ) : someTablesExist ? (
                    <span className="text-yellow-700">
                      ⚠️ <strong>Algumas tabelas faltando.</strong> Execute o script fix-database-issues.sql
                    </span>
                  ) : (
                    <span className="text-red-700">
                      ❌ <strong>Nenhuma tabela encontrada.</strong> Execute o script fix-database-issues.sql
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {!allTablesExist && (
            <Alert className="border-blue-200 bg-blue-50">
              <Database className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700">
                💡 <strong>Para criar as tabelas:</strong> Execute o script{" "}
                <code className="bg-blue-100 px-1 rounded">fix-database-issues.sql</code> no painel de scripts SQL.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

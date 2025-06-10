// String de conexão PostgreSQL para o banco de dados Supabase
// A senha já está codificada em percent-encoding para caracteres especiais
export const DATABASE_CONNECTION_STRING =
  "postgresql://postgres:6v%25Zmq%24tz7U%24.KR@db.ibrigockwxacbpoiocpf.supabase.co:5432/postgres"

/**
 * Função para obter a string de conexão do banco de dados
 * Pode ser usada para obter a string de conexão de diferentes fontes (env vars, config, etc)
 */
export function getDatabaseUrl(): string {
  // Prioridade: variável de ambiente > string hardcoded
  return process.env.DATABASE_URL || DATABASE_CONNECTION_STRING
}

/**
 * Função para verificar se a string de conexão é válida
 * Útil para debugging de problemas de conexão
 */
export function isValidConnectionString(connectionString: string): boolean {
  // Verifica se a string tem o formato básico de uma URL PostgreSQL
  const pattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^/]+$/
  return pattern.test(connectionString)
}

/**
 * Função para extrair informações da string de conexão
 * Útil para logging e debugging (com informações sensíveis mascaradas)
 */
export function getConnectionInfo(connectionString: string): Record<string, string> {
  try {
    // Extrai partes da URL
    const url = new URL(connectionString)

    return {
      host: url.hostname,
      port: url.port,
      database: url.pathname.replace("/", ""),
      user: url.username,
      // Mascara a senha para segurança
      password: "********",
    }
  } catch (error) {
    return { error: "Invalid connection string" }
  }
}

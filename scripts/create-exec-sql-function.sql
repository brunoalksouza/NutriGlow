-- @env DATABASE_URL,POSTGRES_URL_NON_POOLING,POSTGRES_URL

-- Criar função para executar SQL dinamicamente
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO anon;
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;

-- Função para obter políticas de uma tabela
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'policyname', policyname,
    'permissive', permissive,
    'cmd', cmd
  ))
  INTO result
  FROM pg_policies
  WHERE tablename = table_name;
  
  RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION get_table_policies TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_policies TO anon;
GRANT EXECUTE ON FUNCTION get_table_policies TO service_role;

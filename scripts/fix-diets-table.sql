-- Verifica se a tabela diets existe e cria se não existir
CREATE TABLE IF NOT EXISTS diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan JSONB,
  plan_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona políticas RLS para a tabela diets
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes para evitar duplicação
DROP POLICY IF EXISTS "Users can view their own diets" ON diets;
DROP POLICY IF EXISTS "Users can insert their own diets" ON diets;
DROP POLICY IF EXISTS "Users can update their own diets" ON diets;
DROP POLICY IF EXISTS "Users can delete their own diets" ON diets;

-- Cria novas políticas
CREATE POLICY "Users can view their own diets" 
ON diets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diets" 
ON diets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diets" 
ON diets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diets" 
ON diets FOR DELETE 
USING (auth.uid() = user_id);

-- Adiciona índice para melhorar performance
CREATE INDEX IF NOT EXISTS diets_user_id_idx ON diets(user_id);

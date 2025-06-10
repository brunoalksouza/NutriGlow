const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"]

for (const k of required) {
  if (!process.env[k] || process.env[k] === "NOT_SET") {
    console.error(`[ENV-ERROR] ${k} is missing in Preview scope`)
    process.exit(1)
  }
}

console.log("✅ All required environment variables are present")

"use client"

export default function EnvDebug() {
  if (process.env.NODE_ENV !== "development") return null

  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DATABASE_URL: process.env.NEXT_PUBLIC_MOCK_DB ?? "server-only",
  }

  return (
    <aside
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        fontSize: 10,
        background: "#0009",
        color: "#fff",
        padding: 6,
        borderRadius: 4,
        zIndex: 9999,
        fontFamily: "monospace",
        maxWidth: 300,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>🔧 ENV DEBUG</div>
      {Object.entries(envs).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 2 }}>
          <b>{k}</b>: {String(v).slice(0, 24) || "❌ empty"}
          {String(v).length > 24 && "..."}
        </div>
      ))}
    </aside>
  )
}

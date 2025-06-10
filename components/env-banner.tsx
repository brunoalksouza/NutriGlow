"use client"
import { useEffect, useState } from "react"

export default function EnvBanner() {
  const [now, setNow] = useState("")
  useEffect(() => setNow(new Date().toLocaleTimeString()), [])
  const vars = [
    ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + "…"],
  ]
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        fontSize: 11,
        background: "#eef",
        border: "1px solid #99f",
        borderRadius: 6,
        padding: 6,
        zIndex: 9999,
      }}
    >
      <b>Env Debug ({now})</b>
      <hr />
      {vars.map(([k, v]) => (
        <div key={k}>
          <b>{k}</b>: {v || "❌ NOT_SET"}
        </div>
      ))}
    </div>
  )
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const grokApiKey = process.env.GROK_API_KEY

    if (!grokApiKey || grokApiKey === "NOT_SET" || grokApiKey.length < 10) {
      return NextResponse.json({ status: "unavailable", message: "API key not configured" })
    }

    if (!grokApiKey.startsWith("gsk-") || grokApiKey.length < 20) {
      return NextResponse.json({ status: "invalid", message: "Invalid API key format" })
    }

    // Test the API key with a simple request
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Test",
          },
        ],
        model: "grok-beta",
        max_tokens: 10,
      }),
    })

    if (response.ok) {
      return NextResponse.json({ status: "available", message: "Grok API is working" })
    } else {
      const errorText = await response.text()
      console.error("Grok API test failed:", response.status, errorText)
      return NextResponse.json({ status: "invalid", message: "API key authentication failed" })
    }
  } catch (error) {
    console.error("Error checking Grok status:", error)
    return NextResponse.json({ status: "unavailable", message: "Network error" })
  }
}

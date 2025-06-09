import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { user_id, email } = await request.json()

    if (!user_id || !email) {
      return NextResponse.json({ error: "Missing user_id or email" }, { status: 400 })
    }

    // 1. Ensure / create Stripe customer
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .single()

    let customerId = existing?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      })
      customerId = customer.id

      // Insert new subscription record
      await supabase.from("subscriptions").insert({
        id: crypto.randomUUID(),
        user_id,
        stripe_customer_id: customerId,
        status: "incomplete",
      })
    }

    // 2. Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1QVv95FNPPob5PuQwosqH0457WUV4qrPecaqW6VhaXAgWjxAYUY1NiMGbG5Wlh5wdUiJfcns94IjQS3nvxeURGAz", // Replace with your actual price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/success`,
      cancel_url: `${request.headers.get("origin")}/billing-cancelled`,
      metadata: {
        user_id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

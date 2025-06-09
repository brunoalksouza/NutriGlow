import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase-client"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find the subscription record by customer ID
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (subscriptionData) {
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", subscriptionData.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (subscriptionData) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", subscriptionData.id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customerId = subscription.customer as string

          const { data: subscriptionData } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()

          if (subscriptionData) {
            await supabase
              .from("subscriptions")
              .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq("id", subscriptionData.id)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customerId = subscription.customer as string

          const { data: subscriptionData } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()

          if (subscriptionData) {
            await supabase
              .from("subscriptions")
              .update({
                status: subscription.status,
              })
              .eq("id", subscriptionData.id)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

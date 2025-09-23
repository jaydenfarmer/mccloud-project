import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Webhook signature verification failed:", err.message);
      } else {
        console.error("Webhook signature verification failed:", err);
      }
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get the order ID from metadata
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        console.error("No orderId in session metadata");
        return NextResponse.json({ success: true });
      }

      try {
        // Update order status to 'processing' after successful payment
        await pool.query(
          "UPDATE orders SET status = $1, stripe_session_id = $2 WHERE id = $3",
          ["processing", session.id, orderId]
        );

        // Get full order details for email
        const orderResult = await pool.query(
          `
          SELECT 
            o.id,
            o.customer_email,
            o.customer_name,
            o.total_amount,
            o.created_at,
            json_agg(
              json_build_object(
                'product', json_build_object(
                  'name', p.name,
                  'price', oi.price
                ),
                'quantity', oi.quantity
              )
            ) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE o.id = $1
          GROUP BY o.id, o.customer_email, o.customer_name, o.total_amount, o.created_at
        `,
          [orderId]
        );

        if (orderResult.rows.length > 0) {
          const order = orderResult.rows[0];

          const orderForEmail = {
            id: order.id,
            customerEmail: order.customer_email,
            customerName: order.customer_name,
            totalAmount: parseFloat(order.total_amount),
            createdAt: order.created_at,
            items: order.items || [],
            shippingAddress: order.shipping_address || "", // Provide a default or fetch from DB if needed
            status: order.status || "processing", // Provide a default or fetch from DB if needed
          };

          // Send confirmation email (non-blocking)
          sendOrderConfirmation(orderForEmail).catch((error) => {
            console.error("Failed to send confirmation email:", error);
          });

          console.log(`✅ Order ${orderId} payment completed and email sent`);
        }
      } catch (dbError) {
        console.error("Database error in webhook:", dbError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

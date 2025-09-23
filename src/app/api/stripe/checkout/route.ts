import { CartItem } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderConfirmation } from "@/lib/email-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, customerEmail } = body;

    // Create line items for Stripe
    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.category,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add tax and shipping as line items
    const subtotal = items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

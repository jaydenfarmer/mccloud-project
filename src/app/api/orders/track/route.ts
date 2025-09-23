import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { orderId, email } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json(
        { success: false, error: "Order ID and email are required" },
        { status: 400 }
      );
    }

    // Query order with items
    const orderResult = await pool.query(
      `
      SELECT 
        o.id,
        o.customer_email,
        o.customer_name,
        o.total_amount,
        o.status,
        o.created_at,
        o.shipping_address,
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
      WHERE o.id = $1 AND LOWER(o.customer_email) = LOWER($2)
      GROUP BY o.id, o.customer_email, o.customer_name, o.total_amount, o.status, o.created_at, o.shipping_address
    `,
      [orderId, email]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order not found. Please check your Order ID and email address.",
        },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Parse shipping address if it's stored as JSON string
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === "string") {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch {
        // If parsing fails, create a default structure
        shippingAddress = {
          name: "N/A",
          line1: "N/A",
          city: "N/A",
          state: "N/A",
          postal_code: "N/A",
          country: "N/A",
        };
      }
    }

    const orderData = {
      id: order.id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      createdAt: order.created_at,
      items: order.items || [],
      shippingAddress: shippingAddress,
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track order" },
      { status: 500 }
    );
  }
}

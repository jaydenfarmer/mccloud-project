import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, shippingAddress, items, totalAmount } =
      body;

    // Start database transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_email, customer_name, shipping_address, total_amount, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          customerEmail,
          customerName,
          JSON.stringify(shippingAddress),
          totalAmount,
          "pending",
        ]
      );

      const orderId = orderResult.rows[0].id;

      // Add order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product.id, item.quantity, item.product.price]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        orderId: orderId,
        message: "Order created successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}

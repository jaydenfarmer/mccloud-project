import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Query orders for the user with items
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
      WHERE LOWER(o.customer_email) = LOWER($1)
      GROUP BY o.id, o.customer_email, o.customer_name, o.total_amount, o.status, o.created_at, o.shipping_address
      ORDER BY o.created_at DESC
    `,
      [email]
    );

    // Transform the data to match your Order type
    const orders = orderResult.rows.map((row) => ({
      id: row.id,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      createdAt: row.created_at,
      items: row.items || [],
      shippingAddress:
        typeof row.shipping_address === "string"
          ? JSON.parse(row.shipping_address)
          : row.shipping_address,
    }));

    return NextResponse.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

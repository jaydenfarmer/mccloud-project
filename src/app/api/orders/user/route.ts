import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Order, CartItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    // Get orders for this user
    const ordersResult = await pool.query(
      `SELECT 
        o.id,
        o.customer_email,
        o.customer_name,
        o.total_amount,
        o.status,
        o.created_at,
        o.shipping_address
      FROM orders o 
      WHERE o.customer_email = $1 
      ORDER BY o.created_at DESC`,
      [userEmail]
    );

    const orders: Order[] = [];

    // Get order items for each order
    for (const orderRow of ordersResult.rows) {
      const itemsResult = await pool.query(
        `SELECT 
          oi.quantity,
          oi.price,
          p.id,
          p.name,
          p.description,
          p.category,
          p.strain,
          p.stock_quantity,
          p.image_urls,
          p.is_active,
          p.created_at as product_created_at,
          p.updated_at as product_updated_at
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`,
        [orderRow.id]
      );

      const cartItems: CartItem[] = itemsResult.rows.map((item) => ({
        product: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category,
          strain: item.strain,
          stock_quantity: item.stock_quantity,
          image_urls: item.image_urls || [],
          is_active: item.is_active,
          created_at: item.product_created_at,
          updated_at: item.product_updated_at,
        },
        quantity: item.quantity,
      }));

      const order: Order = {
        id: orderRow.id,
        customerEmail: orderRow.customer_email,
        customerName: orderRow.customer_name,
        totalAmount: parseFloat(orderRow.total_amount),
        status: orderRow.status,
        createdAt: orderRow.created_at,
        shippingAddress: JSON.parse(orderRow.shipping_address),
        items: cartItems,
      };

      orders.push(order);
    }

    return NextResponse.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

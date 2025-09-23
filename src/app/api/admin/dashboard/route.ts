import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch dashboard stats
    const [productsResult, ordersResult, revenueResult, recentOrdersResult] =
      await Promise.all([
        // Total products count
        pool.query(
          "SELECT COUNT(*) as count FROM products WHERE is_active = true"
        ),

        // Total orders count
        pool.query("SELECT COUNT(*) as count FROM orders"),

        // Total revenue
        pool.query(
          "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders"
        ),

        // Recent orders (last 5)
        pool.query(`
        SELECT 
          o.id,
          o.customer_email,
          o.customer_name,
          o.total_amount,
          o.status,
          o.created_at,
          o.shipping_address
        FROM orders o 
        ORDER BY o.created_at DESC 
        LIMIT 5
      `),
      ]);

    // Format recent orders
    const recentOrders = await Promise.all(
      recentOrdersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT 
            oi.quantity,
            oi.price,
            p.name,
            p.category
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1`,
          [order.id]
        );

        return {
          id: order.id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          createdAt: order.created_at,
          shippingAddress: JSON.parse(order.shipping_address),
          items: itemsResult.rows.map((item) => ({
            product: {
              id: 0, // We don't need full product data for dashboard
              name: item.name,
              description: "",
              price: parseFloat(item.price),
              category: item.category,
              stock_quantity: 0,
              image_urls: [],
            },
            quantity: item.quantity,
          })),
        };
      })
    );

    const stats = {
      totalProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
      recentOrders: recentOrders,
    };

    return NextResponse.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

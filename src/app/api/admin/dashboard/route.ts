import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

// Verify admin token middleware
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const user = verifyAdminToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🚀 OPTIMIZATION: Run all queries in parallel
    const [statsQuery, recentOrdersQuery, lowStockQuery, categorySalesQuery] =
      await Promise.all([
        // Combined stats query - gets everything in one shot
        pool.query(`
        WITH current_month AS (
          SELECT 
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as current_revenue,
            COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as current_orders,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
          FROM orders 
          WHERE created_at >= date_trunc('month', CURRENT_DATE)
        ),
        prev_month AS (
          SELECT 
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as prev_revenue,
            COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as prev_orders
          FROM orders 
          WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < date_trunc('month', CURRENT_DATE)
        ),
        product_stats AS (
          SELECT COUNT(*) as total_products
          FROM products 
          WHERE is_active = true
        )
        SELECT 
          cm.current_revenue,
          cm.current_orders,
          cm.pending_count,
          pm.prev_revenue,
          pm.prev_orders,
          ps.total_products
        FROM current_month cm
        CROSS JOIN prev_month pm
        CROSS JOIN product_stats ps
      `),

        // Recent orders - separate query since it needs different structure
        pool.query(`
        SELECT 
          id,
          customer_email,
          customer_name,
          total_amount,
          status,
          created_at
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 10
      `),

        // Low stock products
        pool.query(`
        SELECT id, name, stock_quantity as stock, category
        FROM products 
        WHERE stock_quantity < 10 AND is_active = true
        ORDER BY stock_quantity ASC
        LIMIT 10
      `),

        // Category sales
        pool.query(`
        SELECT 
          p.category,
          COUNT(DISTINCT o.id) as orders,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND o.status != 'cancelled'
        GROUP BY p.category
        ORDER BY revenue DESC
        LIMIT 8
      `),
      ]);

    // Extract data from combined stats query
    const statsRow = statsQuery.rows[0];
    const currentRevenue = parseFloat(statsRow?.current_revenue || "0");
    const prevRevenue = parseFloat(statsRow?.prev_revenue || "0");
    const revenueChange =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : 0;

    const currentOrders = parseInt(statsRow?.current_orders || "0");
    const prevOrders = parseInt(statsRow?.prev_orders || "0");
    const ordersChange =
      prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

    // Build response
    const stats = {
      revenue: {
        current: currentRevenue,
        change: Math.round(revenueChange * 100) / 100,
      },
      orders: {
        current: currentOrders,
        change: Math.round(ordersChange * 100) / 100,
      },
      products: parseInt(statsRow?.total_products || "0"),
      pendingOrders: parseInt(statsRow?.pending_count || "0"),
      recentOrders: recentOrdersQuery.rows.map((row) => ({
        id: row.id.toString(),
        customerEmail: row.customer_email,
        customerName: row.customer_name,
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        createdAt: row.created_at,
      })),
      lowStockProducts: lowStockQuery.rows.map((row) => ({
        id: row.id,
        name: row.name,
        stock: row.stock,
        category: row.category,
      })),
      categorySales: categorySalesQuery.rows.map((row) => ({
        category: row.category,
        orders: parseInt(row.orders),
        revenue: parseFloat(row.revenue),
      })),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

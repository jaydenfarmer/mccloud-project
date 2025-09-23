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

// GET - Fetch all orders for admin
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

    // Fetch all orders with items
    const ordersResult = await pool.query(`
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
    `);

    // Fetch order items for each order
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `
          SELECT 
            oi.quantity,
            oi.price,
            p.id as product_id,
            p.name,
            p.description,
            p.category,
            p.strain,
            p.stock_quantity,
            p.image_urls
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `,
          [order.id]
        );

        // Parse shipping address safely
        let shippingAddress;
        try {
          shippingAddress = JSON.parse(order.shipping_address);
        } catch {
          // Fallback if parsing fails
          shippingAddress = {
            name: "Unknown",
            line1: "Unknown",
            line2: "",
            city: "Unknown",
            state: "Unknown",
            postal_code: "Unknown",
            country: "Unknown",
          };
        }

        return {
          id: order.id.toString(), // Convert to string
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          createdAt: order.created_at,
          shippingAddress: shippingAddress,
          items: itemsResult.rows.map((item) => ({
            product: {
              id: item.product_id,
              name: item.name,
              description: item.description,
              price: parseFloat(item.price),
              category: item.category,
              strain: item.strain,
              stock_quantity: item.stock_quantity,
              image_urls: item.image_urls || [],
            },
            quantity: item.quantity,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

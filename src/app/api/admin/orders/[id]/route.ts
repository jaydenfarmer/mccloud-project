import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendOrderStatusUpdate } from "@/lib/email-service";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

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

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin token
    const user = verifyAdminToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update order status
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [
      status,
      id,
    ]);

    // Get full order details for email
    const orderResult = await pool.query(
      `
      SELECT 
        o.id,
        o.customer_email,
        o.customer_name,
        o.total_amount,
        o.created_at,
        o.status,
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
      WHERE o.id = $1
      GROUP BY o.id, o.customer_email, o.customer_name, o.total_amount, o.created_at, o.status, o.shipping_address
    `,
      [id]
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
        shippingAddress: order.shipping_address || "",
        status: status,
      };

      // Send status update email for shipped/delivered (non-blocking)
      if (status === "shipped" || status === "delivered") {
        sendOrderStatusUpdate(orderForEmail, status).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

      console.log(`✅ Order ${id} status updated to ${status}`);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

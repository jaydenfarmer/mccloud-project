import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1 AND is_active = true",
      [productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        strain: product.strain,
        stock_quantity: product.stock_quantity,
        image_urls: product.image_urls || [],
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

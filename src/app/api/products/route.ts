import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC"
    );

    const products = result.rows.map((product) => ({
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
    }));

    return NextResponse.json({
      success: true,
      products: products, // Change from 'data' to 'products'
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

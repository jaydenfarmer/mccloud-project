import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/products - Get all products from database
export async function GET(request: NextRequest) {
  try {
    // Debug: Check if DATABASE_URL is loaded
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "DATABASE_URL starts with:",
      process.env.DATABASE_URL?.substring(0, 20)
    );

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = "SELECT * FROM products WHERE is_active = true";
    const params: string[] = [];

    if (category) {
      query += " AND category = $1";
      params.push(category);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Full database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}

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

// GET - Fetch all products for admin
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

    // Fetch all products (including inactive ones for admin)
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
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
      products: products,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Starting product creation...");

    // Verify admin token
    const user = verifyAdminToken(request);
    if (!user) {
      console.log("❌ Unauthorized - invalid token");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("✅ Admin token verified");

    const body = await request.json();
    console.log("📦 Request body:", body);

    const {
      name,
      description,
      price,
      category,
      strain,
      stock_quantity,
      image_urls,
      is_active,
    } = body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      stock_quantity === undefined
    ) {
      console.log("❌ Missing required fields:", {
        name,
        description,
        price,
        category,
        stock_quantity,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("✅ Validation passed");

    console.log("🗄️ Inserting into database...");
    // Insert new product
    const result = await pool.query(
      `INSERT INTO products (
        name, description, price, category, strain, 
        stock_quantity, image_urls, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        name,
        description,
        parseFloat(price),
        category,
        strain || null,
        parseInt(stock_quantity),
        image_urls || [],
        is_active !== false, // Default to true
      ]
    );
    console.log("✅ Database insert successful:", result.rows[0]);

    const newProduct = result.rows[0];

    return NextResponse.json({
      success: true,
      product: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        strain: newProduct.strain,
        stock_quantity: newProduct.stock_quantity,
        image_urls: newProduct.image_urls || [],
        is_active: newProduct.is_active,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at,
      },
    });
  } catch (error) {
    console.error("💥 Error creating product:", error);

    // Type-safe error handling
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    // For PostgreSQL errors specifically
    interface PgError extends Error {
      code?: string;
    }
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as PgError;
      console.error("Database error code:", dbError.code);
    }

    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

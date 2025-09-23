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

// GET - Fetch single product for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);

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

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      price,
      category,
      strain,
      stock_quantity,
      image_urls,
      is_active,
    } = await request.json();

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      stock_quantity === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update product
    const result = await pool.query(
      `UPDATE products SET 
        name = $1, 
        description = $2, 
        price = $3, 
        category = $4, 
        strain = $5,
        stock_quantity = $6, 
        image_urls = $7, 
        is_active = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 
      RETURNING *`,
      [
        name,
        description,
        parseFloat(price),
        category,
        strain || null,
        parseInt(stock_quantity),
        JSON.stringify(image_urls || []),
        is_active !== false,
        productId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = result.rows[0];

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: parseFloat(updatedProduct.price),
        category: updatedProduct.category,
        strain: updatedProduct.strain,
        stock_quantity: updatedProduct.stock_quantity,
        image_urls: updatedProduct.image_urls || [],
        is_active: updatedProduct.is_active,
        created_at: updatedProduct.created_at,
        updated_at: updatedProduct.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const checkResult = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Instead of hard delete, we'll soft delete by setting is_active = false
    // This preserves order history
    await pool.query(
      "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [productId]
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

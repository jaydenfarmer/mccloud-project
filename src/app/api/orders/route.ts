import { NextRequest, NextResponse } from "next/server";

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For now, just return success with order details
    const fakeOrder = {
      id: Math.floor(Math.random() * 1000),
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: fakeOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}

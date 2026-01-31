import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET all stocks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stocks = await convex.query(api.stock.getByUserId, { user_id: userId });
    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
}

// POST create a new stock
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_name, quantity, stock_count, unit, price } = body;

    if (
      !product_name ||
      quantity === undefined ||
      stock_count === undefined ||
      !unit ||
      price === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: product_name, quantity, stock_count, unit, price" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const stockId = await convex.mutation(api.stock.create, {
      product_name,
      user_id: userId,
      created_at: now,
      updated_at: now,
      quantity,
      stock_count,
      unit,
      price,
    });

    return NextResponse.json({ id: stockId }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json({ error: "Failed to create stock" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET a single stock by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const stock = await convex.query(api.stock.getById, {
      id: id as Id<"stocks">,
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Verify user owns this stock
    if (stock.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

// PUT update a stock
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { product_name, quantity, stock_count, unit, price } = body;

    // First verify the stock exists and belongs to user
    const existingStock = await convex.query(api.stock.getById, {
      id: id as Id<"stocks">,
    });

    if (!existingStock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    if (existingStock.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation(api.stock.update, {
      id: id as Id<"stocks">,
      product_name,
      quantity,
      stock_count,
      unit,
      price,
      updated_at: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

// DELETE a stock
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First verify the stock exists and belongs to user
    const existingStock = await convex.query(api.stock.getById, {
      id: id as Id<"stocks">,
    });

    if (!existingStock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    if (existingStock.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation(api.stock.remove, {
      id: id as Id<"stocks">,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json({ error: "Failed to delete stock" }, { status: 500 });
  }
}

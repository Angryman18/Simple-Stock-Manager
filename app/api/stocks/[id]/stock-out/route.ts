import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST stock-out operation - decreases stock and creates history entry
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, notes } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    // Verify stock exists and belongs to user
    const stock = await convex.query(api.stock.getById, {
      id: id as Id<"stocks">,
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    if (stock.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if there's enough stock
    if (stock.stock_count < quantity) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          available: stock.stock_count,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Update stock count
    await convex.mutation(api.stock.updateStockCount, {
      id: id as Id<"stocks">,
      stock_count: stock.stock_count - quantity,
      updated_at: now,
    });

    // Create history entry
    const historyId = await convex.mutation(api.stock_history.create, {
      product_id: id as Id<"stocks">,
      user_id: userId,
      created_at: now,
      change_type: "STOCK_OUT",
      quantity,
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      new_stock_count: stock.stock_count - quantity,
      history_id: historyId,
    });
  } catch (error) {
    console.error("Error processing stock-out:", error);
    return NextResponse.json({ error: "Failed to process stock-out" }, { status: 500 });
  }
}

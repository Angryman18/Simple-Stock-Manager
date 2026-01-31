import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET all stock history for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if product_id query param is provided
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let history;
    if (productId) {
      history = await convex.query(api.stock_history.getByProductId, {
        product_id: productId as Id<"stocks">,
        user_id: userId,
      });
    } else {
      history = await convex.query(api.stock_history.getByUserId, {
        user_id: userId,
      });
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching stock history:", error);
    return NextResponse.json({ error: "Failed to fetch stock history" }, { status: 500 });
  }
}

// POST create a new stock history entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, change_type, quantity, notes } = body;

    if (!product_id || !change_type || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, change_type, quantity" },
        { status: 400 }
      );
    }

    if (change_type !== "STOCK_IN" && change_type !== "STOCK_OUT") {
      return NextResponse.json(
        { error: "change_type must be 'STOCK_IN' or 'STOCK_OUT'" },
        { status: 400 }
      );
    }

    const historyId = await convex.mutation(api.stock_history.create, {
      product_id: product_id as Id<"stocks">,
      user_id: userId,
      created_at: Date.now(),
      change_type,
      quantity,
      notes: notes || null,
    });

    return NextResponse.json({ id: historyId }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock history:", error);
    return NextResponse.json({ error: "Failed to create stock history" }, { status: 500 });
  }
}

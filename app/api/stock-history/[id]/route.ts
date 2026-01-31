import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET a single stock history entry by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const historyEntry = await convex.query(api.stock_history.getById, {
      id: id as Id<"stock_history">,
    });

    if (!historyEntry) {
      return NextResponse.json({ error: "Stock history entry not found" }, { status: 404 });
    }

    // Verify user owns this entry
    if (historyEntry.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(historyEntry);
  } catch (error) {
    console.error("Error fetching stock history entry:", error);
    return NextResponse.json({ error: "Failed to fetch stock history entry" }, { status: 500 });
  }
}

// PUT update a stock history entry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, notes } = body;

    // First verify the entry exists and belongs to user
    const existingEntry = await convex.query(api.stock_history.getById, {
      id: id as Id<"stock_history">,
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Stock history entry not found" }, { status: 404 });
    }

    if (existingEntry.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation(api.stock_history.update, {
      id: id as Id<"stock_history">,
      quantity,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating stock history entry:", error);
    return NextResponse.json({ error: "Failed to update stock history entry" }, { status: 500 });
  }
}

// DELETE a stock history entry
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

    // First verify the entry exists and belongs to user
    const existingEntry = await convex.query(api.stock_history.getById, {
      id: id as Id<"stock_history">,
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Stock history entry not found" }, { status: 404 });
    }

    if (existingEntry.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation(api.stock_history.remove, {
      id: id as Id<"stock_history">,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock history entry:", error);
    return NextResponse.json({ error: "Failed to delete stock history entry" }, { status: 500 });
  }
}

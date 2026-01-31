import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all stock history
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stock_history").collect();
  },
});

// Get stock history by user ID
export const getByUserId = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stock_history")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .order("desc")
      .collect();
  },
});

// Get stock history by product ID and user ID
export const getByProductId = query({
  args: {
    product_id: v.id("stocks"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stock_history")
      .filter((q) =>
        q.and(q.eq(q.field("product_id"), args.product_id), q.eq(q.field("user_id"), args.user_id))
      )
      .order("desc")
      .collect();
  },
});

// Get a single stock history entry by ID
export const getById = query({
  args: { id: v.id("stock_history") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new stock history entry
export const create = mutation({
  args: {
    product_id: v.id("stocks"),
    user_id: v.string(),
    created_at: v.number(),
    change_type: v.union(v.literal("STOCK_IN"), v.literal("STOCK_OUT")),
    quantity: v.number(),
    notes: v.nullable(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stock_history", args);
  },
});

// Update a stock history entry
export const update = mutation({
  args: {
    id: v.id("stock_history"),
    quantity: v.optional(v.number()),
    notes: v.optional(v.nullable(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Delete a stock history entry
export const remove = mutation({
  args: { id: v.id("stock_history") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// convex/schema.ts - Combined schema for all tables
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stocks: defineTable({
    product_name: v.string(),
    user_id: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
    quantity: v.number(),
    stock_count: v.number(),
    unit: v.string(),
    price: v.number(),
  }),
  stock_history: defineTable({
    product_id: v.id("stocks"),
    user_id: v.string(),
    created_at: v.number(),
    change_type: v.union(v.literal("STOCK_IN"), v.literal("STOCK_OUT")),
    quantity: v.number(),
    notes: v.nullable(v.string()),
  }),
});

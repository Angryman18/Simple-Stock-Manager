// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stock_history: defineTable({
    product_id: v.id("stocks"),
    user_id: v.string(),
    created_at: v.number(),
    change_type: v.union(v.literal("STOCK_IN"), v.literal("STOCK_OUT")),
    quantity: v.number(),
    notes: v.nullable(v.string()),
  }),
});

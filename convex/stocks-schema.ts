// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    product_name: v.string(),
    user_id: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
    quantity: v.number(),
    stock_count: v.number(),
  }),
});


import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  todos: defineTable({
    userId: v.id("users"),
    text: v.string(),
    completed: v.boolean(),
  }),
  documents: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    name: v.string(),
  }),
  chatHistory: defineTable({
    userId: v.id("users"),
    message: v.string(),
    isViewer: v.boolean(),
  }),
});

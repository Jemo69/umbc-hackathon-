
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDocuments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const addDocument = mutation({
  args: { storageId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.insert("documents", {
      userId: user._id,
      storageId: args.storageId,
      name: args.name,
    });
  },
});

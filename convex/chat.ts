
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getChatHistory = query({
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
      .query("chatHistory")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const addChatMessage = mutation({
  args: { message: v.string(), isViewer: v.boolean() },
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

    await ctx.db.insert("chatHistory", {
      userId: user._id,
      message: args.message,
      isViewer: args.isViewer,
    });
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper: get or create the current authenticated user
async function getOrCreateCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (user) return user;

  const newUser: any = { tokenIdentifier: identity.tokenIdentifier };
  if (identity.name) newUser.name = identity.name;
  if (identity.email) newUser.email = identity.email;
  const userId = await ctx.db.insert("users", newUser);
  return await ctx.db.get(userId);
}

export const getTasks = query({
  args: {
    completed: v.optional(v.boolean()),
    subject: v.optional(v.string()),
    sortByDueDate: v.optional(v.boolean()),
    sortByPriority: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    let tasks = ctx.db
      .query("todos")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));

    if (args.completed !== undefined) {
      tasks = tasks.filter((q) => q.eq(q.field("completed"), args.completed));
    }
    if (args.subject !== undefined) {
      tasks = tasks.filter((q) => q.eq(q.field("subject"), args.subject));
    }

    let result = await tasks.collect();

    if (args.sortByDueDate) {
      result.sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity));
    } else if (args.sortByPriority) {
      result.sort(
        (a, b) =>
          (b.priorityScore || -Infinity) - (a.priorityScore || -Infinity)
      );
    }

    return result;
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    estimatedEffort: v.optional(v.number()),
    subject: v.optional(v.string()),
    priorityScore: v.optional(v.number()),
    documentRef: v.optional(v.id("documents")),
    context: v.optional(v.string()),
    isGeneratedByAI: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const taskId = await ctx.db.insert("todos", {
      userId: user._id,
      title: args.title,
      description: args.description,
      completed: false, // New tasks are not completed by default
      dueDate: args.dueDate,
      estimatedEffort: args.estimatedEffort,
      subject: args.subject,
      priorityScore: args.priorityScore,
      documentRef: args.documentRef,
      context: args.context,
      isGeneratedByAI: args.isGeneratedByAI || false,
    });
    return taskId;
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    dueDate: v.optional(v.number()),
    estimatedEffort: v.optional(v.number()),
    subject: v.optional(v.string()),
    priorityScore: v.optional(v.number()),
    documentRef: v.optional(v.id("documents")),
    context: v.optional(v.string()),
    isGeneratedByAI: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const { id, ...rest } = args;

    const existingTask = await ctx.db.get(id);
    if (!existingTask || existingTask.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.patch(id, rest);
  },
});

export const deleteTask = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const existingTask = await ctx.db.get(args.id);
    if (!existingTask || existingTask.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper function to get or create a demo user
async function getDemoUser(ctx: any) {
  // For demo purposes, use a fixed user ID
  const demoUserId = "demo-user-123";

  let user = await ctx.db.get(demoUserId as any);
  if (!user) {
    // Create a demo user if it doesn't exist
    user = {
      _id: demoUserId as any,
      name: "Demo Student",
      email: "demo@edutron.com",
      tokenIdentifier: "demo-token",
      _creationTime: Date.now(),
    };
    await ctx.db.insert("users", user);
  }
  return user;
}

export const getTasks = query({
  args: {
    completed: v.optional(v.boolean()),
    subject: v.optional(v.string()),
    sortByDueDate: v.optional(v.boolean()),
    sortByPriority: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

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
    const user = await getDemoUser(ctx);

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
    const user = await getDemoUser(ctx);
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
    const user = await getDemoUser(ctx);

    const existingTask = await ctx.db.get(args.id);
    if (!existingTask || existingTask.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

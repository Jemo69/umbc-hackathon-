import { v } from "convex/values";
import { withUserQuery, withUserMutation } from "./utils";
import { type Doc } from "./_generated/dataModel";


export const getTasks = withUserQuery({
  args: {
    completed: v.optional(v.boolean()),
    subject: v.optional(v.string()),
    sortByDueDate: v.optional(v.boolean()),
    sortByPriority: v.optional(v.boolean()),
  },
  handler: async (ctx, args, user) => {
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

export const createTask = withUserMutation({
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
  handler: async (ctx, args, user) => {
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

export const updateTask = withUserMutation({
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
  handler: async (ctx, args, user) => {
    const { id, ...rest } = args;

    const existingTask = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("_id"), id))
      .first();
    if (!existingTask || existingTask.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.patch(id, rest);
  },
});

export const deleteTask = withUserMutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args, user) => {
    const existingTask = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    if (!existingTask || existingTask.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

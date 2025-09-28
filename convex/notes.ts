import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const getNotes = query({
  args: {
    subject: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    let notes = ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));

    if (args.subject) {
      notes = notes.filter((q) => q.eq(q.field("subject"), args.subject));
    }

    let result = await notes.collect();

    // Sort by updatedAt descending (most recent first)
    result.sort((a, b) => b.updatedAt - a.updatedAt);

    if (args.limit) {
      result = result.slice(0, args.limit);
    }

    return result;
  },
});

export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const note = await ctx.db.get(args.noteId);

    if (!note || note.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    return note;
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subject: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    documentRef: v.optional(v.id("documents")),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const now = Date.now();

    const noteId = await ctx.db.insert("notes", {
      userId: user._id,
      title: args.title,
      content: args.content,
      subject: args.subject,
      tags: args.tags || [],
      documentRef: args.documentRef,
      context: args.context,
      createdAt: now,
      updatedAt: now,
    });

    return noteId;
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subject: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    documentRef: v.optional(v.id("documents")),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const { noteId, ...updates } = args;

    const existingNote = await ctx.db.get(noteId);
    if (!existingNote || existingNote.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const existingNote = await ctx.db.get(args.noteId);
    if (!existingNote || existingNote.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.delete(args.noteId);
  },
});

export const searchNotes = query({
  args: {
    query: v.string(),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    let notes = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.subject) {
      notes = notes.filter((note) => note.subject === args.subject);
    }

    // Simple text search - in production, use a proper search engine
    const searchQuery = args.query.toLowerCase();
    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
    );

    // Sort by relevance (title matches first, then content)
    filteredNotes.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchQuery);
      const bTitleMatch = b.title.toLowerCase().includes(searchQuery);

      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return b.updatedAt - a.updatedAt; // Then by recency
    });

    return filteredNotes;
  },
});

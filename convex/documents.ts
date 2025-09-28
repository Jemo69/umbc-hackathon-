import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const getDocuments = query({
  handler: async (ctx) => {
    const user = await getDemoUser(ctx);

    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const addDocument = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    type: v.optional(v.string()),
    size: v.optional(v.number()),
    subject: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    const documentId = await ctx.db.insert("documents", {
      userId: user._id,
      storageId: args.storageId,
      name: args.name,
      type: args.type || "pdf",
      uploadedAt: Date.now(),
      analysisStatus: "pending",
      extractedData: {
        summary: undefined,
        assignments: [],
        keyConcepts: [],
        deadlines: [],
        studyQuestions: [],
      },
      subject: args.subject,
      tags: args.tags || [],
      size: args.size,
    });

    // Start analysis process (simulated)
    await simulateDocumentAnalysis(ctx, documentId);

    return documentId;
  },
});

// Simulate document analysis
async function simulateDocumentAnalysis(ctx: any, documentId: any) {
  // Update status to processing
  await ctx.db.patch(documentId, {
    analysisStatus: "processing",
  });

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock extracted data
  const mockExtractedData = {
    summary:
      "This document covers advanced calculus concepts including derivatives, integrals, and their applications in real-world problems. Key topics include chain rule, product rule, and fundamental theorem of calculus.",
    assignments: [
      {
        title: "Calculus Problem Set 5",
        description:
          "Complete problems 1-20 covering derivatives and applications",
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
        priority: 8,
      },
      {
        title: "Integration Practice",
        description: "Practice integration techniques with provided exercises",
        dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 2 weeks from now
        priority: 6,
      },
    ],
    keyConcepts: [
      "Chain Rule",
      "Product Rule",
      "Quotient Rule",
      "Fundamental Theorem of Calculus",
      "Integration by Parts",
      "Substitution Method",
    ],
    deadlines: [
      {
        title: "Midterm Exam",
        date: Date.now() + 21 * 24 * 60 * 60 * 1000, // 3 weeks from now
        type: "exam",
      },
      {
        title: "Final Project Due",
        date: Date.now() + 42 * 24 * 60 * 60 * 1000, // 6 weeks from now
        type: "assignment",
      },
    ],
    studyQuestions: [
      {
        question: "What is the chain rule and when is it used?",
        answer:
          "The chain rule is used to differentiate composite functions. It states that if f(x) = g(h(x)), then f'(x) = g'(h(x)) * h'(x).",
        difficulty: "medium",
      },
      {
        question: "How do you find the derivative of x^2 * sin(x)?",
        answer:
          "Use the product rule: d/dx[x^2 * sin(x)] = 2x * sin(x) + x^2 * cos(x)",
        difficulty: "medium",
      },
    ],
  };

  // Update document with extracted data
  await ctx.db.patch(documentId, {
    analysisStatus: "completed",
    extractedData: mockExtractedData,
  });
}

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    const document = await ctx.db.get(args.documentId);

    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or unauthorized");
    }

    return document;
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or unauthorized");
    }

    const { documentId, ...updates } = args;
    await ctx.db.patch(documentId, updates);
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or unauthorized");
    }

    await ctx.db.delete(args.documentId);
  },
});

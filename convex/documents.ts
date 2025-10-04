import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getOrCreateUser } from "./utils";

export const getDocuments = query({
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);

    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

// Store analysis result
export const setDocumentAnalysis = mutation({
  args: {
    documentId: v.id("documents"),
    analysisStatus: v.string(),
    extractedData: v.object({
      summary: v.optional(v.string()),
      assignments: v.optional(
        v.array(
          v.object({
            title: v.string(),
            description: v.optional(v.string()),
            dueDate: v.optional(v.number()),
            priority: v.optional(v.number()),
          })
        )
      ),
      keyConcepts: v.optional(v.array(v.string())),
      deadlines: v.optional(
        v.array(
          v.object({ title: v.string(), date: v.number(), type: v.string() })
        )
      ),
      studyQuestions: v.optional(
        v.array(
          v.object({
            question: v.string(),
            answer: v.optional(v.string()),
            difficulty: v.optional(v.string()),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await getOrCreateUser(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or unauthorized");
    }
    const status = args.analysisStatus as "completed" | "pending" | "processing" | "failed";
    await ctx.db.patch(args.documentId, {
      analysisStatus: status,
      extractedData: args.extractedData,
    });
  },
});

// Action: process a document with OpenAI and store results
export const processDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Ensure user exists and owns the doc
    await getOrCreateUser(ctx);
    const document = await ctx.runQuery(api.documents.getDocument, {
      documentId: args.documentId,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // If no key, leave existing mock and exit
      return;
    }

    const prompt = `Analyze the following document metadata and output JSON only with keys: summary (string), assignments (array of {title, description, dueDateEpochMs, priority}), keyConcepts (array of string), deadlines (array of {title, dateEpochMs, type}), studyQuestions (array of {question, answer, difficulty}). Document: name=${document.name}, type=${document.type||"unknown"}, subject=${document.subject||""}, tags=${(document.tags||[]).join(', ')}.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Return only valid minified JSON with the exact keys requested. No prose." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content || "{}";
      let parsed: any;
      try { parsed = JSON.parse(content); } catch { parsed = {}; }

      const extractedData = {
        summary: parsed.summary || undefined,
        assignments: Array.isArray(parsed.assignments)
          ? parsed.assignments.map((a: any) => ({
              title: String(a.title || "Assignment"),
              description: a.description ? String(a.description) : undefined,
              dueDate: a.dueDateEpochMs ? Number(a.dueDateEpochMs) : undefined,
              priority: a.priority ? Number(a.priority) : undefined,
            }))
          : [],
        keyConcepts: Array.isArray(parsed.keyConcepts)
          ? parsed.keyConcepts.map((k: any) => String(k))
          : [],
        deadlines: Array.isArray(parsed.deadlines)
          ? parsed.deadlines.map((d: any) => ({
              title: String(d.title || "Deadline"),
              date: Number(d.dateEpochMs || Date.now()),
              type: String(d.type || "general"),
            }))
          : [],
        studyQuestions: Array.isArray(parsed.studyQuestions)
          ? parsed.studyQuestions.map((q: any) => ({
              question: String(q.question || "Question"),
              answer: q.answer ? String(q.answer) : undefined,
              difficulty: q.difficulty ? String(q.difficulty) : undefined,
            }))
          : [],
      };

      await ctx.runMutation(api.documents.setDocumentAnalysis, {
        documentId: args.documentId,
        analysisStatus: "completed",
        extractedData,
      });
    } catch (err) {
      await ctx.runMutation(api.documents.setDocumentAnalysis, {
        documentId: args.documentId,
        analysisStatus: "failed",
        extractedData: {
          summary: undefined,
          assignments: [],
          keyConcepts: [],
          deadlines: [],
          studyQuestions: [],
        },
      });
    }
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
    const user = await getOrCreateUser(ctx);

    const documentId = await ctx.db.insert("documents", {
      userId: user._id,
      storageId: args.storageId,
      name: args.name,
      type: args.type || "pdf",
      uploadedAt: Date.now(),
      analysisStatus: "processing",
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

    return documentId;
  },
});

// (Removed mock simulateDocumentAnalysis; real analysis is performed by processDocument action)

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

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
    const user = await getOrCreateUser(ctx);

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
    const user = await getOrCreateUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or unauthorized");
    }

    await ctx.db.delete(args.documentId);
  },
});
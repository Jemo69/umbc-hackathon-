import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Helper: get or create the current authenticated user
async function getOrCreateCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // If running in a query/mutation context (has db), use direct DB access
  if (ctx.db) {
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user) return user;

    const newUser: any = { tokenIdentifier: identity.tokenIdentifier };
    if (identity.name) newUser.name = identity.name;
    if (identity.email) newUser.email = identity.email;
    const userId = await ctx.db.insert("users", newUser);
    return await ctx.db.get(userId);
  }

  // If running in an action context (no db), use runMutation/runQuery
  if (ctx.runQuery && ctx.runMutation) {
    await ctx.runMutation(api.users.store);
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user) {
      throw new Error("User not found after store");
    }
    return user;
  }

  throw new Error("Unsupported context for getOrCreateCurrentUser");
}

// Safe helper for queries that can run before auth is ready
async function getCurrentUserOrNull(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  if (ctx.db) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  }
  return null;
}

export const getChatHistory = query({
  args: { sessionId: v.optional(v.id("chatSessions")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return [];

    let q = ctx.db
      .query("chatHistory")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));
    if (args.sessionId) {
      q = ctx.db
        .query("chatHistory")
        .withIndex("by_userId_sessionId", (q) =>
          q.eq("userId", user._id).eq("sessionId", args.sessionId!),
        );
    }

    const items = await q.order("desc").take(200);
    return items.reverse();
  },
});

// Clear all messages for a session (keep the session row)
export const clearChatSessionMessages = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id)
      throw new Error("Unauthorized");

    const msgs = await ctx.db
      .query("chatHistory")
      .withIndex("by_userId_sessionId", (q) =>
        q.eq("userId", user._id).eq("sessionId", args.sessionId),
      )
      .collect();
    for (const m of msgs) {
      await ctx.db.delete(m._id);
    }

    // Reset session metadata
    await ctx.db.patch(args.sessionId, {
      lastMessageAt: undefined,
      lastMessagePreview: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Chat sessions APIs
export const getChatSessions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Fetch a session only if it belongs to the current user
export const getSession = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return null;
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) return null;
    return session;
  },
});

export const createChatSession = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const now = Date.now();
    const title = (args.title?.trim() || "New chat").slice(0, 80);
    return await ctx.db.insert("chatSessions", {
      userId: user._id,
      title,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: undefined,
      lastMessagePreview: undefined,
    });
  },
});

export const renameChatSession = mutation({
  args: { sessionId: v.id("chatSessions"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id)
      throw new Error("Unauthorized");
    await ctx.db.patch(args.sessionId, {
      title: args.title.slice(0, 80),
      updatedAt: Date.now(),
    });
  },
});

export const deleteChatSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id)
      throw new Error("Unauthorized");

    // Delete all messages in this session
    const msgs = await ctx.db
      .query("chatHistory")
      .withIndex("by_userId_sessionId", (q) =>
        q.eq("userId", user._id).eq("sessionId", args.sessionId),
      )
      .collect();
    for (const m of msgs) {
      await ctx.db.delete(m._id);
    }
    // Delete the session
    await ctx.db.delete(args.sessionId);
  },
});

export const addChatMessage = mutation({
  args: {
    message: v.string(),
    isViewer: v.boolean(),
    sessionId: v.optional(v.id("chatSessions")),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("tool_call"),
        v.literal("tool_result"),
      ),
    ),
    toolCalls: v.optional(
      v.array(
        v.object({
          functionName: v.string(),
          arguments: v.string(),
          result: v.optional(v.string()),
        }),
      ),
    ),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    await ctx.db.insert("chatHistory", {
      userId: user._id,
      sessionId: args.sessionId,
      message: args.message,
      isViewer: args.isViewer,
      timestamp: Date.now(),
      messageType: args.messageType || "text",
      toolCalls: args.toolCalls,
      context: args.context,
    });
  },
});

// AI Chat with tool calling capabilities
export const sendChatMessage = action({
  args: { message: v.string(), sessionId: v.optional(v.id("chatSessions")) },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    // Ensure a session exists (auto-create if not provided)
    let sessionId = args.sessionId;
    // If a sessionId was provided, verify ownership; otherwise ignore it
    if (sessionId) {
      const owned = await ctx.runQuery(api.chat.getSession, { sessionId });
      if (!owned) {
        sessionId = undefined;
      }
    }
    if (!sessionId) {
      const preview = args.message.slice(0, 60);
      sessionId = await ctx.runMutation(api.chat.createChatSession, {
        title: preview,
      });
    }

    // Add user message to chat history
    await ctx.runMutation(api.chat.addChatMessage, {
      message: args.message,
      isViewer: true,
      sessionId,
      messageType: "text",
    });

    // Generate AI response using OpenAI
    const aiResponse = await generateAIResponse(args.message, ctx);

    // Add AI response to chat history
    await ctx.runMutation(api.chat.addChatMessage, {
      message: aiResponse.message,
      isViewer: false,
      sessionId,
      messageType: aiResponse.messageType,
      toolCalls: aiResponse.toolCalls,
      context: aiResponse.context,
    });

    // If AI requested tool calls, execute them on the server and store results
    if (
      aiResponse.messageType === "tool_call" &&
      aiResponse.toolCalls?.length
    ) {
      for (const tool of aiResponse.toolCalls) {
        try {
          const parsed = JSON.parse(tool.arguments || "{}");
          let result: any = null;
          if (tool.functionName === "addTask") {
            result = await ctx.runMutation(api.todos.createTask, {
              title: parsed.title || "New Task",
              description: parsed.description,
              dueDate: parsed.dueDate,
              estimatedEffort: parsed.estimatedTime,
              subject: parsed.subject,
              priorityScore: parsed.priority,
              documentRef: parsed.documentRef,
              context: parsed.context,
              isGeneratedByAI: true,
            });
          } else if (tool.functionName === "addNote") {
            result = await ctx.runMutation(api.notes.createNote, {
              title: parsed.title || "New Note",
              content: parsed.content || parsed.context || "",
              subject: parsed.subject,
              tags: parsed.tags || [],
              documentRef: parsed.documentRef,
              context: parsed.context,
            });
          }

          // Store tool_result message
          await ctx.runMutation(api.chat.addChatMessage, {
            message: result
              ? `Tool ${tool.functionName} executed successfully.`
              : `Tool ${tool.functionName} executed.`,
            isViewer: false,
            sessionId,
            messageType: "tool_result",
            toolCalls: [
              {
                functionName: tool.functionName,
                arguments: JSON.stringify(parsed),
                result: JSON.stringify({ id: result }),
              },
            ],
            context: aiResponse.context,
          });
        } catch (e: any) {
          await ctx.runMutation(api.chat.addChatMessage, {
            message: `Tool ${tool.functionName} failed: ${e?.message || e}`,
            isViewer: false,
            sessionId,
            messageType: "tool_result",
            toolCalls: [
              {
                functionName: tool.functionName,
                arguments: tool.arguments || "{}",
                result: JSON.stringify({ error: true }),
              },
            ],
            context: aiResponse.context,
          });
        }
      }
    }

    // Update chat session metadata
    const now = Date.now();
    await ctx.runMutation(api.chat.updateChatSessionMeta, {
      sessionId: sessionId!,
      lastMessageAt: now,
      lastMessagePreview: aiResponse.message.slice(0, 120),
    });

    return { ...aiResponse, sessionId };
  },
});

export const updateChatSessionMeta = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id)
      throw new Error("Unauthorized");
    await ctx.db.patch(args.sessionId, {
      updatedAt: Date.now(),
      lastMessageAt: args.lastMessageAt,
      lastMessagePreview: args.lastMessagePreview,
    });
  },
});

// AI response generation with OpenRouter or OpenAI
async function generateAIResponse(userMessage: string, ctx: any) {
  const openrouterkey = process.env.openrouter_api_key;
  const openaiapikey = process.env.openai_api_key;
  const hasopenrouter = !!openrouterkey;
  const hasopenai = !!openaiapikey;
  if (!hasopenrouter && !hasopenai) {
    return {
      message:
        "no ai api key configured. set openrouter_api_key (preferred) or openai_api_key to enable ai responses.",
      messagetype: "text" as const,
      toolcalls: undefined,
      context: usermessage,
    };
  }

  // basic system prompt tailored to this app
  const systemprompt =
    "you are edutron, an ai study assistant. be concise and helpful. you can suggest creating tasks or notes. keep responses student-friendly.";

  // 1) lightweight intent detection for tool calls (no api call needed)
  const msg = usermessage.tolowercase();
  if (
    msg.includes("add task") ||
    msg.includes("create task") ||
    msg.includes("remind me") ||
    msg.includes("make a task") ||
    msg.includes("new task") ||
    msg.includes("todo") ||
    msg.includes("to-do") ||
    msg.includes("assignment") ||
    msg.includes("homework") ||
    (msg.includes("add") && msg.includes("task"))
  ) {
    const tasktitle = extracttasktitle(usermessage);
    const duedate = extractduedate(usermessage);
    const toolcalls = [
      {
        functionname: "addtask",
        arguments: json.stringify({
          title: tasktitle,
          duedate: duedate,
          estimatedtime: 60,
          context: usermessage,
        }),
      },
    ];

    return {
      message: `i've added "${tasktitle}" to your task list${
        duedate
          ? ` with a due date of ${new date(duedate).tolocaledatestring()}`
          : ""
      }. want to set a subject or priority?`,
      messagetype: "tool_call" as const,
      toolcalls,
      context: usermessage,
    };
  }

  if (
    msg.includes("save") ||
    msg.includes("note") ||
    msg.includes("remember")
  ) {
    const notetitle = extractnotetitle(usermessage);
    const notecontent = extractnotecontent(usermessage);
    const toolcalls = [
      {
        functionname: "addnote",
        arguments: json.stringify({
          title: notetitle,
          content: notecontent,
          context: usermessage,
        }),
      },
    ];

    return {
      message: `saved a note titled "${notetitle}".`,
      messagetype: "tool_call" as const,
      toolcalls,
      context: usermessage,
    };
  }

  // 2) otherwise, call openai for a general helpful response
  try {
    const useopenrouter = hasopenrouter && process.env.openrouter_api_key;
    const model = "x-ai/grok-4-fast:free";

    const url = useopenrouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

    const headers: record<string, string> = {
      "content-type": "application/json",
      authorization: `bearer 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`,
    };
    // optional but recommended for openrouter:
    if (useopenrouter) {
      headers["http-referer"] = process.env.site_url || "http://localhost";
      headers["x-title"] = process.env.site_name || "edutron";
    }

    // if (!useopenrouter && !hasopenai) {
    //   return {
    //     message:
    //       "no ai api key configured. set openrouter_api_key (preferred) or openai_api_key to enable ai responses.",
    //     messagetype: "text" as const,
    //     toolcalls: undefined,
    //     context: usermessage,
    //   };
    // }

    const res = await fetch(url, {
      method: "post",
      headers,
      body: json.stringify({
        model,
        messages: [
          { role: "system", content: systemprompt },
          { role: "user", content: usermessage },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      throw new error(`openai error ${res.status}`);
    }
    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ||
      "i'm here to help with your studies!";

    return {
      message: content,
      messageType: "text" as const,
      toolCalls: undefined,
      context: userMessage,
    };
  } catch (err) {
    return {
      message:
        "I had trouble contacting the AI service. Please try again in a moment.",
      messageType: "text" as const,
      toolCalls: undefined,
      context: userMessage,
    };
  }
}

// Helper functions for text extraction
function extractTaskTitle(message: string): string {
  // Simple extraction - in production, use more sophisticated NLP
  const words = message.split(" ");
  const taskWords = words.filter(
    (word) =>
      !["add", "create", "task", "remind", "me", "to", "about"].includes(
        word.toLowerCase(),
      ),
  );
  return taskWords.join(" ") || "New Task";
}

function extractDueDate(message: string): number | undefined {
  // Simple date extraction - in production, use a proper date parser
  if (message.includes("tomorrow")) {
    return Date.now() + 24 * 60 * 60 * 1000;
  }
  if (message.includes("next week")) {
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  }
  // Add more date parsing logic
  return undefined;
}

function extractNoteTitle(message: string): string {
  const words = message.split(" ");
  const noteWords = words.filter(
    (word) =>
      !["save", "note", "remember", "that"].includes(word.toLowerCase()),
  );
  return noteWords.slice(0, 5).join(" ") || "New Note";
}

function extractNoteContent(message: string): string {
  return message; // In production, extract more meaningful content
}

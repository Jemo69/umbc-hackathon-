import { action } from "./_generated/server";
import * as dotenv from "dotenv";
import { v } from "convex/values";
import { api } from "./_generated/api";
dotenv.config();

// Helper: get or create the current authenticated user
async function getOrCreateCurrentUser(ctx: any): Promise<any> {
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

// AI response generation with OpenRouter or OpenAI
async function generateAIResponse(userMessage: string, ctx: any) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const hasOpenRouter = !!openRouterKey;
  if (!hasOpenRouter) {
    return {
      message:
        "no ai api key configured. set openrouter_api_key (preferred) or openai_api_key to enable ai responses.",
      messageType: "text" as const,
      toolCalls: undefined,
      context: userMessage,
    };
  }

  // basic system prompt tailored to this app
  const systemPrompt =
    "you are edutron, an ai study assistant. be concise and helpful. you can suggest creating tasks or notes. keep responses student-friendly.";

  // 1) lightweight intent detection for tool calls (no api call needed)
  const msg = userMessage.toLowerCase();
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
    const taskTitle = extractTaskTitle(userMessage);
    const dueDate = extractDueDate(userMessage);
    const toolCalls = [
      {
        functionName: "addTask",
        arguments: JSON.stringify({
          title: taskTitle,
          dueDate: dueDate,
          estimatedTime: 60,
          context: userMessage,
        }),
      },
    ];

    return {
      message: `i've added "${taskTitle}" to your task list${
        dueDate
          ? ` with a due date of ${new Date(dueDate).toLocaleDateString()}`
          : ""
      }. want to set a subject or priority?`,
      messageType: "tool_call" as const,
      toolCalls,
      context: userMessage,
    };
  }

  if (
    msg.includes("save") ||
    msg.includes("note") ||
    msg.includes("remember")
  ) {
    const noteTitle = extractNoteTitle(userMessage);
    const noteContent = extractNoteContent(userMessage);
    const toolCalls = [
      {
        functionName: "addNote",
        arguments: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          context: userMessage,
        }),
      },
    ];

    return {
      message: `saved a note titled "${noteTitle}".`,
      messageType: "tool_call" as const,
      toolCalls,
      context: userMessage,
    };
  }

  // 2) otherwise, call openai for a general helpful response
  try {
    const useOpenRouter = hasOpenRouter && process.env.openrouter_api_key;
    const model = "x-ai/grok-4-fast:free";

    const url = "https://openrouter.ai/api/v1/chat/completions";

    const headers: Record<string, string> = {
      "content-type": "application/json",
      authorization: `bearer ${openRouterKey}`,
    };
    // optional but recommended for openrouter:
    if (useOpenRouter) {
      headers["http-referer"] = process.env.site_url || "http://localhost";
      headers["x-title"] = process.env.site_name || "edutron";
    }

    const res = await fetch(url, {
      method: "post",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      throw new Error(`openai error ${res.status}`);
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

export const sendChatMessage: any = action({
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


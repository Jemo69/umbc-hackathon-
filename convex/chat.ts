import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const getChatHistory = query({
  handler: async (ctx) => {
    const user = await getDemoUser(ctx);

    return await ctx.db
      .query("chatHistory")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .take(50)
      .then((history) => history.reverse()); // Reverse to show oldest first
  },
});

export const addChatMessage = mutation({
  args: {
    message: v.string(),
    isViewer: v.boolean(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("tool_call"),
        v.literal("tool_result")
      )
    ),
    toolCalls: v.optional(
      v.array(
        v.object({
          functionName: v.string(),
          arguments: v.string(),
          result: v.optional(v.string()),
        })
      )
    ),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    await ctx.db.insert("chatHistory", {
      userId: user._id,
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
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const user = await getDemoUser(ctx);

    // Add user message to chat history
    await ctx.runMutation(api.chat.addChatMessage, {
      message: args.message,
      isViewer: true,
      messageType: "text",
    });

    // Simulate AI response with tool calling
    const aiResponse = await generateAIResponse(args.message, ctx);

    // Add AI response to chat history
    await ctx.runMutation(api.chat.addChatMessage, {
      message: aiResponse.message,
      isViewer: false,
      messageType: aiResponse.messageType,
      toolCalls: aiResponse.toolCalls,
      context: aiResponse.context,
    });

    return aiResponse;
  },
});

// Simulate AI response generation with tool calling
async function generateAIResponse(userMessage: string, ctx: any) {
  // This is a simplified AI simulation - in production, you'd integrate with OpenAI, Anthropic, etc.

  const message = userMessage.toLowerCase();

  // Check for task creation requests
  if (
    message.includes("add task") ||
    message.includes("create task") ||
    message.includes("remind me")
  ) {
    const taskTitle = extractTaskTitle(userMessage);
    const dueDate = extractDueDate(userMessage);

    // Simulate tool call
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
      message: `I've added "${taskTitle}" to your task list${
        dueDate
          ? ` with a due date of ${new Date(dueDate).toLocaleDateString()}`
          : ""
      }. Would you like me to set any specific priority or subject for this task?`,
      messageType: "tool_call" as const,
      toolCalls,
      context: userMessage,
    };
  }

  // Check for note creation requests
  if (
    message.includes("save") ||
    message.includes("note") ||
    message.includes("remember")
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
      message: `I've saved "${noteTitle}" to your notes. You can find it in your notes section.`,
      messageType: "tool_call" as const,
      toolCalls,
      context: userMessage,
    };
  }

  // Default AI responses
  const responses = [
    "I'm here to help you with your studies! I can create tasks, save notes, analyze documents, and answer questions about your coursework. What would you like to work on?",
    "That's a great question! I can help you break down complex topics, create study plans, or organize your assignments. What subject are you working on?",
    "I'm your AI study assistant! I can help you stay organized, understand difficult concepts, and manage your academic workload. How can I assist you today?",
  ];

  return {
    message: responses[Math.floor(Math.random() * responses.length)],
    messageType: "text" as const,
    toolCalls: undefined,
    context: userMessage,
  };
}

// Helper functions for text extraction
function extractTaskTitle(message: string): string {
  // Simple extraction - in production, use more sophisticated NLP
  const words = message.split(" ");
  const taskWords = words.filter(
    (word) =>
      !["add", "create", "task", "remind", "me", "to", "about"].includes(
        word.toLowerCase()
      )
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
    (word) => !["save", "note", "remember", "that"].includes(word.toLowerCase())
  );
  return noteWords.slice(0, 5).join(" ") || "New Note";
}

function extractNoteContent(message: string): string {
  return message; // In production, extract more meaningful content
}

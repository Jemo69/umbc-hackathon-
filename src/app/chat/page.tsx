"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Send,
  Bot,
  User,
  CheckCircle,
  FileText,
  Loader2,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

// Chat Message Component
const ChatMessage = ({
  message,
  isUser,
}: {
  message: any;
  isUser: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 animate-m3-slide-up`}
    >
      <div
        className={`flex items-start space-x-3 max-w-[90%] sm:max-w-[80%] ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? "m3-primary" : "liquid-glass border border-surface-200"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-primary-600" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`liquid-glass p-4 rounded-m3-xl ${
            isUser ? "rounded-tr-m3-sm" : "rounded-tl-m3-sm"
          } ${
            isUser
              ? "bg-primary-500/10 border-primary-200"
              : "bg-white/80 border-surface-200"
          }`}
        >
          <p
            className={`text-body-large ${
              isUser ? "text-on-surface" : "text-on-surface"
            }`}
          >
            {message.message}
          </p>

          {/* Tool Calls Display */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.toolCalls.map((toolCall: any, index: number) => (
                <div
                  key={index}
                  className="bg-surface-100 rounded-m3-lg p-3 border border-surface-200"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {toolCall.functionName === "addTask" ? (
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-secondary-600" />
                    )}
                    <span className="text-body-medium font-medium text-on-surface">
                      {toolCall.functionName === "addTask"
                        ? "Task Created"
                        : "Note Saved"}
                    </span>
                  </div>

                  <div className="text-body-small text-on-surface-variant">
                    <details>
                      <summary
                        className="cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? "Hide details" : "Show details"}
                      </summary>
                      {isExpanded && (
                        <div className="mt-2 p-2 bg-surface-50 rounded-m3-sm">
                          <pre className="text-xs text-on-surface-variant whitespace-pre-wrap">
                            {JSON.stringify(
                              JSON.parse(toolCall.arguments),
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-body-small text-on-surface-variant mt-2 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Chat Interface
const ChatInterface = () => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sessions
  const sessions = useQuery(
    api.chat.getChatSessions,
    isAuthenticated ? {} : undefined
  );
  const createSession = useMutation(api.chat.createChatSession);
  const renameSession = useMutation(api.chat.renameChatSession);
  const deleteSession = useMutation(api.chat.deleteChatSession);

  // Messages scoped by session (if selected)
  const chatHistory = useQuery(
    api.chat.getChatHistory,
    isAuthenticated ? (activeSessionId ? { sessionId: activeSessionId } : {}) : undefined
  );
  const sendMessage = useAction(api.chat.sendChatMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat.activeSessionId");
      if (saved) setActiveSessionId(saved);
    } catch {}
    setHydrated(true);
  }, []);

  // Persist session when it changes
  useEffect(() => {
    try {
      if (activeSessionId) localStorage.setItem("chat.activeSessionId", activeSessionId);
    } catch {}
  }, [activeSessionId]);

  // If no saved session, pick the most recent one from server
  useEffect(() => {
    if (!hydrated) return;
    if (!activeSessionId && sessions && sessions.length > 0) {
      setActiveSessionId(sessions[0]._id);
    }
  }, [hydrated, sessions, activeSessionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      if (!isAuthenticated) return;
    const res = await sendMessage({ message, sessionId: activeSessionId });
      // If backend auto-created a session, adopt it
      if (!activeSessionId && (res as any)?.sessionId) {
        setActiveSessionId((res as any).sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  // Detect backend warning about missing AI keys from the latest AI message
  const latestAIMessage = Array.isArray(chatHistory)
    ? [...chatHistory].filter((m: any) => !m.isViewer).slice(-1)[0]
    : null;
  const showApiKeyBanner = !!latestAIMessage?.message?.includes(
    "No AI API key configured"
  );
  return (
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-nav border-b border-surface-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {showApiKeyBanner && (
            <div className="mb-4 rounded-m3-lg border border-yellow-300 bg-yellow-50 text-yellow-900 px-4 py-3">
              <p className="text-body-medium font-medium">
                AI disabled: set <code>OPENROUTER_API_KEY</code> (preferred) or <code>OPENAI_API_KEY</code> in your Convex env and restart <code>npx convex dev</code>.
              </p>
              <p className="text-body-small mt-1 opacity-80">
                Optionally set <code>CHAT_MODEL</code>. OpenRouter headers use <code>SITE_URL</code>/<code>SITE_NAME</code> if set.
              </p>
            </div>
          )}

          <div className="max-w-7xl mx-auto flex gap-3 items-center justify-between h-16 sm:h-20 md:h-24">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <button
                className="md:hidden w-10 h-10 liquid-glass rounded-m3-lg border border-surface-200 flex items-center justify-center"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sessions"
              >
                <Menu className="w-5 h-5 text-on-surface" />
              </button>
              <div className="w-8 h-8 m3-primary rounded-m3-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-headline-small font-medium text-on-background">Edutron Assistant</h1>
                <p className="text-body-small text-on-surface-variant">Your AI study companion</p>
              </div>
            </div>
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-72 bg-background shadow-xl border-r border-surface-200 flex flex-col">
                <div className="p-3 border-b border-surface-200 flex items-center justify-between">
                  <span className="text-body-medium font-medium">Sessions</span>
                  <button
                    className="w-9 h-9 liquid-glass rounded-m3-lg flex items-center justify-center"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-3 border-b border-surface-200 flex items-center justify-between">
                  <button
                    className="px-2 py-1 m3-primary text-white rounded-m3-sm"
                    onClick={async () => {
                      const id = await createSession({ title: "New chat" });
                      setActiveSessionId(id);
                      setSidebarOpen(false);
                    }}
                  >
                    New
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  {sessions?.map((s: any) => (
                    <div
                      key={s._id}
                      className={`px-3 py-2 cursor-pointer border-b border-surface-100 ${
                        activeSessionId === s._id ? "bg-primary-50" : "hover:bg-surface-50"
                      }`}
                      onClick={() => {
                        setActiveSessionId(s._id);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="text-body-medium font-medium truncate">{s.title}</div>
                      <div className="text-body-small text-on-surface-variant truncate">
                        {s.lastMessagePreview || ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Sessions Sidebar */}
            <div className="hidden md:flex w-64 shrink-0 liquid-glass rounded-m3-2xl border border-surface-200 h-[calc(100dvh-12rem)] flex-col">
              <div className="p-4 border-b border-surface-200 flex items-center justify-between">
                <span className="text-body-medium font-medium">Sessions</span>
                <button
                  className="px-2 py-1 m3-primary text-white rounded-m3-sm"
                  onClick={async () => {
                    const id = await createSession({ title: "New chat" });
                    setActiveSessionId(id);
                  }}
                >
                  New
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {sessions?.map((s: any) => (
                  <div
                    key={s._id}
                    className={`px-3 py-2 cursor-pointer border-b border-surface-100 text-gray-100 ${
                      activeSessionId === s._id ? "bg-primary-50 text-gray-800" : "hover:bg-surface-50 text-gray-600"
                    }`}
                    onClick={() => setActiveSessionId(s._id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <div className="text-body-medium font-medium truncate">{s.title}</div>
                        <div className="text-body-small text-on-surface-variant truncate">
                          {s.lastMessagePreview || ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="text-body-small px-2 py-1 rounded-m3-sm bg-surface-100"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const title = prompt("Rename session", s.title) || s.title;
                            await renameSession({ sessionId: s._id, title });
                          }}
                        >
                          Rename
                        </button>
                        <button
                          className="text-body-small px-2 py-1 rounded-m3-sm bg-red-50 text-red-700"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete this session?")) {
                              await deleteSession({ sessionId: s._id });
                              if (activeSessionId === s._id) setActiveSessionId(undefined);
                            }
                          }}
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {sessions && sessions.length === 0 && (
                  <div className="p-4 text-body-small text-on-surface-variant">No sessions yet.</div>
                )}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 w-full liquid-glass rounded-m3-2xl border border-surface-200 h-[calc(100dvh-12rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {chatHistory === undefined ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Bot className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                      <h3 className="text-title-large text-on-surface mb-2">Welcome to Edutron Assistant!</h3>
                      <p className="text-body-large text-on-surface-variant max-w-md">
                        I'm here to help you with your studies. I can create tasks, save notes, analyze documents, and answer questions about your coursework.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((message: any) => (
                    <ChatMessage key={message._id} message={message} isUser={message.isViewer} />
                  ))
                )}

                {isLoading && (
                  <div className="flex justify-start mb-4 animate-m3-fade-in">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 liquid-glass border border-surface-200 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="liquid-glass p-4 rounded-m3-xl rounded-tl-m3-sm bg-white/80 border-surface-200">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                          <span className="text-body-medium text-on-surface">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-surface-200 p-3 sm:p-4 sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about your studies..."
                      className="w-full p-3 sm:p-3.5 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-medium sm:text-body-large text-on-surface placeholder:text-on-surface-variant"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-11 h-11 sm:w-12 sm:h-12 m3-primary rounded-m3-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed interactive"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
;

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}

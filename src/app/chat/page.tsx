"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Send,
  Bot,
  User,
  CheckCircle,
  FileText,
  Loader2,
  Sparkles,
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
        className={`flex items-start space-x-3 max-w-[80%] ${
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
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatHistory = useQuery(api.chat.getChatHistory, {});
  const sendMessage = useAction(api.chat.sendChatMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      await sendMessage({ message });
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="liquid-glass-nav border-b border-surface-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 m3-primary rounded-m3-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-headline-small font-medium text-on-background">
                  Edutron Assistant
                </h1>
                <p className="text-body-small text-on-surface-variant">
                  Your AI study companion
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-body-small text-primary-600 font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-title-large text-on-surface mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() =>
                  handleQuickAction(
                    "Add a task to study for my math exam tomorrow"
                  )
                }
                className="liquid-glass p-4 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-body-medium font-medium text-on-surface">
                      Create Task
                    </p>
                    <p className="text-body-small text-on-surface-variant">
                      Add assignments or study goals
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickAction(
                    "Save a note about the key concepts from today's lecture"
                  )
                }
                className="liquid-glass p-4 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-secondary-600" />
                  <div>
                    <p className="text-body-medium font-medium text-on-surface">
                      Save Note
                    </p>
                    <p className="text-body-small text-on-surface-variant">
                      Remember important information
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickAction("Help me understand calculus derivatives")
                }
                className="liquid-glass p-4 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-accent-purple" />
                  <div>
                    <p className="text-body-medium font-medium text-on-surface">
                      Ask Question
                    </p>
                    <p className="text-body-small text-on-surface-variant">
                      Get help with concepts
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="liquid-glass rounded-m3-2xl border border-surface-200 h-[60vh] flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
              {chatHistory === undefined ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Bot className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                    <h3 className="text-title-large text-on-surface mb-2">
                      Welcome to Edutron Assistant!
                    </h3>
                    <p className="text-body-large text-on-surface-variant max-w-md">
                      I'm here to help you with your studies. I can create
                      tasks, save notes, analyze documents, and answer questions
                      about your coursework.
                    </p>
                  </div>
                </div>
              ) : (
                chatHistory.map((message) => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isUser={message.isViewer}
                  />
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
                        <span className="text-body-medium text-on-surface">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-surface-200 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end space-x-3"
              >
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    className="w-full p-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-12 h-12 m3-primary rounded-m3-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed interactive"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

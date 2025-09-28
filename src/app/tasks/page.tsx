"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import TaskItem from "../../../src/components/TaskItem";
import TaskForm from "../../../src/components/TaskForm";
import {
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  SortAsc,
} from "lucide-react";

const TasksPage: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">(
    "dueDate"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const tasks = useQuery(api.todos.getTasks, {
    completed: filter === "all" ? undefined : filter === "completed",
    sortByDueDate: sortBy === "dueDate",
    sortByPriority: sortBy === "priority",
  });

  // Filter tasks by search query
  const filteredTasks =
    tasks?.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const completedCount = tasks?.filter((t) => t.completed).length || 0;
  const pendingCount = tasks?.filter((t) => !t.completed).length || 0;
  const totalCount = tasks?.length || 0;

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 m3-primary rounded-m3-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-display-small font-bold text-on-background">
              Tasks
            </h1>
          </div>
          <p className="text-body-large text-on-surface-variant max-w-2xl mx-auto mb-4">
            Manage your assignments and track your progress
          </p>
          <div className="flex items-center justify-center space-x-4 text-body-medium">
            <span className="text-green-600 font-medium">
              {completedCount} completed
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-orange-600 font-medium">
              {pendingCount} pending
            </span>
          </div>
        </div>
        {/* Task Form */}
        <TaskForm onTaskCreated={() => {}} />

        {/* Filters and Search */}
        <div className="m3-surface p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-3 py-2 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Filter by status */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="liquid-glass border border-surface-200 rounded-m3-lg px-3 py-2 text-body-medium text-on-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="liquid-glass border border-surface-200 rounded-m3-lg px-3 py-2 text-body-medium text-on-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="created">Created</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks === undefined ? (
            <div className="liquid-glass p-8 rounded-m3-lg text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-body-large text-on-surface-variant">
                Loading tasks...
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="liquid-glass p-8 rounded-m3-lg text-center">
              <CheckCircle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-title-large text-on-surface mb-2">
                {searchQuery ? "No tasks found" : "No tasks yet"}
              </h3>
              <p className="text-body-large text-on-surface-variant">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first task to get started!"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => <TaskItem key={task._id} task={task} />)
          )}
        </div>

        {/* Task Stats */}
        {tasks && tasks.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-primary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Completion Rate
              </h3>
              <p className="text-headline-small text-primary-600 font-bold">
                {totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 0}
                %
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-secondary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Total Time
              </h3>
              <p className="text-headline-small text-secondary-600 font-bold">
                {tasks.reduce(
                  (acc, task) => acc + (task.estimatedEffort || 0),
                  0
                )}
                m
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 bg-accent-orange rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Upcoming
              </h3>
              <p className="text-headline-small text-accent-orange font-bold">
                {
                  tasks.filter(
                    (task) =>
                      !task.completed &&
                      task.dueDate &&
                      new Date(task.dueDate) <=
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TasksPageWrapper() {
  return (
    <ProtectedRoute>
      <TasksPage />
    </ProtectedRoute>
  );
}

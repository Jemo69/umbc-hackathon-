import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { v } from "convex/values";
import { Calendar, Clock, BookOpen, Star, Plus } from "lucide-react";

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const createTask = useMutation(api.todos.createTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newDueDate = dueDate ? new Date(dueDate).getTime() : undefined;
    const newEstimatedEffort = estimatedEffort
      ? parseInt(estimatedEffort)
      : undefined;

    await createTask({
      title,
      description: description || undefined,
      dueDate: newDueDate,
      estimatedEffort: newEstimatedEffort,
      subject: subject || undefined,
      priorityScore: priority,
      // documentRef, context, isGeneratedByAI will be handled later or by AI
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setEstimatedEffort("");
    setSubject("");
    setPriority(5);
    setIsExpanded(false);
    onTaskCreated();
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 bg-red-50";
    if (priority >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "High";
    if (priority >= 6) return "Medium";
    return "Low";
  };

  return (
    <div className="m3-surface p-6 mb-8 animate-m3-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-headline-small text-on-surface">Add New Task</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 m3-primary rounded-m3-lg flex items-center justify-center interactive"
        >
          <Plus
            className={`w-5 h-5 text-white transition-transform ${
              isExpanded ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div className="relative">
          <label
            htmlFor="title"
            className="block text-body-medium font-medium text-on-surface mb-2"
          >
            Task Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
            placeholder="What needs to be done?"
            required
          />
        </div>

        {/* Expanded Form Fields */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-m3-slide-up">
            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant resize-none"
                placeholder="Add more details about this task..."
              />
            </div>

            {/* Due Date */}
            <div className="relative">
              <label
                htmlFor="dueDate"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface"
                />
              </div>
            </div>

            {/* Estimated Effort */}
            <div className="relative">
              <label
                htmlFor="estimatedEffort"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Estimated Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="number"
                  id="estimatedEffort"
                  value={estimatedEffort}
                  onChange={(e) => setEstimatedEffort(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface"
                  placeholder="60"
                  min="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-body-small text-on-surface-variant">
                  minutes
                </span>
              </div>
            </div>

            {/* Subject */}
            <div className="relative">
              <label
                htmlFor="subject"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Subject/Class
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="relative">
              <label
                htmlFor="priority"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Priority Level
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="range"
                  id="priority"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-body-small text-on-surface-variant">
                    Low
                  </span>
                  <span
                    className={`text-body-small font-medium px-2 py-1 rounded-m3-sm ${getPriorityColor(
                      priority
                    )}`}
                  >
                    {getPriorityLabel(priority)} ({priority}/10)
                  </span>
                  <span className="text-body-small text-on-surface-variant">
                    High
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-8 py-3 m3-primary text-white rounded-m3-lg disabled:opacity-50 disabled:cursor-not-allowed interactive focus-ring flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-body-large font-medium">Add Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;

import React, { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  BookOpen,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Flag,
} from "lucide-react";

interface TaskItemProps {
  task: Doc<"todos">;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [showMenu, setShowMenu] = useState(false);
  const updateTask = useMutation(api.todos.updateTask);
  const deleteTask = useMutation(api.todos.deleteTask);

  const handleToggleCompleted = () => {
    updateTask({ id: task._id, completed: !task.completed });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask({ id: task._id });
    }
    setShowMenu(false);
  };

  const getPriorityColor = (priority?: number) => {
    if (!priority) return "text-surface-400";
    if (priority >= 8) return "text-red-500";
    if (priority >= 6) return "text-yellow-500";
    return "text-green-500";
  };

  const getPriorityBg = (priority?: number) => {
    if (!priority) return "bg-surface-100";
    if (priority >= 8) return "bg-red-50";
    if (priority >= 6) return "bg-yellow-50";
    return "bg-green-50";
  };

  const getDueDateStatus = (dueDate?: number) => {
    if (!dueDate) return { color: "text-surface-500", bg: "bg-surface-100" };

    const now = Date.now();
    const due = new Date(dueDate).getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { color: "text-red-600", bg: "bg-red-100", label: "Overdue" };
    if (diffDays === 0)
      return {
        color: "text-orange-600",
        bg: "bg-orange-100",
        label: "Due Today",
      };
    if (diffDays === 1)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        label: "Due Tomorrow",
      };
    if (diffDays <= 3)
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        label: `${diffDays} days left`,
      };
    return {
      color: "text-green-600",
      bg: "bg-green-100",
      label: `${diffDays} days left`,
    };
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <div
      className={`liquid-glass p-4 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-all duration-200 interactive animate-m3-fade-in ${
        task.completed ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={handleToggleCompleted}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? "m3-primary border-primary-500"
              : "border-surface-300 hover:border-primary-500"
          }`}
        >
          {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-title-medium font-medium mb-2 ${
                  task.completed
                    ? "line-through text-on-surface-variant"
                    : "text-on-surface"
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`text-body-medium mb-3 ${
                    task.completed
                      ? "text-on-surface-variant"
                      : "text-on-surface-variant"
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Task Metadata */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Priority */}
                {task.priorityScore && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-m3-sm ${getPriorityBg(
                      task.priorityScore
                    )}`}
                  >
                    <Star
                      className={`w-3 h-3 ${getPriorityColor(
                        task.priorityScore
                      )}`}
                    />
                    <span
                      className={`text-body-small font-medium ${getPriorityColor(
                        task.priorityScore
                      )}`}
                    >
                      {task.priorityScore}/10
                    </span>
                  </div>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-m3-sm ${dueDateStatus.bg}`}
                  >
                    <Calendar className={`w-3 h-3 ${dueDateStatus.color}`} />
                    <span
                      className={`text-body-small font-medium ${dueDateStatus.color}`}
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Estimated Effort */}
                {task.estimatedEffort && (
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-m3-sm bg-secondary-50">
                    <Clock className="w-3 h-3 text-secondary-600" />
                    <span className="text-body-small font-medium text-secondary-600">
                      {task.estimatedEffort}m
                    </span>
                  </div>
                )}

                {/* Subject */}
                {task.subject && (
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-m3-sm bg-primary-50">
                    <BookOpen className="w-3 h-3 text-primary-600" />
                    <span className="text-body-small font-medium text-primary-600">
                      {task.subject}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-m3-sm hover:bg-surface-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 w-48 liquid-glass border border-surface-200 rounded-m3-lg shadow-m3-3 z-10">
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-m3-sm hover:bg-surface-100 transition-colors text-left">
                      <Edit2 className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-body-medium text-on-surface">
                        Edit Task
                      </span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-m3-sm hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-body-medium text-red-600">
                        Delete Task
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

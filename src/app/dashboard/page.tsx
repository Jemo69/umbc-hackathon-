"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import {
    GraduationCap,
    Brain,
    CheckCircle,
    Clock,
    Target,
    FileText,
    MessageCircle,
    Calendar,
    TrendingUp,
    Zap,
    Star,
    BookOpen,
    Users,
    Award,
} from "lucide-react";
import { type Doc } from "../../../convex/_generated/dataModel";

// Liquid Glass Navigation Component
const LiquidGlassNav = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "liquid-glass-nav shadow-m3-2" : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 m3-primary rounded-m3-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-headline-small font-medium text-on-background">
                            Edutron
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <a
                            href="/dashboard"
                            className="text-body-large text-primary-600 font-medium"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/tasks"
                            className="text-body-large text-on-surface hover:text-primary-600 transition-colors"
                        >
                            Tasks
                        </a>
                        <a
                            href="/chat"
                            className="text-body-large text-on-surface hover:text-primary-600 transition-colors"
                        >
                            Chat
                        </a>
                        <a
                            href="/notes"
                            className="text-body-large text-on-surface hover:text-primary-600 transition-colors"
                        >
                            Notes
                        </a>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-on-surface" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Progress Card Component
const ProgressCard = ({
    title,
    value,
    max,
    icon: Icon,
    color = "primary",
}: {
    title: string;
    value: number;
    max: number;
    icon: any;
    color?: "primary" | "secondary" | "accent";
}) => {
    const percentage = (value / max) * 100;

    return (
        <div className="m3-surface p-6 interactive animate-m3-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`w-12 h-12 rounded-m3-xl flex items-center justify-center ${color === "primary"
                            ? "m3-primary-container"
                            : color === "secondary"
                                ? "m3-secondary-container"
                                : "bg-accent-orange/20"
                        }`}
                >
                    <Icon
                        className={`w-6 h-6 ${color === "primary"
                                ? "text-primary-700"
                                : color === "secondary"
                                    ? "text-secondary-700"
                                    : "text-accent-orange"
                            }`}
                    />
                </div>
                <span className="text-title-large font-medium text-on-surface">
                    {value}/{max}
                </span>
            </div>

            <h3 className="text-title-medium text-on-surface mb-2">{title}</h3>

            <div className="w-full bg-surface-200 rounded-full h-2 mb-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${color === "primary"
                            ? "bg-primary-500"
                            : color === "secondary"
                                ? "bg-secondary-500"
                                : "bg-accent-orange"
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-body-small text-on-surface-variant">
                {percentage.toFixed(0)}% complete
            </p>
        </div>
    );
};

// Quick Action Card
const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    href,
    color = "primary",
}: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color?: "primary" | "secondary" | "accent";
}) => (
    <a
        href={href}
        className="m3-surface p-6 interactive w-full text-left group block"
    >
        <div
            className={`w-12 h-12 rounded-m3-xl flex items-center justify-center mb-4 ${color === "primary"
                    ? "m3-primary-container group-hover:m3-primary transition-colors"
                    : color === "secondary"
                        ? "m3-secondary-container group-hover:m3-secondary transition-colors"
                        : "bg-accent-orange/20 group-hover:bg-accent-orange transition-colors"
                }`}
        >
            <Icon
                className={`w-6 h-6 ${color === "primary"
                        ? "text-primary-700 group-hover:text-white transition-colors"
                        : color === "secondary"
                            ? "text-secondary-700 group-hover:text-white transition-colors"
                            : "text-accent-orange group-hover:text-white transition-colors"
                    }`}
            />
        </div>

        <h3 className="text-title-medium text-on-surface mb-2 group-hover:text-primary-600 transition-colors">
            {title}
        </h3>

        <p className="text-body-medium text-on-surface-variant">{description}</p>
    </a>
);

// Task Preview Component
const TaskPreview = ({ task }: { task: Doc<"todos"> }) => (
    <div className="liquid-glass p-4 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
            <h4 className="text-title-small text-on-surface font-medium flex-1">
                {task.title}
            </h4>
            <div
                className={`w-2 h-2 rounded-full ml-2 ${(task.priorityScore ?? 0) > 7
                        ? "bg-red-500"
                        : (task.priorityScore ?? 0) > 4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    }`}
            />
        </div>

        {task.description && (
            <p className="text-body-small text-on-surface-variant mb-3">
                {task.description}
            </p>
        )}

        <div className="flex items-center justify-between text-body-small">
            <div className="flex items-center space-x-4">
                {task.subject && (
                    <span className="text-primary-600 bg-primary-50 px-2 py-1 rounded-m3-sm">
                        {task.subject}
                    </span>
                )}
                {task.estimatedEffort && (
                    <span className="text-on-surface-variant flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.estimatedEffort}m
                    </span>
                )}
            </div>

            {task.dueDate && (
                <span
                    className={`px-2 py-1 rounded-m3-sm ${new Date(task.dueDate) < new Date()
                            ? "bg-red-100 text-red-700"
                            : new Date(task.dueDate) <
                                new Date(Date.now() + 24 * 60 * 60 * 1000)
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                        }`}
                >
                    {new Date(task.dueDate).toLocaleDateString()}
                </span>
            )}
        </div>
    </div>
);

// Main Dashboard Component
const Dashboard = () => {
    const tasks = useQuery(api.todos.getTasks, {});
    const documents = useQuery(api.documents.getDocuments, {});
    const notes = useQuery(api.notes.getNotes, { limit: 5 });

    // Mock data for demonstration
    const stats = {
        completedTasks:
            tasks?.filter((t: Doc<"todos">) => t.completed).length || 0,
        totalTasks: tasks?.length || 0,
        studyStreak: 7,
        maxStreak: 30,
        documentsProcessed: documents?.length || 0,
        maxDocuments: 50,
        focusTime: 240, // minutes
        maxFocusTime: 480,
        notesCreated: notes?.length || 0,
        maxNotes: 100,
    };

    const recentTasks = tasks?.slice(0, 3) || [];
    const recentNotes = notes?.slice(0, 3) || [];

    return (
        <div className="min-h-screen bg-background pt-20 lg:pt-24">
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-secondary-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-display-small font-bold text-on-background mb-4 animate-m3-fade-in">
                                Welcome back, Student! 🎓
                            </h1>
                            <p className="text-title-large text-on-surface-variant mb-8 animate-m3-slide-up">
                                Your AI-powered learning companion is ready to help you succeed.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 animate-m3-bounce">
                                <div className="flex items-center space-x-2 bg-gray-400/80 backdrop-blur-sm px-4 py-2 rounded-m3-xl border border-surface-200">
                                    <Star className="w-5 h-5 text-accent-amber" />
                                    <span className="text-body-medium text-on-surface">
                                        {stats.studyStreak} day streak!
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 bg-gray-400/80 backdrop-blur-sm px-4 py-2 rounded-m3-xl border border-surface-200">
                                    <Zap className="w-5 h-5 text-primary-500" />
                                    <span className="text-body-medium text-on-surface">
                                        {stats.completedTasks} tasks completed
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 bg-gray-400/80 backdrop-blur-sm px-4 py-2 rounded-m3-xl border border-surface-200">
                                    <Brain className="w-5 h-5 text-secondary-500" />
                                    <span className="text-body-medium text-on-surface">
                                        AI Assistant Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <ProgressCard
                            title="Tasks Completed"
                            value={stats.completedTasks}
                            max={stats.totalTasks}
                            icon={CheckCircle}
                            color="primary"
                        />
                        <ProgressCard
                            title="Study Streak"
                            value={stats.studyStreak}
                            max={stats.maxStreak}
                            icon={Target}
                            color="secondary"
                        />
                        <ProgressCard
                            title="Documents Processed"
                            value={stats.documentsProcessed}
                            max={stats.maxDocuments}
                            icon={FileText}
                            color="accent"
                        />
                        <ProgressCard
                            title="Notes Created"
                            value={stats.notesCreated}
                            max={stats.maxNotes}
                            icon={BookOpen}
                            color="primary"
                        />
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-headline-medium text-on-background mb-6">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickActionCard
                            title="Chat with AI"
                            description="Get instant help with your studies"
                            icon={MessageCircle}
                            href="/chat"
                            color="primary"
                        />
                        <QuickActionCard
                            title="Manage Tasks"
                            description="Create and organize assignments"
                            icon={CheckCircle}
                            href="/tasks"
                            color="secondary"
                        />
                        <QuickActionCard
                            title="Take Notes"
                            description="Capture and organize your thoughts"
                            icon={BookOpen}
                            href="/notes"
                            color="accent"
                        />
                        <QuickActionCard
                            title="Upload Documents"
                            description="Analyze course materials with AI"
                            icon={FileText}
                            href="/documents"
                            color="primary"
                        />
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-headline-medium text-on-background mb-6">
                                Recent Tasks
                            </h2>
                            <div className="space-y-4">
                                {recentTasks.length > 0 ? (
                                    recentTasks.map((task: Doc<"todos">) => (
                                        <TaskPreview key={task._id} task={task} />
                                    ))
                                ) : (
                                    <div className="liquid-glass p-8 rounded-m3-lg text-center">
                                        <CheckCircle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                                        <p className="text-body-large text-on-surface-variant">
                                            No tasks yet
                                        </p>
                                        <p className="text-body-medium text-on-surface-variant">
                                            Create your first task to get started!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-headline-medium text-on-background mb-6">
                                Recent Notes
                            </h2>
                            <div className="space-y-4">
                                {recentNotes.length > 0 ? (
                                    recentNotes.map((note: Doc<"notes">) => (
                                        <div
                                            key={note._id}
                                            className="liquid-glass p-4 rounded-m3-lg border border-surface-200"
                                        >
                                            <h4 className="text-title-small text-on-surface font-medium mb-2">
                                                {note.title}
                                            </h4>
                                            <p className="text-body-small text-on-surface-variant mb-2">
                                                {note.content.substring(0, 100)}...
                                            </p>
                                            {note.subject && (
                                                <span className="text-primary-600 bg-primary-50 px-2 py-1 rounded-m3-sm text-body-small">
                                                    {note.subject}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="liquid-glass p-8 rounded-m3-lg text-center">
                                        <BookOpen className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                                        <p className="text-body-large text-on-surface-variant">
                                            No notes yet
                                        </p>
                                        <p className="text-body-medium text-on-surface-variant">
                                            Start taking notes to capture your thoughts!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gamification & Achievements */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="liquid-glass p-8 rounded-m3-2xl border border-surface-200">
                        <div className="flex items-center space-x-3 mb-6">
                            <Award className="w-8 h-8 text-primary-500" />
                            <h2 className="text-headline-medium text-on-surface">
                                Achievements & Progress
                            </h2>
                        </div>

                        {/* Achievement Badges */}
                        <div className="mb-8">
                            <h3 className="text-title-large font-medium text-on-surface mb-4">
                                Recent Achievements
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-m3-xl border border-green-200">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-body-medium font-medium text-green-800 mb-1">
                                        Task Master
                                    </h4>
                                    <p className="text-body-small text-green-600">
                                        Completed 10 tasks
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-blue-50 rounded-m3-xl border border-blue-200">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-body-medium font-medium text-blue-800 mb-1">
                                        AI Explorer
                                    </h4>
                                    <p className="text-body-small text-blue-600">
                                        Used AI chat 25 times
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-m3-xl border border-purple-200">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Star className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-body-medium font-medium text-purple-800 mb-1">
                                        Streak Keeper
                                    </h4>
                                    <p className="text-body-small text-purple-900">
                                        7 day study streak
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-orange-50 rounded-m3-xl border border-orange-200">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-body-medium font-medium text-orange-800 mb-1">
                                        Note Taker
                                    </h4>
                                    <p className="text-body-small text-orange-600">
                                        Created 5 notes
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Ring */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative w-32 h-32">
                                <svg
                                    className="w-32 h-32 transform -rotate-90"
                                    viewBox="0 0 120 120"
                                >
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-surface-200"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 *
                                            Math.PI *
                                            50 *
                                            (1 - stats.completedTasks / Math.max(stats.totalTasks, 1))
                                            }`}
                                        className="text-primary-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-headline-small font-bold text-primary-600">
                                            {stats.totalTasks > 0
                                                ? Math.round(
                                                    (stats.completedTasks / stats.totalTasks) * 100
                                                )
                                                : 0}
                                            %
                                        </div>
                                        <div className="text-body-small text-on-surface-variant">
                                            Complete
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Study Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 m3-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-title-large font-medium text-on-surface mb-2">
                                    Productivity Score
                                </h3>
                                <p className="text-headline-small text-primary-600 font-bold">
                                    85%
                                </p>
                                <p className="text-body-small text-on-surface-variant mt-2">
                                    You're performing excellently!
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 m3-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-title-large font-medium text-on-surface mb-2">
                                    Focus Sessions
                                </h3>
                                <p className="text-headline-small text-secondary-600 font-bold">
                                    12
                                </p>
                                <p className="text-body-small text-on-surface-variant mt-2">
                                    This week
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-accent-purple rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-title-large font-medium text-on-surface mb-2">
                                    AI Interactions
                                </h3>
                                <p className="text-headline-small text-accent-purple font-bold">
                                    47
                                </p>
                                <p className="text-body-small text-on-surface-variant mt-2">
                                    This month
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}

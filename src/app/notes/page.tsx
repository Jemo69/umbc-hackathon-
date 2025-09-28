"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Tag,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

// Note Card Component
const NoteCard = ({ note }: { note: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteNote = useMutation(api.notes.deleteNote);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote({ noteId: note._id });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const preview =
    note.content.length > 150
      ? note.content.substring(0, 150) + "..."
      : note.content;

  return (
    <div className="liquid-glass p-6 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-all duration-200 interactive animate-m3-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-title-large font-medium text-on-surface mb-2 line-clamp-2">
            {note.title}
          </h3>

          {note.subject && (
            <div className="flex items-center space-x-1 mb-3">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span className="text-body-medium text-primary-600 font-medium">
                {note.subject}
              </span>
            </div>
          )}

          <p
            className={`text-body-medium text-on-surface-variant mb-4 ${
              isExpanded ? "" : "line-clamp-3"
            }`}
          >
            {isExpanded ? note.content : preview}
          </p>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-m3-sm bg-secondary-50 text-secondary-700 text-body-small font-medium"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-body-small text-on-surface-variant">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created {formatDate(note.createdAt)}</span>
              </div>
              {note.updatedAt !== note.createdAt && (
                <div className="flex items-center space-x-1">
                  <Edit2 className="w-3 h-3" />
                  <span>Updated {formatDate(note.updatedAt)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-m3-sm hover:bg-surface-100 transition-colors"
                title={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? (
                  <EyeOff className="w-4 h-4 text-on-surface-variant" />
                ) : (
                  <Eye className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-m3-sm hover:bg-red-50 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Note Form Component
const NoteForm = ({ onNoteCreated }: { onNoteCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const createNote = useMutation(api.notes.createNote);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    await createNote({
      title: title.trim(),
      content: content.trim(),
      subject: subject.trim() || undefined,
      tags: tagsArray,
    });

    setTitle("");
    setContent("");
    setSubject("");
    setTags("");
    setIsExpanded(false);
    onNoteCreated();
  };

  return (
    <div className="m3-surface p-6 mb-8 animate-m3-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-headline-small text-on-surface">Create New Note</h2>
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
        <div>
          <label
            htmlFor="note-title"
            className="block text-body-medium font-medium text-on-surface mb-2"
          >
            Note Title
          </label>
          <input
            type="text"
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
            placeholder="What's this note about?"
            required
          />
        </div>

        {/* Content Input */}
        <div>
          <label
            htmlFor="note-content"
            className="block text-body-medium font-medium text-on-surface mb-2"
          >
            Content
          </label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full p-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant resize-none"
            placeholder="Write your notes here..."
            required
          />
        </div>

        {/* Expanded Form Fields */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-m3-slide-up">
            {/* Subject */}
            <div>
              <label
                htmlFor="note-subject"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Subject/Class
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  id="note-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="note-tags"
                className="block text-body-medium font-medium text-on-surface mb-2"
              >
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  id="note-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
                  placeholder="formula, important, exam"
                />
              </div>
              <p className="text-body-small text-on-surface-variant mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="px-8 py-3 m3-primary text-white rounded-m3-lg disabled:opacity-50 disabled:cursor-not-allowed interactive focus-ring flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-body-large font-medium">Create Note</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Notes Page
const NotesPage = () => {
  const [filter, setFilter] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "subject">(
    "recent"
  );

  const notes = useQuery(api.notes.getNotes, {
    subject: filter === "all" ? undefined : filter,
  });

  const searchResults = useQuery(api.notes.searchNotes, {
    query: searchQuery,
    subject: filter === "all" ? undefined : filter,
  });

  // Get unique subjects for filter
  const subjects =
    Array.from(new Set(notes?.map((note) => note.subject).filter(Boolean))) ||
    [];

  // Filter and sort notes
  const filteredNotes = searchQuery ? searchResults : notes;
  const sortedNotes =
    filteredNotes?.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "subject":
          return (a.subject || "").localeCompare(b.subject || "");
        case "recent":
        default:
          return b.updatedAt - a.updatedAt;
      }
    }) || [];

  const totalNotes = notes?.length || 0;
  const recentNotes =
    notes?.filter(
      (note) => note.updatedAt > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length || 0;

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 m3-primary rounded-m3-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-display-small font-bold text-on-background">
              Notes
            </h1>
          </div>
          <p className="text-body-large text-on-surface-variant max-w-2xl mx-auto mb-4">
            Capture and organize your thoughts and knowledge
          </p>
          <div className="flex items-center justify-center space-x-4 text-body-medium">
            <span className="text-primary-600 font-medium">
              {totalNotes} notes
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-secondary-600 font-medium">
              {recentNotes} this week
            </span>
          </div>
        </div>
        {/* Note Form */}
        <NoteForm onNoteCreated={() => {}} />

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
                placeholder="Search notes..."
                className="w-full pl-10 pr-3 py-2 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Filter by subject */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="liquid-glass border border-surface-200 rounded-m3-lg px-3 py-2 text-body-medium text-on-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="liquid-glass border border-surface-200 rounded-m3-lg px-3 py-2 text-body-medium text-on-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  <option value="recent">Most Recent</option>
                  <option value="title">Title A-Z</option>
                  <option value="subject">Subject</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notes === undefined ? (
            <div className="col-span-2 liquid-glass p-8 rounded-m3-lg text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-body-large text-on-surface-variant">
                Loading notes...
              </p>
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="col-span-2 liquid-glass p-8 rounded-m3-lg text-center">
              <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-title-large text-on-surface mb-2">
                {searchQuery ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-body-large text-on-surface-variant">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first note to get started!"}
              </p>
            </div>
          ) : (
            sortedNotes.map((note) => <NoteCard key={note._id} note={note} />)
          )}
        </div>

        {/* Notes Stats */}
        {notes && notes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-primary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Total Notes
              </h3>
              <p className="text-headline-small text-primary-600 font-bold">
                {totalNotes}
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-secondary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                This Week
              </h3>
              <p className="text-headline-small text-secondary-600 font-bold">
                {recentNotes}
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 bg-accent-purple rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Subjects
              </h3>
              <p className="text-headline-small text-accent-purple font-bold">
                {subjects.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NotesPageWrapper() {
  return (
    <ProtectedRoute>
      <NotesPage />
    </ProtectedRoute>
  );
}

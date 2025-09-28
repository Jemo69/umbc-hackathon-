"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  FileText,
  Upload,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  Target,
  HelpCircle,
  Plus,
  Loader2,
} from "lucide-react";

// Document Card Component
const DocumentCard = ({ document }: { document: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteDocument = useMutation(api.documents.deleteDocument);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument({ documentId: document._id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="liquid-glass p-6 rounded-m3-lg border border-surface-200 hover:border-primary-300 transition-all duration-200 interactive animate-m3-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 m3-primary-container rounded-m3-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-700" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-title-large font-medium text-on-surface mb-2">
              {document.name}
            </h3>

            <div className="flex items-center space-x-4 text-body-small text-on-surface-variant mb-3">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(document.uploadedAt).toLocaleDateString()}
                </span>
              </span>
              {document.size && <span>{formatFileSize(document.size)}</span>}
              {document.type && (
                <span className="capitalize">{document.type}</span>
              )}
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-m3-sm ${getStatusColor(
                document.analysisStatus
              )}`}
            >
              {getStatusIcon(document.analysisStatus)}
              <span className="text-body-small font-medium capitalize">
                {document.analysisStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-m3-sm hover:bg-surface-100 transition-colors"
            title={isExpanded ? "Show less" : "Show more"}
          >
            <Eye className="w-4 h-4 text-on-surface-variant" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-m3-sm hover:bg-red-50 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Subject and Tags */}
      {(document.subject || document.tags?.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {document.subject && (
            <span className="inline-flex items-center px-2 py-1 rounded-m3-sm bg-primary-50 text-primary-700 text-body-small font-medium">
              <BookOpen className="w-3 h-3 mr-1" />
              {document.subject}
            </span>
          )}
          {document.tags?.map((tag: string, index: number) => (
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

      {/* Expanded Content */}
      {isExpanded && document.extractedData && (
        <div className="space-y-6 animate-m3-slide-up">
          {/* Summary */}
          {document.extractedData.summary && (
            <div>
              <h4 className="text-title-medium text-on-surface mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary-600" />
                Summary
              </h4>
              <p className="text-body-medium text-on-surface-variant bg-surface-50 p-4 rounded-m3-lg">
                {document.extractedData.summary}
              </p>
            </div>
          )}

          {/* Key Concepts */}
          {document.extractedData.keyConcepts?.length > 0 && (
            <div>
              <h4 className="text-title-medium text-on-surface mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-secondary-600" />
                Key Concepts
              </h4>
              <div className="flex flex-wrap gap-2">
                {document.extractedData.keyConcepts.map(
                  (concept: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-m3-lg text-body-medium"
                    >
                      {concept}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Assignments */}
          {document.extractedData.assignments?.length > 0 && (
            <div>
              <h4 className="text-title-medium text-on-surface mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-accent-orange" />
                Identified Assignments
              </h4>
              <div className="space-y-3">
                {document.extractedData.assignments.map(
                  (assignment: any, index: number) => (
                    <div
                      key={index}
                      className="liquid-glass p-4 rounded-m3-lg border border-surface-200"
                    >
                      <h5 className="text-title-small font-medium text-on-surface mb-2">
                        {assignment.title}
                      </h5>
                      {assignment.description && (
                        <p className="text-body-medium text-on-surface-variant mb-3">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {assignment.dueDate && (
                          <span className="text-body-small text-on-surface-variant">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {assignment.priority && (
                          <span
                            className={`px-2 py-1 rounded-m3-sm text-body-small font-medium ${
                              assignment.priority >= 8
                                ? "bg-red-50 text-red-700"
                                : assignment.priority >= 6
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            Priority: {assignment.priority}/10
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Deadlines */}
          {document.extractedData.deadlines?.length > 0 && (
            <div>
              <h4 className="text-title-medium text-on-surface mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                Important Deadlines
              </h4>
              <div className="space-y-2">
                {document.extractedData.deadlines.map(
                  (deadline: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-m3-lg"
                    >
                      <div>
                        <span className="text-body-medium font-medium text-red-800">
                          {deadline.title}
                        </span>
                        <span className="text-body-small text-red-600 ml-2 capitalize">
                          ({deadline.type})
                        </span>
                      </div>
                      <span className="text-body-medium font-medium text-red-700">
                        {new Date(deadline.date).toLocaleDateString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Study Questions */}
          {document.extractedData.studyQuestions?.length > 0 && (
            <div>
              <h4 className="text-title-medium text-on-surface mb-3 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-accent-purple" />
                Study Questions
              </h4>
              <div className="space-y-4">
                {document.extractedData.studyQuestions.map(
                  (question: any, index: number) => (
                    <div
                      key={index}
                      className="liquid-glass p-4 rounded-m3-lg border border-surface-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-body-medium font-medium text-on-surface flex-1">
                          {question.question}
                        </p>
                        {question.difficulty && (
                          <span
                            className={`px-2 py-1 rounded-m3-sm text-body-small font-medium ml-2 ${
                              question.difficulty === "hard"
                                ? "bg-red-50 text-red-700"
                                : question.difficulty === "medium"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        )}
                      </div>
                      {question.answer && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-body-small text-primary-600 hover:text-primary-700">
                            Show Answer
                          </summary>
                          <p className="text-body-medium text-on-surface-variant mt-2 p-3 bg-surface-50 rounded-m3-lg">
                            {question.answer}
                          </p>
                        </details>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// File Upload Component
const FileUpload = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    try {
      onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`liquid-glass p-8 rounded-m3-2xl border-2 border-dashed transition-colors ${
        isDragOver
          ? "border-primary-400 bg-primary-50"
          : "border-surface-300 hover:border-primary-400"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <div className="text-center">
        <div className="w-16 h-16 m3-primary rounded-full flex items-center justify-center mx-auto mb-4">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-white" />
          )}
        </div>

        <h3 className="text-title-large font-medium text-on-surface mb-2">
          {isUploading ? "Uploading..." : "Upload Document"}
        </h3>

        <p className="text-body-large text-on-surface-variant mb-6">
          Drag and drop your document here, or click to browse
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-3 m3-primary text-white rounded-m3-lg disabled:opacity-50 interactive focus-ring"
        >
          Choose File
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />

        <p className="text-body-small text-on-surface-variant mt-4">
          Supports PDF, DOC, DOCX, TXT, and image files
        </p>
      </div>
    </div>
  );
};

// Main Documents Page
const DocumentsPage = () => {
  const [filter, setFilter] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const documents = useQuery(api.documents.getDocuments, {});
  const addDocument = useMutation(api.documents.addDocument);

  // Filter documents
  const filteredDocuments =
    documents?.filter((doc) => {
      const matchesFilter = filter === "all" || doc.subject === filter;
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesFilter && matchesSearch;
    }) || [];

  // Get unique subjects for filter
  const subjects =
    Array.from(new Set(documents?.map((doc) => doc.subject).filter(Boolean))) ||
    [];

  const handleFileUpload = async (file: File) => {
    // In a real app, you'd upload to Convex storage first
    // For now, we'll simulate with a mock storage ID
    const mockStorageId = `mock-${Date.now()}-${file.name}`;

    await addDocument({
      storageId: mockStorageId,
      name: file.name,
      type: file.type.split("/")[1] || "unknown",
      size: file.size,
    });

    setShowUpload(false);
  };

  const totalDocuments = documents?.length || 0;
  const processedDocuments =
    documents?.filter((doc) => doc.analysisStatus === "completed").length || 0;
  const pendingDocuments =
    documents?.filter(
      (doc) =>
        doc.analysisStatus === "pending" || doc.analysisStatus === "processing"
    ).length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="liquid-glass-nav border-b border-surface-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 m3-primary rounded-m3-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-headline-small font-medium text-on-background">
                  Documents
                </h1>
                <p className="text-body-small text-on-surface-variant">
                  AI-powered document analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-body-small text-on-surface-variant">
                <span className="text-green-600 font-medium">
                  {processedDocuments} processed
                </span>
                <span>•</span>
                <span className="text-yellow-600 font-medium">
                  {pendingDocuments} pending
                </span>
              </div>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 m3-primary text-white rounded-m3-lg interactive focus-ring flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        {showUpload && (
          <div className="mb-8">
            <FileUpload onUpload={handleFileUpload} />
          </div>
        )}

        {/* Filters and Search */}
        <div className="m3-surface p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-3 py-2 liquid-glass border border-surface-200 rounded-m3-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors text-body-large text-on-surface placeholder:text-on-surface-variant"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
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
          </div>
        </div>

        {/* Documents Grid */}
        <div className="space-y-6">
          {documents === undefined ? (
            <div className="liquid-glass p-8 rounded-m3-lg text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-body-large text-on-surface-variant">
                Loading documents...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="liquid-glass p-8 rounded-m3-lg text-center">
              <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-title-large text-on-surface mb-2">
                {searchQuery ? "No documents found" : "No documents yet"}
              </h3>
              <p className="text-body-large text-on-surface-variant">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Upload your first document to get started with AI analysis!"}
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <DocumentCard key={document._id} document={document} />
            ))
          )}
        </div>

        {/* Document Stats */}
        {documents && documents.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-primary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Total Documents
              </h3>
              <p className="text-headline-small text-primary-600 font-bold">
                {totalDocuments}
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 m3-secondary rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                AI Processed
              </h3>
              <p className="text-headline-small text-secondary-600 font-bold">
                {processedDocuments}
              </p>
            </div>

            <div className="m3-surface p-6 text-center">
              <div className="w-12 h-12 bg-accent-orange rounded-m3-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title-large font-medium text-on-surface mb-2">
                Processing
              </h3>
              <p className="text-headline-small text-accent-orange font-bold">
                {pendingDocuments}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;

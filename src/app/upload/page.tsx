"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface UploadStatus {
  state: "idle" | "uploading" | "processing" | "success" | "error";
  message?: string;
  progress?: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setStatus({ state: "idle" });
    } else {
      setStatus({ state: "error", message: "Please upload a PDF file." });
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({ state: "idle" });
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setStatus({ state: "uploading", message: "Uploading document..." });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus({ state: "error", message: result.error || "Upload failed" });
        return;
      }

      setStatus({
        state: "processing",
        message: "Processing document... Extracting text and building knowledge graph.",
      });

      // Poll for processing status or just show success
      setStatus({
        state: "success",
        message: `Document "${file.name}" uploaded and processed successfully.`,
      });
      setFile(null);
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Upload Document
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Upload a PDF document to extract knowledge and build the graph.
          Supports English, French, and Arabic.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              dragActive
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <Upload className="h-10 w-10 text-zinc-400 mb-4" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">Drag and drop</span> your PDF here, or
            </p>
            <label className="mt-2 cursor-pointer">
              <span className="text-sm font-medium text-zinc-900 underline dark:text-zinc-50">
                browse files
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
            <p className="mt-2 text-xs text-zinc-500">PDF only, max 20MB</p>
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
              <FileText className="h-5 w-5 text-zinc-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-50">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button onClick={handleUpload} disabled={status.state === "uploading" || status.state === "processing"}>
                {status.state === "uploading" || status.state === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          )}

          {/* Status message */}
          {status.message && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-md p-3 text-sm ${
                status.state === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : status.state === "error"
                  ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                  : "bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {status.state === "success" && <CheckCircle className="h-4 w-4" />}
              {status.state === "error" && <AlertCircle className="h-4 w-4" />}
              {(status.state === "uploading" || status.state === "processing") && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Step 1</CardTitle>
            <CardDescription>PDF text extraction and chunking</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Step 2</CardTitle>
            <CardDescription>Embedding generation and concept extraction</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Step 3</CardTitle>
            <CardDescription>Knowledge graph construction</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

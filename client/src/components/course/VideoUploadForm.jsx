"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Inline form for uploading a video to a specific section.
 * Used inside ManageCoursePage for each section.
 */
export default function VideoUploadForm({ sectionId, isUploading, onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    await onUpload(sectionId, { title, video: file });
    setTitle("");
    setFile(null);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[140px]">
        <Input
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
        <Upload className="size-3" />
        {file ? file.name.slice(0, 20) : "Choose file"}
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <Button type="submit" size="xs" disabled={isUploading}>
        {isUploading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3" data-icon="inline-start" />
        )}
        Upload
      </Button>
    </form>
  );
}

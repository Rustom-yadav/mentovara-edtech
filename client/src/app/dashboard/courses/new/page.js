"use client";

import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourse } from "@/hooks/useCreateCourse";

export default function CreateCoursePage() {
  const {
    form,
    loading,
    thumbnail,
    onChange,
    onThumbnailChange,
    onSubmit,
    handleCancel,
  } = useCreateCourse();

  return (
    <div className="section-container max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>
      <p className="mt-1 text-muted-foreground">
        Fill in the details below to create your course. You can add sections
        and videos after creating it.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Complete Web Development Bootcamp"
            value={form.title}
            onChange={onChange}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe what students will learn…"
            value={form.description}
            onChange={onChange}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) — leave empty for free</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder="0"
            value={form.price}
            onChange={onChange}
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail</Label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {thumbnail ? thumbnail.name : "Click to upload thumbnail image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onThumbnailChange}
            />
          </label>
        </div>

        {/* Published toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={onChange}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm">Publish immediately</span>
        </label>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                Creating…
              </>
            ) : (
              "Create Course"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  PlayCircle,
  BookOpen,
  ChevronLeft,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useManageCourse } from "@/hooks/useManageCourse";
import VideoUploadForm from "@/components/course/VideoUploadForm";

export default function ManageCoursePage() {
  const { courseId } = useParams();
  const {
    course,
    sections,
    loading,
    newSectionTitle,
    addingSectionLoading,
    uploadingVideoFor,
    setNewSectionTitle,
    handleAddSection,
    handleDeleteSection,
    handleUploadVideo,
    handleDeleteVideo,
  } = useManageCourse(courseId);

  if (loading) {
    return (
      <div className="section-container flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="section-container flex flex-col items-center gap-4 py-32">
        <p className="font-medium">Course not found</p>
        <Link href="/dashboard/courses">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container max-w-3xl py-10">
      {/* Header */}
      <Link
        href="/dashboard/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        My Courses
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </div>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm">
            <BookOpen className="size-4" data-icon="inline-start" />
            Preview
          </Button>
        </Link>
      </div>

      <Separator className="my-6" />

      {/* Add Section Form */}
      <form onSubmit={handleAddSection} className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="sectionTitle">Add New Section</Label>
          <Input
            id="sectionTitle"
            placeholder="e.g. Getting Started"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
        </div>
        <Button type="submit" size="default" disabled={addingSectionLoading}>
          {addingSectionLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" data-icon="inline-start" />
          )}
          Add
        </Button>
      </form>

      {/* Sections List */}
      <div className="mt-8 space-y-4">
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            No sections yet. Add your first section above.
          </div>
        ) : (
          sections.map((section, sIdx) => (
            <div
              key={section._id}
              className="rounded-xl border border-border bg-card"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {sIdx + 1}. {section.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({section.videos?.length || 0} videos)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteSection(section._id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <Separator />

              {/* Videos */}
              <div className="divide-y divide-border">
                {section.videos?.map((video) => (
                  <div
                    key={video._id}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{video.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {video.duration
                        ? `${Math.floor(video.duration / 60)}m`
                        : "—"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteVideo(video._id, section._id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Upload Video */}
              <div className="border-t border-border px-4 py-3">
                <VideoUploadForm
                  sectionId={section._id}
                  isUploading={uploadingVideoFor === section._id}
                  onUpload={handleUploadVideo}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

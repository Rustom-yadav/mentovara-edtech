"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import api from "@/services/api";
import { ENDPOINTS, DIRECT_API_URL } from "@/services/endpoints";
import axios from "axios";

export default function ManageCoursePage() {
  const { courseId } = useParams();
  const accessToken = useSelector((s) => s.auth.accessToken);

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);
  const [uploadingVideoFor, setUploadingVideoFor] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        api.get(ENDPOINTS.COURSE_BY_ID(courseId)),
        api.get(ENDPOINTS.COURSE_SECTIONS(courseId)).catch(() => ({
          data: { data: [] },
        })),
      ]);
      setCourse(courseRes.data?.data);
      setSections(sectionsRes.data?.data || []);
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a new section
  async function handleAddSection(e) {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setAddingSectionLoading(true);
    try {
      const res = await api.post(ENDPOINTS.ADD_SECTION(courseId), {
        title: newSectionTitle.trim(),
      });
      setSections((prev) => [...prev, res.data?.data]);
      setNewSectionTitle("");
      toast.success("Section added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add section");
    } finally {
      setAddingSectionLoading(false);
    }
  }

  // Delete a section
  async function handleDeleteSection(sectionId) {
    if (!confirm("Delete this section and all its videos?")) return;
    try {
      await api.delete(ENDPOINTS.SECTION_BY_ID(sectionId));
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  }

  // Upload video to a section
  // Uses direct backend URL to bypass Next.js proxy body size limit (~4.5MB)
  async function handleUploadVideo(sectionId, formData) {
    setUploadingVideoFor(sectionId);
    try {
      formData.append("section", sectionId);
      const res = await axios.post(
        `${DIRECT_API_URL}${ENDPOINTS.VIDEOS}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          withCredentials: true, // fallback: send cookies if same-origin
          timeout: 5 * 60 * 1000, // 5 minutes for large video uploads
        }
      );
      const newVideo = res.data?.data;
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId
            ? { ...s, videos: [...(s.videos || []), newVideo] }
            : s
        )
      );
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload video");
    } finally {
      setUploadingVideoFor(null);
    }
  }

  // Delete a video
  async function handleDeleteVideo(videoId, sectionId) {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(ENDPOINTS.VIDEO_BY_ID(videoId));
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId
            ? { ...s, videos: s.videos.filter((v) => v._id !== videoId) }
            : s
        )
      );
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  }

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
                      onClick={() =>
                        handleDeleteVideo(video._id, section._id)
                      }
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

function VideoUploadForm({ sectionId, isUploading, onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast.error("Video title and file are required");
      return;
    }
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("video", file);

    await onUpload(sectionId, fd);
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

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Loader2,
  List,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/video/VideoPlayer";
import { useWatchCourse } from "@/hooks/useWatchCourse";

export default function WatchPage() {
  const { courseId, videoId } = useParams();
  const {
    video,
    sections,
    progress,
    loading,
    sidebarOpen,
    isCompleted,
    progressPercent,
    completedCount,
    totalVideos,
    toggleSidebar,
    markComplete,
  } = useWatchCourse(courseId, videoId);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="font-medium">Video not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm">
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Video Player */}
        <div className="w-full max-h-[70vh]">
          <VideoPlayer
            key={videoId}
            url={video.videoUrl}
            onEnded={() => {
              if (!isCompleted) markComplete();
            }}
          />
        </div>

        {/* Video Info Bar */}
        <div className="border-b border-border bg-card px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={`/courses/${courseId}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <ChevronLeft className="size-3.5" />
                  Course
                </Link>
              </div>
              <h1 className="mt-1 text-lg font-semibold">{video.title}</h1>
              {video.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {video.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile sidebar toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => toggleSidebar(true)}
              >
                <List className="size-4" data-icon="inline-start" />
                Curriculum
              </Button>

              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="size-3.5" />
                  Completed
                </span>
              ) : (
                <Button size="sm" onClick={markComplete}>
                  <CheckCircle2 className="size-4" data-icon="inline-start" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedCount}/{totalVideos} lectures completed
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-card lg:block">
        <SidebarContent
          sections={sections}
          courseId={courseId}
          currentVideoId={videoId}
          completedVideos={progress.completedVideos || []}
          progressPercent={progressPercent}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => toggleSidebar(false)}
          />
          <aside className="relative ml-auto w-80 max-w-[85vw] overflow-y-auto bg-card shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <span className="text-sm font-semibold">Curriculum</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => toggleSidebar(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent
              sections={sections}
              courseId={courseId}
              currentVideoId={videoId}
              completedVideos={progress.completedVideos || []}
              progressPercent={progressPercent}
              onNavigate={() => toggleSidebar(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  sections,
  courseId,
  currentVideoId,
  completedVideos,
  progressPercent,
  onNavigate,
}) {
  return (
    <div>
      {/* Progress header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Section list */}
      {sections.map((section, sIdx) => (
        <div key={section._id}>
          <div className="bg-muted/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {sIdx + 1}. {section.title}
          </div>
          {section.videos?.map((video) => {
            const isCurrent = video._id === currentVideoId;
            const isDone = completedVideos.includes(video._id);
            return (
              <Link
                key={video._id}
                href={`/watch/${courseId}/${video._id}`}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                ) : isCurrent ? (
                  <PlayCircle className="size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{video.title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

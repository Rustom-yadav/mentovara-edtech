"use client";

import Link from "next/link";
import { PlayCircle, CheckCircle2, Circle } from "lucide-react";

/**
 * Sidebar curriculum list shown on the Watch page.
 * Shows all sections/videos with completion status and active highlight.
 */
export default function CourseSidebar({
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

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle } from "lucide-react";

export default function CurriculumList({
  sections,
  progress,
  isEnrolled,
  isAuthenticated,
  totalVideos,
  totalDuration,
  courseId,
  formatDuration,
}) {
  return (
    <div className="section-container py-10">
      <h2 className="text-xl font-bold">Course Curriculum</h2>

      {!isAuthenticated ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="font-medium">Log in to see the full curriculum</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enroll in this course to access all lectures and track your progress.
          </p>
          <Link href={`/auth/login?from=/courses/${courseId}`} className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
        </div>
      ) : sections.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
          No sections added to this course yet.
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            {sections.length} section{sections.length !== 1 && "s"} &middot;{" "}
            {totalVideos} lecture{totalVideos !== 1 && "s"} &middot;{" "}
            {formatDuration(totalDuration)} total
          </p>
          <div className="mt-6 space-y-3">
            {sections.map((section, sIdx) => (
              <details
                key={section._id}
                className="group rounded-xl border border-border bg-card"
                open={sIdx === 0}
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium">
                  <span>
                    {sIdx + 1}. {section.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {section.videos?.length || 0} lectures
                  </span>
                </summary>
                <div className="border-t border-border">
                  {section.videos && section.videos.length > 0 ? (
                    section.videos.map((video, vIdx) => {
                      const isDone = progress?.completedVideos?.includes(video._id);

                      const rowContent = (
                        <div
                          className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                            isEnrolled ? "hover:bg-muted/50 cursor-pointer" : ""
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                          ) : (
                            <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1">
                            {sIdx + 1}.{vIdx + 1} {video.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(video.duration)}
                          </span>
                        </div>
                      );

                      return isEnrolled ? (
                        <Link key={video._id} href={`/watch/${courseId}/${video._id}`} className="block">
                          {rowContent}
                        </Link>
                      ) : (
                        <div key={video._id}>{rowContent}</div>
                      );
                    })
                  ) : (
                    <p className="px-5 py-3 text-sm text-muted-foreground">
                      No lectures in this section yet.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

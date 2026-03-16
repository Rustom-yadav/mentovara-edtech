"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  PlayCircle,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // getCourseById is public — no auth needed
        const courseRes = await api.get(ENDPOINTS.COURSE_BY_ID(courseId));
        setCourse(courseRes.data?.data);

        // getCourseSections requires JWT — only fetch if logged in
        if (isAuthenticated) {
          try {
            const secRes = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
            setSections(secRes.data?.data || []);
          } catch {
            setSections([]);
          }
        }
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId, isAuthenticated]);

  const isEnrolled = user?.enrolledCourses?.includes(courseId);
  const isOwner =
    course?.instructor?._id === user?._id ||
    course?.instructor === user?._id;

  const totalVideos = sections.reduce(
    (sum, sec) => sum + (sec.videos?.length || 0),
    0
  );
  const totalDuration = sections.reduce(
    (sum, sec) =>
      sum +
      (sec.videos?.reduce((vSum, v) => vSum + (v.duration || 0), 0) || 0),
    0
  );

  function formatDuration(seconds) {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push(`/auth/login?from=/courses/${courseId}`);
      return;
    }
    setEnrolling(true);
    try {
      await api.post(ENDPOINTS.ENROLL(courseId));
      toast.success("Enrolled successfully!");
      // Refresh user so enrolledCourses updates in Redux
      await refreshUser();
      // Increment local count
      setCourse((prev) =>
        prev
          ? { ...prev, enrolledStudents: (prev.enrolledStudents || 0) + 1 }
          : prev
      );
      // Now fetch sections since user is enrolled
      try {
        const secRes = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
        setSections(secRes.data?.data || []);
      } catch {
        // sections might not exist yet
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
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
      <div className="section-container flex flex-col items-center gap-4 py-32 text-center">
        <BookOpen className="size-12 text-muted-foreground/40" />
        <p className="font-medium">Course not found</p>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  // Find the first video for "Continue Learning" button
  const firstVideo = sections[0]?.videos?.[0];

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="section-container py-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/courses" className="hover:text-foreground">
                  Courses
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="truncate font-medium text-foreground">
                  {course.title}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {course.title}
              </h1>

              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                {course.description}
              </p>

              {/* Meta */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {course.instructor?.avatar ? (
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.fullName}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="size-6 rounded-full bg-primary/10" />
                  )}
                  <span className="font-medium text-foreground">
                    {course.instructor?.fullName || "Instructor"}
                  </span>
                </div>
                <Separator orientation="vertical" className="!h-4" />
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  {course.enrolledStudents || 0} students
                </div>
                {isAuthenticated && totalVideos > 0 && (
                  <>
                    <Separator orientation="vertical" className="!h-4" />
                    <div className="flex items-center gap-1">
                      <PlayCircle className="size-4" />
                      {totalVideos} lectures
                    </div>
                    <Separator orientation="vertical" className="!h-4" />
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {formatDuration(totalDuration)}
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isOwner ? (
                  <Link href={`/dashboard/courses/${courseId}/manage`}>
                    <Button size="lg">Manage Course</Button>
                  </Link>
                ) : isEnrolled ? (
                  <Link
                    href={
                      firstVideo
                        ? `/watch/${courseId}/${firstVideo._id}`
                        : "#"
                    }
                  >
                    <Button size="lg" className="gap-2">
                      <PlayCircle className="size-4" data-icon="inline-start" />
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        Enroll{" "}
                        {course.price > 0 ? `— ₹${course.price}` : "Free"}
                      </>
                    )}
                  </Button>
                )}
                {isEnrolled && (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    Enrolled
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted lg:aspect-[4/3]">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="size-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum — only visible when authenticated */}
      <div className="section-container py-10">
        <h2 className="text-xl font-bold">Course Curriculum</h2>

        {!isAuthenticated ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="font-medium">Log in to see the full curriculum</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enroll in this course to access all lectures and track your
              progress.
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
                      section.videos.map((video, vIdx) => (
                        <div
                          key={video._id}
                          className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-muted/50 transition-colors"
                        >
                          <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1">
                            {sIdx + 1}.{vIdx + 1} {video.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(video.duration)}
                          </span>
                          {isEnrolled && (
                            <Link href={`/watch/${courseId}/${video._id}`}>
                              <Button variant="ghost" size="xs">
                                Watch
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))
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
    </div>
  );
}

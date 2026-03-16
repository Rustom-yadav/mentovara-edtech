"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, BookOpen, Loader2, Trash2, Settings, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

export default function InstructorCoursesPage() {
  const { user, isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyCourses() {
      try {
        const res = await api.get(ENDPOINTS.COURSES, {
          params: { page: 1, limit: 100 },
        });
        const allCourses = res.data?.data?.docs || [];
        const mine = allCourses.filter(
          (c) =>
            c.instructor?._id === user?._id || c.instructor === user?._id
        );
        setCourses(mine);
      } catch (err) {
        // Backend returns 404 when no published courses exist — that's OK
        if (err?.response?.status !== 404) {
          toast.error("Failed to load your courses");
        }
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    if (user?._id) loadMyCourses();
  }, [user?._id]);

  async function handleDelete(courseId) {
    if (!confirm("Are you sure? This will permanently delete the course and all its content."))
      return;
    try {
      await api.delete(ENDPOINTS.COURSE_BY_ID(courseId));
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    }
  }

  if (!isInstructor) {
    return (
      <div className="section-container flex flex-col items-center gap-4 py-32 text-center">
        <BookOpen className="size-12 text-muted-foreground/40" />
        <p className="font-medium">Instructor access only</p>
        <p className="text-sm text-muted-foreground">
          Switch to an instructor account to manage courses.
        </p>
      </div>
    );
  }

  return (
    <div className="section-container py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your courses
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button size="sm">
            <Plus className="size-4" data-icon="inline-start" />
            New Course
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <p className="font-medium">No courses yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first course and start teaching!
          </p>
          <Link href="/dashboard/courses/new">
            <Button size="sm">
              <Plus className="size-4" data-icon="inline-start" />
              Create Course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              {/* Thumbnail */}
              <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="size-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{course.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {course.isPublished ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                  <span>{course.enrolledStudents || 0} students</span>
                  <span>{course.price > 0 ? `₹${course.price}` : "Free"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link href={`/dashboard/courses/${course._id}/manage`}>
                  <Button variant="ghost" size="icon-sm">
                    <Settings className="size-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(course._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

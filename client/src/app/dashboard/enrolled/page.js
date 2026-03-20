"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CourseCard from "@/components/course/CourseCard";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import Link from "next/link";

export default function EnrolledCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrolled() {
      if (!user?.enrolledCourses?.length) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          user.enrolledCourses.map((id) =>
            api.get(ENDPOINTS.COURSE_BY_ID(id)).then((r) => r.data?.data),
          ),
        );
        setCourses(results.filter(Boolean));
      } catch {
        toast.error("Failed to load enrolled courses");
      } finally {
        setLoading(false);
      }
    }
    loadEnrolled();
  }, [user?.enrolledCourses]);

  return (
    <div className="section-container py-10">
      <h1 className="text-2xl font-bold tracking-tight">My Enrolled Courses</h1>
      <p className="mt-1 text-muted-foreground">
        Continue learning where you left off
      </p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <p className="font-medium">No courses yet</p>
          <p className="text-sm text-muted-foreground">
            Browse courses and enroll to start learning!
          </p>
          <Link
            href="/courses"
            className="text-sm font-medium text-primary hover:underline"
          >
            Explore Courses →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

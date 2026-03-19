"use client";
import { useEffect, useState } from "react";
import CourseCard from "@/components/course/CourseCard";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

export default function PopularCoursesList() {
  const [popularCourses, setPopularCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.get(ENDPOINTS.COURSES, {
          params: { page: 1, limit: 4 },
        });
        setPopularCourses(res.data?.data?.docs || []);
      } catch {
        setPopularCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    }
    loadCourses();
  }, []);

  if (coursesLoading) {
    return null;
  }

  if (popularCourses.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-muted/30 py-24">
      <div className="section-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular <span className="gradient-text">Courses</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              See what learners are exploring right now.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

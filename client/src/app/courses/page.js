"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Loader2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import { fetchCourses } from "@/store/slices/courseSlice";

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { courses, pagination, isLoading, error } = useSelector(
    (s) => s.course
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses whenever page or query changes
  const loadCourses = useCallback(
    (page = 1) => {
      dispatch(fetchCourses({ page, limit: 12, query: debouncedQuery }));
    },
    [dispatch, debouncedQuery]
  );

  useEffect(() => {
    loadCourses(1);
  }, [loadCourses]);

  return (
    <div className="section-container py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Explore Courses
          </h1>
          <p className="mt-1 text-muted-foreground">
            {pagination.totalDocs > 0
              ? `${pagination.totalDocs} courses available`
              : "Find your next learning adventure"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Loading courses…</p>
        </div>
      ) : error ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No courses found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {debouncedQuery
                ? `No results for "${debouncedQuery}". Try a different search term.`
                : "There are no published courses yet. Check back soon!"}
            </p>
          </div>
          {debouncedQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <p className="font-medium">No courses yet</p>
          <p className="text-sm text-muted-foreground">
            Courses will appear here once instructors publish them.
          </p>
        </div>
      ) : (
        <>
          {/* Course Grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {(pagination.hasPrevPage || pagination.hasNextPage) && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => loadCourses(pagination.page - 1)}
              >
                <ChevronLeft className="size-4" data-icon="inline-start" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => loadCourses(pagination.page + 1)}
              >
                Next
                <ChevronRight className="size-4" data-icon="inline-end" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

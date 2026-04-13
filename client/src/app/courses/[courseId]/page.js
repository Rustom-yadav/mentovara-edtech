"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useCourseDetail } from "@/hooks/useCourseDetail";
import CourseHero from "@/components/course/CourseHero";
import CurriculumList from "@/components/course/CurriculumList";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const {
    course,
    sections,
    progress,
    loading,
    paymentStep,
    enrolling,
    isAuthenticated,
    isEnrolled,
    isOwner,
    isPaid,
    totalVideos,
    totalDuration,
    continueVideo,
    formatDuration,
    handlePrimaryAction,
  } = useCourseDetail(courseId, router);

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

  return (
    <div>
      <CourseHero
        course={course}
        isOwner={isOwner}
        isEnrolled={isEnrolled}
        isPaid={isPaid}
        totalVideos={totalVideos}
        totalDuration={totalDuration}
        continueVideo={continueVideo}
        formatDuration={formatDuration}
        handlePrimaryAction={handlePrimaryAction}
        paymentStep={paymentStep}
        enrolling={enrolling}
        isAuthenticated={isAuthenticated}
      />

      <CurriculumList
        sections={sections}
        progress={progress}
        isEnrolled={isEnrolled}
        isAuthenticated={isAuthenticated}
        totalVideos={totalVideos}
        totalDuration={totalDuration}
        courseId={courseId}
        formatDuration={formatDuration}
      />
    </div>
  );
}

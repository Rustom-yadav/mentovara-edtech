import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Users,
  PlayCircle,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  IndianRupee,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CourseHero({
  course,
  isOwner,
  isEnrolled,
  isPaid,
  totalVideos,
  totalDuration,
  continueVideo,
  formatDuration,
  handlePrimaryAction,
  paymentStep,
  enrolling,
  isAuthenticated,
}) {
  function getEnrollButtonContent() {
    if (paymentStep === "initiating") {
      return (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Creating payment order…</span>
        </>
      );
    }
    if (paymentStep === "paying") {
      return (
        <>
          <CreditCard className="size-4 animate-pulse" />
          <span>Complete payment in Razorpay…</span>
        </>
      );
    }
    if (paymentStep === "verifying") {
      return (
        <>
          <ShieldCheck className="size-4 animate-pulse" />
          <span>Verifying payment…</span>
        </>
      );
    }
    if (paymentStep === "success") {
      return (
        <>
          <CheckCircle2 className="size-4" />
          <span>Course Unlocked!</span>
        </>
      );
    }
    if (enrolling) {
      return <Loader2 className="size-4 animate-spin" />;
    }
    if (isPaid) {
      return (
        <>
          <Lock className="size-4" />
          <span>Enroll Now — ₹{course.price}</span>
        </>
      );
    }
    return "Enroll to watch all videos (Free)";
  }

  return (
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

            {/* Price badge for paid courses */}
            {!isOwner && !isEnrolled && isPaid && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                <IndianRupee className="size-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {course.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  one-time payment
                </span>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-2">
              {isOwner ? (
                <Button size="lg" onClick={handlePrimaryAction}>
                  Manage Course
                </Button>
              ) : isEnrolled ? (
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handlePrimaryAction}
                  disabled={!continueVideo}
                >
                  <PlayCircle className="size-4" data-icon="inline-start" />
                  {continueVideo ? "Continue Learning" : "No videos yet"}
                </Button>
              ) : (
                <Button
                  id="enroll-btn"
                  size="lg"
                  className={`gap-2 transition-all duration-300 ${
                    paymentStep === "success"
                      ? "bg-green-600 hover:bg-green-600 text-white"
                      : ""
                  }`}
                  onClick={handlePrimaryAction}
                  disabled={enrolling}
                >
                  {getEnrollButtonContent()}
                </Button>
              )}
              {!isOwner && !isEnrolled && (
                <p className="text-sm text-muted-foreground">
                  {isPaid
                    ? "Secure payment via Razorpay. Unlock all course videos, progress tracking, and watch page access."
                    : "Click the button above to enroll and unlock all course videos, progress tracking, and watch page access."}
                </p>
              )}
              {isEnrolled && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    Enrolled
                  </span>
                  {continueVideo && (
                    <span className="text-xs text-muted-foreground">
                      Click the button above to continue watching.
                    </span>
                  )}
                </div>
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
  );
}

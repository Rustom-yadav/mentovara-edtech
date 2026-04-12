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
  ShieldCheck,
  CreditCard,
  IndianRupee,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useRazorpay } from "@/hooks/useRazorpay";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { isLoaded: isRazorpayReady, openCheckout } = useRazorpay();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Payment-specific states
  const [paymentStep, setPaymentStep] = useState("idle"); // idle | initiating | paying | verifying | success

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
            const [secRes, progRes] = await Promise.all([
              api.get(ENDPOINTS.COURSE_SECTIONS(courseId)).catch(() => ({ data: { data: [] } })),
              api.get(ENDPOINTS.PROGRESS(courseId)).catch(() => ({ data: { data: { completedVideos: [] } } }))
            ]);
            setSections(secRes.data?.data || []);
            setProgress(progRes.data?.data || { completedVideos: [] });
          } catch {
            setSections([]);
            setProgress({ completedVideos: [] });
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
  const isPaid = course?.price > 0;

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

  function handlePrimaryAction() {
    if (isOwner) {
      router.push(`/dashboard/courses/${courseId}/manage`);
      return;
    }
    if (isEnrolled && continueVideo) {
      router.push(`/watch/${courseId}/${continueVideo._id}`);
      return;
    }
    // If not enrolled, this will also handle redirecting unauthenticated users
    handleEnroll();
  }

  /**
   * Handles enrollment:
   * - Free courses → direct enrollment via /courses/:id/enroll
   * - Paid courses → Razorpay checkout flow
   */
  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push(`/auth/login?from=/courses/${courseId}`);
      return;
    }

    // ── Free course: Direct enrollment ──
    if (!isPaid) {
      setEnrolling(true);
      try {
        await api.post(ENDPOINTS.ENROLL(courseId));
        toast.success("Enrolled successfully!");
        await refreshUser();
        setCourse((prev) =>
          prev
            ? { ...prev, enrolledStudents: (prev.enrolledStudents || 0) + 1 }
            : prev
        );
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
      return;
    }

    // ── Paid course: Razorpay payment flow ──
    if (!isRazorpayReady) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    setEnrolling(true);
    setPaymentStep("initiating");

    try {
      // Step 1: Create Razorpay order via backend
      const { data } = await api.post(ENDPOINTS.INITIATE_PAYMENT, { courseId });
      const order = data?.data;

      if (!order?.id) {
        throw new Error("Failed to create payment order");
      }

      setPaymentStep("paying");

      // Step 2: Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Mentovara",
        description: course.title,
        order_id: order.id,
        image: "/temp/logo.png",
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4F46E5",
        },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          setPaymentStep("verifying");
          try {
            await api.post(ENDPOINTS.VERIFY_PAYMENT, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
            });

            // Step 4: Success!
            setPaymentStep("success");
            toast.success("🎉 Payment successful! Course unlocked!");

            // Refresh user state so enrolledCourses updates
            await refreshUser();

            // Update local course state
            setCourse((prev) =>
              prev
                ? { ...prev, enrolledStudents: (prev.enrolledStudents || 0) + 1 }
                : prev
            );

            // Fetch sections now that user is enrolled
            try {
              const secRes = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
              setSections(secRes.data?.data || []);
            } catch {
              // sections might not exist yet
            }

            // Reset payment step after showing success briefly
            setTimeout(() => {
              setPaymentStep("idle");
              setEnrolling(false);
            }, 2500);
          } catch (err) {
            setPaymentStep("idle");
            setEnrolling(false);
            toast.error(
              err?.response?.data?.message ||
                "Payment verification failed. If money was deducted, it will be refunded automatically."
            );
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without paying
            setPaymentStep("idle");
            setEnrolling(false);
            toast.info("Payment cancelled. You can try again anytime.");
          },
        },
      };

      openCheckout(options);
    } catch (err) {
      setPaymentStep("idle");
      setEnrolling(false);
      toast.error(
        err?.response?.data?.message || "Could not initiate payment. Please try again."
      );
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

  // Find the next video for "Continue Learning" button
  const allVideos = sections.flatMap((s) => s.videos || []);
  const firstUnwatchedVideo = allVideos.find(
    (v) => !progress?.completedVideos?.includes(v._id)
  );
  // Default to the first unwatched, or the first video if all watched/progress missing
  const continueVideo = firstUnwatchedVideo || allVideos[0];

  // Enrollment button label & icon logic
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
    // Default idle state
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

            {/* Thumbnail — static visual only */}
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
    </div>
  );
}

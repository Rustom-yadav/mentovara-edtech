import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useRazorpay } from "./useRazorpay";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { formatDuration, calculateTotalDuration, calculateProgressPercent } from "@/utilities";
import { countTotalVideos, findFirstUnwatched } from "@/utilities";

export function useCourseDetail(courseId, router) {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { isLoaded: isRazorpayReady, openCheckout } = useRazorpay();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [paymentStep, setPaymentStep] = useState("idle");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const courseRes = await api.get(ENDPOINTS.COURSE_BY_ID(courseId));
        setCourse(courseRes.data?.data);

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
  const isOwner = course?.instructor?._id === user?._id || course?.instructor === user?._id;
  const isPaid = course?.price > 0;

  const totalVideos = countTotalVideos(sections);
  const totalDuration = calculateTotalDuration(sections);

  const continueVideo = findFirstUnwatched(sections, progress?.completedVideos || []);

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push(`/auth/login?from=/courses/${courseId}`);
      return;
    }

    if (!isPaid) {
      setEnrolling(true);
      try {
        await api.post(ENDPOINTS.ENROLL(courseId));
        toast.success("Enrolled successfully!");
        await refreshUser();
        setCourse((prev) => prev ? { ...prev, enrolledStudents: (prev.enrolledStudents || 0) + 1 } : prev);
        
        try {
          const secRes = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
          setSections(secRes.data?.data || []);
        } catch {}
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to enroll");
      } finally {
        setEnrolling(false);
      }
      return;
    }

    if (!isRazorpayReady) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    setEnrolling(true);
    setPaymentStep("initiating");

    try {
      const { data } = await api.post(ENDPOINTS.INITIATE_PAYMENT, { courseId });
      const order = data?.data;

      if (!order?.id) throw new Error("Failed to create payment order");

      setPaymentStep("paying");

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
        theme: { color: "#4F46E5" },
        handler: async (response) => {
          setPaymentStep("verifying");
          try {
            await api.post(ENDPOINTS.VERIFY_PAYMENT, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
            });

            setPaymentStep("success");
            toast.success("🎉 Payment successful! Course unlocked!");

            await refreshUser();
            setCourse((prev) => prev ? { ...prev, enrolledStudents: (prev.enrolledStudents || 0) + 1 } : prev);
            
            try {
              const secRes = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
              setSections(secRes.data?.data || []);
            } catch {}

            setTimeout(() => {
              setPaymentStep("idle");
              setEnrolling(false);
            }, 2500);
          } catch (err) {
            setPaymentStep("idle");
            setEnrolling(false);
            toast.error(err?.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
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
      toast.error(err?.response?.data?.message || "Could not initiate payment. Please try again.");
    }
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
    handleEnroll();
  }

  return {
    course,
    sections,
    progress,
    loading,
    enrolling,
    paymentStep,
    user,
    isAuthenticated,
    isEnrolled,
    isOwner,
    isPaid,
    totalVideos,
    totalDuration,
    continueVideo,
    formatDuration,
    handlePrimaryAction
  };
}

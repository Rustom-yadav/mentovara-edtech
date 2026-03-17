"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Play,
  BarChart3,
  Users,
  Sparkles,
  GraduationCap,
  Monitor,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const STEPS = [
  {
    step: "01",
    icon: BookOpen,
    title: "Browse Courses",
    description: "Explore a growing library of expert-led video courses across topics you care about.",
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    step: "02",
    icon: GraduationCap,
    title: "Enroll Instantly",
    description: "One click to enroll — no credit card, no hassle. Start learning right away.",
    color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
  },
  {
    step: "03",
    icon: Play,
    title: "Learn & Track Progress",
    description: "Watch video lectures, mark them complete, and see your progress grow in real time.",
    color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  },
];

const FEATURES = [
  {
    icon: Monitor,
    title: "Learn at Your Own Pace",
    description: "No deadlines, no pressure. Watch lectures whenever it suits you and pick up right where you left off.",
  },
  {
    icon: BarChart3,
    title: "See Your Growth",
    description: "A visual progress bar tracks every lecture you complete — stay motivated and never lose your place.",
  },
  {
    icon: BookOpen,
    title: "Well-Structured Curriculum",
    description: "Every course is organized into clear sections and lectures, making complex topics easy to follow.",
  },
  {
    icon: Users,
    title: "Learn from Real Instructors",
    description: "Courses are created by instructors who manage their own content — not scraped or auto-generated.",
  },
  {
    icon: Play,
    title: "Stream Anywhere",
    description: "High-quality video streaming that works on any device — desktop, tablet, or mobile.",
  },
  {
    icon: GraduationCap,
    title: "Student & Instructor Roles",
    description: "Join as a student to learn, or switch to instructor to share your knowledge with the world.",
  },
];

const INSTRUCTOR_BENEFITS = [
  "Create unlimited courses with sections and video lectures",
  "Upload videos directly — we handle the streaming",
  "Track how many students enroll in your courses",
  "Full control to edit, publish, or unpublish anytime",
];

export default function HomePage() {
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

  return (
    <div className="flex flex-col">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-60 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="section-container relative flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" />
            Free to join — no credit card needed
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Master New Skills with{" "}
            <span className="gradient-text">Expert-Led Video Courses</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Mentovara is where instructors create structured, high-quality video
            courses and students learn with real-time progress tracking — all in
            one clean, distraction-free platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 px-6">
                Start Learning Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="gap-2 px-6">
                <BookOpen className="size-4" data-icon="inline-start" />
                Browse Courses
              </Button>
            </Link>
          </div>

          {/* Platform preview mockup */}
          <div className="mt-16 w-full max-w-4xl">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-yellow-400" />
                <div className="size-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-muted-foreground">mentovara.com/courses</span>
              </div>
              <div className="rounded-xl bg-muted/50 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4">
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Play className="size-8 text-primary/40" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-muted-foreground/15" />
                        <div className="h-2 w-full rounded-full bg-muted-foreground/10" />
                        <div className="h-2 w-2/3 rounded-full bg-muted-foreground/10" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="size-5 rounded-full bg-primary/20" />
                        <div className="h-2 w-16 rounded-full bg-muted-foreground/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start learning in <span className="gradient-text">3 simple steps</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              No complicated setup. Browse, enroll, and learn — it&apos;s that easy.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="relative text-center">
                {idx < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute top-12 left-[60%] hidden w-[80%] border-t-2 border-dashed border-border sm:block" />
                )}
                <div className={`mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${step.color}`}>
                  <step.icon className="size-6" />
                </div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                  Step {step.step}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="py-24">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">learn & grow</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for students who want to learn efficiently and instructors who
              want to teach effectively.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover-lift"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== POPULAR COURSES ===================== */}
      {!coursesLoading && popularCourses.length > 0 && (
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
              <Link href="/courses">
                <Button variant="outline" className="gap-1.5">
                  View All Courses
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TEACH ON MENTOVARA ===================== */}
      <section className="py-24">
        <div className="section-container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="size-3.5" />
                For Instructors
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Share your knowledge,{" "}
                <span className="gradient-text">teach the world</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Create your own courses with structured sections and video
                lectures. Upload content, manage curriculum, and watch your
                student community grow.
              </p>

              <ul className="mt-8 space-y-3">
                {INSTRUCTOR_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2">
                    Start Teaching
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="h-3 w-32 rounded-full bg-muted-foreground/15" />
                    <div className="mt-1.5 h-2 w-20 rounded-full bg-muted-foreground/10" />
                  </div>
                </div>
                <div className="space-y-3">
                  {["Getting Started", "Core Concepts", "Advanced Topics"].map((title, i) => (
                    <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
                      <div className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : i === 1
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{3 + i} lectures</p>
                      </div>
                      <Play className="size-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                  <span className="text-xs font-medium text-primary">12 students enrolled</span>
                  <span className="text-xs text-muted-foreground">Published</span>
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="py-24">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-3xl gradient-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

            <div className="relative mx-auto max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your learning journey starts here
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join Mentovara today — create a free account in seconds and start
                exploring courses built by real instructors.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 px-6 font-semibold"
                  >
                    Create Free Account
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 px-6 text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
                  >
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

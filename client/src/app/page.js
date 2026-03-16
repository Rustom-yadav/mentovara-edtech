import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Play,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Courses organized into sections and video lectures — everything you need, step by step.",
  },
  {
    icon: Play,
    title: "Video-First Learning",
    description:
      "High-quality video content uploaded by expert instructors and streamed via Cloudinary.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Mark lectures complete, see your progress bar grow, and stay motivated throughout.",
  },
  {
    icon: Users,
    title: "Instructor & Student Roles",
    description:
      "Teach or learn — instructors manage courses and students enroll in a single click.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Cookie-based JWT auth, encrypted passwords, and role-based access control keep your data safe.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on Next.js and Express for blazing page loads and instant API responses.",
  },
];

const STATS = [
  { value: "100+", label: "Courses" },
  { value: "5K+", label: "Students" },
  { value: "50+", label: "Instructors" },
  { value: "10K+", label: "Videos" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-60 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="section-container relative flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" />
            Modern EdTech Platform
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Learn Without Limits with{" "}
            <span className="gradient-text">Mentovara</span>
          </h1>

          {/* Sub-heading */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A powerful platform where instructors create structured video courses
            and students learn with real-time progress tracking — all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 px-6">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="gap-2 px-6">
                <Play className="size-4" data-icon="inline-start" />
                Browse Courses
              </Button>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid w-full max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold gradient-text">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">learn & teach</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mentovara combines a rich feature set with a clean developer
              experience, so you can focus on what matters — education.
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

      {/* ===================== CTA ===================== */}
      <section className="py-24">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-3xl gradient-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

            <div className="relative mx-auto max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to start learning?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of students and instructors on Mentovara. Create
                your free account today and unlock unlimited courses.
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border py-8">
        <div className="section-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Mentovara"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-semibold">Mentovara</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mentovara. Built by Rustom.
          </p>
        </div>
      </footer>
    </div>
  );
}

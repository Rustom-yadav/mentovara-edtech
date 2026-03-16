"use client";

import { BookOpen, GraduationCap, PlayCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const STAT_CARDS = [
  {
    label: "Enrolled Courses",
    key: "enrolledCourses",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40",
  },
  {
    label: "Watch History",
    key: "watchHistory",
    icon: PlayCircle,
    color:
      "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40",
  },
];

export default function DashboardPage() {
  const { user, isAuthenticated, loading, isInstructor } = useAuth();

  if (loading) {
    return (
      <div className="section-container py-16">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-10">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user?.fullName?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isInstructor
            ? "Manage your courses and track student enrollment."
            : "Pick up where you left off or explore new courses."}
        </p>
      </div>

      {/* Role Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
        <GraduationCap className="size-4" />
        {isInstructor ? "Instructor" : "Student"}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const count = user?.[card.key]?.length ?? 0;
          return (
            <div
              key={card.key}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className={`rounded-xl p-3 ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          );
        })}

        {/* Quick action card */}
        <a
          href="/courses"
          className="group flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="rounded-xl bg-muted p-3 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="font-semibold group-hover:text-primary">
              {isInstructor ? "Create a Course" : "Browse Courses"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isInstructor
                ? "Start building your next course"
                : "Discover something new to learn"}
            </p>
          </div>
        </a>
      </div>

      {/* Placeholder for future sections */}
      <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          More dashboard features coming soon — enrolled courses list,
          continue watching, and instructor analytics.
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  PlusCircle,
  Settings,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading, isInstructor } = useAuth();

  if (loading) {
    return (
      <div className="section-container py-16">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const studentLinks = [
    {
      href: "/dashboard/enrolled",
      icon: BookOpen,
      title: "My Courses",
      desc: "View your enrolled courses and continue learning",
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40",
    },
    {
      href: "/courses",
      icon: PlayCircle,
      title: "Browse Courses",
      desc: "Discover new courses to enroll in",
      color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      title: "My Profile",
      desc: "Update your name, avatar, and details",
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40",
    },
  ];

  const instructorLinks = [
    {
      href: "/dashboard/courses",
      icon: Settings,
      title: "My Courses",
      desc: "Manage your courses, sections, and videos",
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40",
    },
    {
      href: "/dashboard/courses/new",
      icon: PlusCircle,
      title: "Create Course",
      desc: "Start building a new course from scratch",
      color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/40",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      title: "My Profile",
      desc: "Update your name, avatar, and details",
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40",
    },
  ];

  const links = isInstructor ? instructorLinks : studentLinks;

  return (
    <div className="section-container py-10">
      {/* Greeting */}
      <div className="mb-2">
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

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover-lift">
              <div>
                <div className={`mb-4 inline-flex rounded-xl p-3 ${link.color}`}>
                  <link.icon className="size-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {link.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Go <ArrowRight className="size-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-3xl font-bold gradient-text">
            {user?.enrolledCourses?.length ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Enrolled Courses</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-3xl font-bold gradient-text">
            {user?.watchHistory?.length ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Videos Watched</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-3xl font-bold gradient-text capitalize">
            {user?.role || "student"}
          </p>
          <p className="text-sm text-muted-foreground">Account Type</p>
        </div>
      </div>
    </div>
  );
}

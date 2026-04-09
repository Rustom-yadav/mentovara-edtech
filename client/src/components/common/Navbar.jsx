"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
];

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, loading, handleLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function confirmLogout() {
    setShowLogoutConfirm(false);
    setMobileOpen(false);
    handleLogout();
  }

  // Show a minimal navbar on auth pages
  if (pathname?.startsWith("/auth")) {
    return (
      <header className="glass-nav sticky top-0 z-50">
        <nav className="section-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/temp/logo.png"
              alt="Mentovara"
              width={120}
              height={72}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight gradient-text">
              Mentovara
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                Courses
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="section-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/temp/logo.png"
            alt="Mentovara"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight gradient-text">
            Mentovara
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                size="sm"
              >
                <link.icon className="size-4" data-icon="inline-start" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Desktop right section */}
        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard
                    className="size-4"
                    data-icon="inline-start"
                  />
                  Dashboard
                </Button>
              </Link>

              <Separator orientation="vertical" className="!h-6" />

              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatar} alt={user?.fullName} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {user?.fullName}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                >
                  <link.icon className="size-4" data-icon="inline-start" />
                  {link.label}
                </Button>
              </Link>
            ))}

            <Separator className="my-2" />

            {loading ? (
              <div className="h-9 animate-pulse rounded-lg bg-muted" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <LayoutDashboard
                      className="size-4"
                      data-icon="inline-start"
                    />
                    Dashboard
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  size="sm"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut className="size-4" data-icon="inline-start" />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button className="w-full" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="size-5 text-destructive" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Log out?</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmLogout}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

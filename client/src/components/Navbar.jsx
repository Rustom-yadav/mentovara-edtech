"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_LINKS = [
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

  // Hide navbar on auth pages for a cleaner look
  if (pathname?.startsWith("/auth")) return null;

  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="section-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/temp/logo.png"
            alt="Mentovara"
            width={72}
            height={72}
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
                  <LayoutDashboard className="size-4" data-icon="inline-start" />
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

              <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
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
                    <span className="text-sm font-medium">{user?.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <LayoutDashboard className="size-4" data-icon="inline-start" />
                    Dashboard
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
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
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";

function VerifyEmailForm() {
  const {
    email,
    otp,
    error,
    resendCooldown,
    loading,
    initialEmail,
    from,
    setEmail,
    setOtp,
    onSubmit,
    onResend,
  } = useVerifyEmail();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <Image
              src="/temp/logo.png"
              alt="Mentovara"
              width={80}
              height={80}
              className="rounded-xl"
            />
            <span className="text-xl font-bold gradient-text">Mentovara</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Verify your email
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a 6-digit code to your email address.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!initialEmail}
                className={initialEmail ? "bg-muted text-muted-foreground" : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="tracking-[0.5em] text-center text-lg font-bold"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                  Verifying...
                </>
              ) : (
                "Verify and Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center justify-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onResend}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : "Resend Code"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={`/auth/login${from ? `?from=${from}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

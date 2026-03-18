import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
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
  );
}

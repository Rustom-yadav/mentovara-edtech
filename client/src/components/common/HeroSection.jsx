import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
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
      </div>
    </section>
  );
}

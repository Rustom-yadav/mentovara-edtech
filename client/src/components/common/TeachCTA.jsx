import { Sparkles, Users, Play } from "lucide-react";

const INSTRUCTOR_BENEFITS = [
  "Create unlimited courses with sections and video lectures",
  "Upload videos directly — we handle the streaming",
  "Track how many students enroll in your courses",
  "Full control to edit, publish, or unpublish anytime",
];

export default function TeachCTA() {
  return (
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
                  <span>✔️</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <button className="gap-2 cursor-pointer px-6 py-2 bg-primary text-white rounded-lg">
                Start Teaching
              </button>
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
                {["Getting Started", "Core Concepts", "Advanced Topics"].map(
                  (title, i) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5"
                    >
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${
                          i === 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : i === 1
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">
                          {i + 1} lecture{i !== 0 ? "s" : ""}
                        </p>
                      </div>
                      <Play className="size-4 text-muted-foreground" />
                    </div>
                  ),
                )}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                <span className="text-xs font-medium text-primary">
                  120+ students enrolled
                </span>
                <span className="text-xs text-muted-foreground">Published</span>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  Monitor,
  BarChart3,
  BookOpen,
  Users,
  Play,
  GraduationCap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Monitor,
    title: "Learn at Your Own Pace",
    description:
      "No deadlines, no pressure. Watch lectures whenever it suits you and pick up right where you left off.",
  },
  {
    icon: BarChart3,
    title: "See Your Growth",
    description:
      "A visual progress bar tracks every lecture you complete — stay motivated and never lose your place.",
  },
  {
    icon: BookOpen,
    title: "Well-Structured Curriculum",
    description:
      "Every course is organized into clear sections and lectures, making complex topics easy to follow.",
  },
  {
    icon: Users,
    title: "Learn from Real Instructors",
    description:
      "Courses are created by instructors who manage their own content — not scraped or auto-generated.",
  },
  {
    icon: Play,
    title: "Stream Anywhere",
    description:
      "High-quality video streaming that works on any device — desktop, tablet, or mobile.",
  },
  {
    icon: GraduationCap,
    title: "Student & Instructor Roles",
    description:
      "Join as a student to learn, or switch to instructor to share your knowledge with the world.",
  },
];

export default function Features() {
  return (
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
  );
}

import { BookOpen, GraduationCap, Play } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: BookOpen,
    title: "Browse Courses",
    description:
      "Explore a growing library of expert-led video courses across topics you care about.",
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    step: "02",
    icon: GraduationCap,
    title: "Enroll Instantly",
    description:
      "One click to enroll — no credit card, no hassle. Start learning right away.",
    color:
      "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
  },
  {
    step: "03",
    icon: Play,
    title: "Learn & Track Progress",
    description:
      "Watch video lectures, mark them complete, and see your progress grow in real time.",
    color:
      "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  },
];

export default function StepsSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-24">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start learning in{" "}
            <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            No complicated setup. Browse, enroll, and learn — it's that easy.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="relative text-center">
              {idx < STEPS.length - 1 && (
                <div className="pointer-events-none absolute top-12 left-[60%] hidden w-[80%] border-t-2 border-dashed border-border sm:block" />
              )}
              <div
                className={`mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${step.color}`}
              >
                <step.icon className="size-6" />
              </div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.step}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

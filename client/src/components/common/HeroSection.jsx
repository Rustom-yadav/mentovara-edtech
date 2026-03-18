export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* Hero content yahan aayega */}
      <div className="section-container relative flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
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

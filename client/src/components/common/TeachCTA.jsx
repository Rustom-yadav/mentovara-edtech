export default function TeachCTA() {
  const INSTRUCTOR_BENEFITS = [
    "Create unlimited courses with sections and video lectures",
    "Upload videos directly — we handle the streaming",
    "Track how many students enroll in your courses",
    "Full control to edit, publish, or unpublish anytime",
  ];
  return (
    <section className="py-24">
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
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
        </div>
      </div>
    </section>
  );
}

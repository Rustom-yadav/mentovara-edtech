import CourseCard from "@/components/CourseCard";

export default function PopularCoursesList() {
  // Dummy data, replace with API logic if needed
  const popularCourses = [
    { _id: 1, title: "React Basics" },
    { _id: 2, title: "Advanced JavaScript" },
    { _id: 3, title: "UI/UX Design" },
    { _id: 4, title: "Node.js Essentials" },
  ];
  return (
    <section className="border-t border-border bg-muted/30 py-24">
      <div className="section-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular <span className="gradient-text">Courses</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              See what learners are exploring right now.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

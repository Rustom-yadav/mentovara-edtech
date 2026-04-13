import Link from "next/link";
import Image from "next/image";
import { Users, BookOpen } from "lucide-react";

export default function CourseCard({ course, index = 0 }) {
  const {
    _id,
    title,
    description,
    thumbnail,
    price,
    instructor,
    enrolledStudents = 0,
    sections = [],
  } = course;

  return (
    <Link href={`/courses/${_id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover-lift">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              priority={index < 2}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="size-10 text-muted-foreground/40" />
            </div>
          )}
          {/* Price badge */}
          <div className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {price > 0 ? `₹${price}` : "Free"}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-semibold group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>

          {/* Instructor + Stats */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {instructor?.avatar ? (
                <Image
                  src={instructor.avatar}
                  alt={instructor.fullName}
                  width={20}
                  height={20}
                  style={{ height: "auto" }}
                  className="rounded-full"
                />
              ) : (
                <div className="size-5 rounded-full bg-primary/10" />
              )}
              <span className="max-w-[120px] truncate font-medium">
                {instructor?.fullName || "Instructor"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="size-3.5" />
              <span>{enrolledStudents}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

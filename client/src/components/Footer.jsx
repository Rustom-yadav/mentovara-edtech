import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="section-container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/temp/logo.png"
            alt="Mentovara"
            width={24}
            height={24}
            className="rounded-md"
          />
          <span className="text-sm font-semibold">Mentovara</span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground transition-colors">
            Courses
          </Link>
          <Link href="/auth/register" className="hover:text-foreground transition-colors">
            Sign up
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mentovara. Built by Rustom.
        </p>
      </div>
    </footer>
  );
}

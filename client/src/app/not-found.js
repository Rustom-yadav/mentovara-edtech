import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold gradient-text">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="outline" size="sm">
          <Home className="size-4" data-icon="inline-start" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}

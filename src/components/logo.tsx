import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "inline-flex items-baseline gap-2 rounded-sm text-heading-2 text-heading focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <span aria-hidden className="font-mono">
        &gt;_
      </span>
      <span>
        <span className="text-primary">byte</span>yourjob
      </span>
    </Link>
  );
}

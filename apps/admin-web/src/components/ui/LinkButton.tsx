import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:opacity-90 shadow-[var(--shadow-soft)]",
  secondary:
    "bg-surface-2 text-foreground hover:bg-[var(--border)] border border-[var(--border)]",
  outline:
    "border border-[var(--border-strong)] bg-transparent text-foreground hover:bg-surface-2",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
};

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

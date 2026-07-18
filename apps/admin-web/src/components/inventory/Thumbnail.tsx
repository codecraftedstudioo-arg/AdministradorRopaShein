import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Thumbnail({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-2 text-muted",
          className,
        )}
      >
        <ImageIcon className="h-1/3 w-1/3" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}

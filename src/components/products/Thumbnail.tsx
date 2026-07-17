import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Thumbnail({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-muted",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <ImageIcon className="h-1/3 w-1/3" />
      )}
    </div>
  );
}

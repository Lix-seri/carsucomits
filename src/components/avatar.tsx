import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<string, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({
  name, src, size = "md", ringed = false, className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_CLASS;
  ringed?: boolean;
  className?: string;
}) {
  const dim = SIZE_CLASS[size];
  const ring = ringed ? "border-4 border-white shadow" : "";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", dim, ring, className)}
      />
    );
  }
  return (
    <span className={cn("grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white", dim, ring, className)}>
      {initialsFor(name)}
    </span>
  );
}

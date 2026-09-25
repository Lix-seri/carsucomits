import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-8 w-8 text-base" : size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-base";
  const label = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className={`${dim} grid place-items-center rounded-lg bg-brand-500 font-bold text-white`}>CC</span>
      <span className={`${label} font-bold tracking-tight`}>CarsuComits</span>
    </Link>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Signed-in page frame shared by the student side and the staff panels. From `lg` up the sidebar
 * sits beside the content; below that it's a drawer behind the menu button. `bottomNav` (students)
 * adds the phone tab bar, and the page leaves room for it.
 */
export function AppShell({
  sidebar, header, children, bottomNav,
}: { sidebar: React.ReactNode; header: React.ReactNode; children: React.ReactNode; bottomNav?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex min-h-screen bg-canvas">
      {open && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <div
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-canvas px-3 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-ink hover:bg-sunken lg:hidden"
            aria-label="Open menu"
            aria-controls="app-sidebar"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">{header}</div>
        </div>
        <main id="main" className={cn("min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8", bottomNav && "pb-28 lg:pb-8")}>{children}</main>
      </div>
      {bottomNav}
    </div>
  );
}

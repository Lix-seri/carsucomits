/** "5 minutes ago" style, used on reviews. */
export function timeAgo(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [div, name] of intervals) {
    if (value < div) { unit = name; break; }
    value = value / div;
    unit = name;
  }
  const v = Math.floor(value);
  return v <= 1 ? `just now` : `${v} ${unit}${v === 1 ? "" : "s"} ago`;
}

/** "5m ago" style, used in messages and notifications. */
export function timeAgoShort(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/** ₱500 or ₱500–800/hr */
export function formatFare(c: { fareMin: number; fareMax: number | null; fareUnit: string | null }) {
  return c.fareMax ? `₱${c.fareMin}–${c.fareMax}${c.fareUnit ?? ""}` : `₱${c.fareMin}${c.fareUnit ?? ""}`;
}

/** The campus timezone. Servers run in UTC, so anything "today"-shaped must say where. */
export const CAMPUS_TZ = "Asia/Manila";

export function greeting(d = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: CAMPUS_TZ }).format(d));
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Calendar days from today to a date, counted in Manila, so "today" means the campus day. */
function daysUntil(deadline: Date, now: Date) {
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: CAMPUS_TZ }).format(d); // YYYY-MM-DD
  return Math.round((Date.parse(day(deadline)) - Date.parse(day(now))) / 86_400_000);
}

/** A human countdown for a deadline: "Due in 3 days", "Due today", "2 days overdue", "No deadline". */
export function dueLabel(deadline: Date | string | null | undefined, now = new Date()) {
  if (!deadline) return "No deadline";
  const days = daysUntil(new Date(deadline), now);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days < 14) return `Due in ${days} days`;
  if (days < 60) return `Due in ${Math.round(days / 7)} weeks`;
  return `Due ${new Date(deadline).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: CAMPUS_TZ })}`;
}

/** "₱1,250" for totals; fares keep formatFare. */
export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

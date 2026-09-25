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

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

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

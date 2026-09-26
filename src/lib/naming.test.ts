import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Item 7 (decision 0015): the university is "Caraga State University – Main Campus" or "CSU Main".

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(tsx?|mjs)$/.test(f) && !f.endsWith(".test.ts") ? [p] : [];
  });
}

test("no other form of the university's name appears in the app or the seed", () => {
  const offenders: string[] = [];
  for (const file of [...sourceFiles("src"), "prisma/seed.mjs"]) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      const cleaned = line.replaceAll("Caraga State University – Main Campus", "").replaceAll("CSU Main", "");
      if (/Caraga State University|\bCSU\b|\bCarSU\b/.test(cleaned)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, []);
});

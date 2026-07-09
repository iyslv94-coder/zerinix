import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const forbiddenDisplayLiterals = [
  "Source unavailable",
  "TBD",
  "Placeholder",
  "Unknown",
  "Confidence unavailable",
  "Unavailable",
];

const reportSurfaceFiles = [
  "components/Planner.tsx",
  "app/dashboard/[id]/page.tsx",
  "app/dashboard/[id]/ReportPdfButton.tsx",
];

test("Market Analysis report surfaces do not render forbidden placeholder strings", () => {
  for (const file of reportSurfaceFiles) {
    const source = readFileSync(file, "utf8");

    for (const forbidden of forbiddenDisplayLiterals) {
      assert.equal(
        source.includes(forbidden),
        false,
        `${file} must not render ${forbidden}`
      );
    }

    assert.equal(
      source.includes('|| "Assumption"'),
      false,
      `${file} must not use Assumption as a visual fallback`
    );
  }
});

test("Market Analysis partial report copy is professional and not debug-facing", () => {
  const source = readFileSync("app/api/market-analysis/route.ts", "utf8");

  assert.equal(source.includes("was missing or incomplete"), false);
  assert.equal(source.includes("sections were missing"), false);
  assert.equal(source.includes("write exactly: Source unavailable"), false);
});

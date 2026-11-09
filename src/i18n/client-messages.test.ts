import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { CLIENT_NAMESPACES } from "./client-messages";

const srcDir = join(process.cwd(), "src");

function clientFiles() {
  return readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
    .map((file) => readFileSync(join(srcDir, file), "utf8"))
    .filter((source) => /^["']use client["']/.test(source));
}

it('sends every namespace a "use client" file translates to the browser', () => {
  const used = clientFiles().flatMap((source) =>
    [...source.matchAll(/useTranslations\(["'](\w+)/g)].map(
      (match) => match[1],
    ),
  );

  expect(used.length).toBeGreaterThan(0);
  for (const namespace of used) {
    expect(CLIENT_NAMESPACES).toContain(namespace);
  }
});

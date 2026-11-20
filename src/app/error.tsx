"use client"; // Error boundaries are React class components under the hood: client-only.

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

type ErrorPageProps = {
  error: unknown;
  /** Re-fetches and re-renders the segment that failed. */
  retry: () => void;
};

/**
 * Shown when a page throws, e.g. the offers query fails. Inside the root layout, so the
 * translations provider is available. In production the error's message is replaced by a
 * digest, so server details never reach the browser.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // A place to report to an error tracker later; the server has logged it already.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <Heading level={1} variant="h1">
        {t("title")}
      </Heading>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button onClick={retry}>{t("retry")}</Button>
    </main>
  );
}

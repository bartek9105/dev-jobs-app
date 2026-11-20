"use client";

import { useLocale } from "next-intl";
import { useSyncExternalStore } from "react";
import { formatTimeAgo } from "@/lib/format-time-ago";

type TimeAgoProps = {
  /** ISO date string, as the database returns it. */
  date: string;
  className?: string;
};

/**
 * "2d ago", worked out in the browser. Why not on the server: pages like the offer list
 * are prerendered and cached for hours, so a label computed there would be hours out of
 * date, and Cache Components rejects Date.now() during prerendering anyway.
 *
 * The prerendered HTML holds the plain date ("Nov 18, 2026"), which needs no clock. In the
 * browser it becomes the relative time and updates every minute.
 */
export function TimeAgo({ date, className }: TimeAgoProps) {
  const locale = useLocale();
  const minute = useSyncExternalStore(
    subscribeToMinutes,
    currentMinute,
    // On the server, and while hydrating, there's no "now": render the plain date.
    () => null,
  );

  const absolute = formatAbsoluteDate(date, locale);

  return (
    <time dateTime={date} title={absolute} className={className}>
      {minute === null
        ? absolute
        : formatTimeAgo(date, minute * 60_000, locale)}
    </time>
  );
}

// Whole minutes, not Date.now(): useSyncExternalStore needs the same value on every call
// until something changes, and the label changes at most once a minute.
function currentMinute() {
  return Math.floor(Date.now() / 60_000);
}

function subscribeToMinutes(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

// Fixed to UTC so the server and the browser print the same day, whatever their time
// zones; otherwise hydration would see different text around midnight.
function formatAbsoluteDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}

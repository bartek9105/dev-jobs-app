const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

// Largest unit first: the first one that fits at least once is used.
const UNITS = [
  ["year", YEAR],
  ["month", MONTH],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
] as const;

/**
 * How long ago a date was, in the short form used on job boards: "now", "5m ago",
 * "3h ago", "2d ago", "1mo ago", "1y ago". Rounded down, so 47 hours is "1d ago".
 *
 * Intl.RelativeTimeFormat supplies the wording for each locale, so other languages work
 * without new translations ("2 dni temu" in Polish).
 *
 * `now` is a parameter rather than Date.now() inside: the result depends on when it's
 * called, which tests need to control and Cache Components won't allow during
 * prerendering. Use the <TimeAgo> component to show it on a page.
 */
export function formatTimeAgo(
  date: string | Date,
  now: number,
  locale: string,
): string {
  // A date slightly in the future (clocks that disagree) counts as now.
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(date).getTime()) / 1000),
  );

  const unit = UNITS.find(([, size]) => seconds >= size);
  if (!unit) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      0,
      "second",
    );
  }

  const [name, size] = unit;
  return new Intl.RelativeTimeFormat(locale, { style: "narrow" }).format(
    -Math.floor(seconds / size),
    name,
  );
}

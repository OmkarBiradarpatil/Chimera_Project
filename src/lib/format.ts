// Deterministic formatters — safe for SSR (no locale/timezone drift).
// All dates are formatted in UTC with fixed en-US locale so server and client match.

const DAY_MONTH = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const TIME_ONLY = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export const formatDayMonth = (iso: string | Date) => DAY_MONTH.format(new Date(iso));
export const formatDate = (iso: string | Date) => FULL_DATE.format(new Date(iso));
export const formatDateTime = (iso: string | Date) => DATE_TIME.format(new Date(iso)) + " UTC";
export const formatTime = (iso: string | Date) => TIME_ONLY.format(new Date(iso)) + " UTC";

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-US").format(n);

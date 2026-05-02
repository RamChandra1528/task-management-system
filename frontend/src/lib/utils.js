import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  parseISO
} from "date-fns";

export const referenceDate = new Date("2025-05-12T14:30:00.000Z");

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value, pattern = "MMM d, yyyy") {
  if (!value) return "No date";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern);
}

export function formatTime(value, pattern = "h:mm a") {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern);
}

export function relativeToReference(value) {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : value;
  const minutes = differenceInMinutes(referenceDate, date);
  const hours = differenceInHours(referenceDate, date);
  const days = differenceInDays(referenceDate, date);

  if (Math.abs(minutes) < 60) {
    return `${Math.max(1, Math.abs(minutes))}m ${minutes >= 0 ? "ago" : "from now"}`;
  }

  if (Math.abs(hours) < 24) {
    return `${Math.max(1, Math.abs(hours))}h ${hours >= 0 ? "ago" : "from now"}`;
  }

  return `${Math.max(1, Math.abs(days))}d ${days >= 0 ? "ago" : "from now"}`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function statusLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export const priorityTheme = {
  high: "bg-rose-100 text-rose-500",
  medium: "bg-amber-100 text-amber-500",
  low: "bg-emerald-100 text-emerald-500"
};

export const statusTheme = {
  active: "bg-brand-50 text-brand-600",
  "at-risk": "bg-amber-100 text-amber-600",
  completed: "bg-emerald-100 text-emerald-600",
  archived: "bg-slate-100 text-slate-500",
  "on-hold": "bg-rose-100 text-rose-500",
  backlog: "bg-slate-100 text-slate-500",
  todo: "bg-blue-50 text-blue-500",
  in_progress: "bg-brand-50 text-brand-600",
  review: "bg-amber-100 text-amber-500",
  done: "bg-emerald-100 text-emerald-600",
  blocked: "bg-rose-100 text-rose-500",
  online: "text-emerald-500",
  away: "text-amber-500",
  offline: "text-slate-400"
};

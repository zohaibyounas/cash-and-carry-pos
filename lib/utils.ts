import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities to prevent hydration errors
export function formatDateSafe(date: Date | string | null | undefined, formatStr: string = "MMM dd, yyyy"): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return format(dateObj, formatStr);
  } catch {
    return "Invalid Date";
  }
}

export function formatDateTimeSafe(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return format(dateObj, "MMM dd, yyyy HH:mm");
  } catch {
    return "Invalid Date";
  }
}

export function formatTimeSafe(date: Date | string | null | undefined): string {
  if (!date) return "—";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "—";
    return format(dateObj, "HH:mm");
  } catch {
    return "—";
  }
}

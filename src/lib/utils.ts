import { type ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | number | Date): string {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}dt yg lalu`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m yg lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j yg lalu`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}hr yg lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}bln yg lalu`;
  const years = Math.floor(months / 12);
  return `${years}th yg lalu`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateTotalPages(totalItems: number, perPage: number): number {
  const safePerPage = Math.max(1, Math.floor(perPage));
  if (!Number.isFinite(totalItems) || totalItems <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / safePerPage));
}
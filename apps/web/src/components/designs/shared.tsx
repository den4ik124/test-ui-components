import type { BillParameter } from "../../BillParameter";
import { BillStatusEnum } from "../../BillStatusEnum";

export const STATUS_LABELS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]: "Created",
  [BillStatusEnum.Paid]: "Paid",
  [BillStatusEnum.Confirmed]: "Confirmed",
  [BillStatusEnum.Outdated]: "Outdated",
};

export const STATUS_BADGE_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  [BillStatusEnum.Paid]:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  [BillStatusEnum.Confirmed]:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  [BillStatusEnum.Outdated]:
    "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export const STATUS_DOT_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]: "bg-blue-500",
  [BillStatusEnum.Paid]: "bg-emerald-500",
  [BillStatusEnum.Confirmed]: "bg-violet-500",
  [BillStatusEnum.Outdated]: "bg-gray-400",
};

export const STATUS_RING_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]: "ring-blue-500/30",
  [BillStatusEnum.Paid]: "ring-emerald-500/30",
  [BillStatusEnum.Confirmed]: "ring-violet-500/30",
  [BillStatusEnum.Outdated]: "ring-gray-400/20",
};

export const PARAM_ICONS: Record<string, string> = {
  "Electricity": "⚡",
  "Cold Water": "💧",
  "Hot Water": "🔥",
  "Gas": "🌡",
  "Heating System": "🏠",
  "Air Conditioning": "❄️",
  "Garbage Collection": "🗑",
  "Building Maintenance": "🔧",
  "Building Insurance": "🛡",
  "Elevator Maintenance": "🛗",
  "Common Area Electricity": "💡",
  "Internet / Broadband": "🌐",
  "Security System": "🔒",
  "TV Cable": "📺",
  "Parking": "🅿",
  "Lawn / Landscaping": "🌿",
  "Water Drainage": "🚿",
  "Pest Control": "🐛",
  "Fire Safety Inspection": "🚒",
  "Intercom Maintenance": "🔔",
};

export function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

export function formatShortPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "short",
    year: "2-digit",
  });
}

export function calcUsage(p: BillParameter): number {
  return p.value - p.previousValue;
}

export function calcAmount(p: BillParameter): number {
  return calcUsage(p) * p.price;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("default", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

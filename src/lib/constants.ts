import type { CargoCategory, CargoStatus, WarehouseRegion } from "./types";

export const CATEGORY_LABELS: Record<CargoCategory, string> = {
  NEW: "Yangi tovarlar",
  IN_TRANSIT: "Yo‘ldagi tovarlar",
  ARRIVED: "Kelgan tovarlar",
};

export const STATUS_LABELS: Record<CargoStatus, string> = {
  CHINA_WAREHOUSE: "Xitoy omborida",
  DEPARTED: "Yo‘lga chiqdi",
  AT_BORDER: "Chegarada",
  ARRIVED_TASHKENT: "Toshkentga yetib keldi",
};

export const REGION_LABELS: Record<WarehouseRegion, string> = {
  CHINA: "Xitoy",
  TASHKENT: "Toshkent",
};

export const STATUS_COLORS: Record<CargoStatus, string> = {
  CHINA_WAREHOUSE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  DEPARTED: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  AT_BORDER: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  ARRIVED_TASHKENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export const CATEGORY_COLORS: Record<CargoCategory, string> = {
  NEW: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  IN_TRANSIT: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  ARRIVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
};

export const SESSION_COOKIE = "dextrans_admin_session";

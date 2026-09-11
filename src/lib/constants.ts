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
  CHINA_WAREHOUSE: "chip-warehouse",
  DEPARTED: "chip-departed",
  AT_BORDER: "chip-border",
  ARRIVED_TASHKENT: "chip-tashkent",
};

export const CATEGORY_COLORS: Record<CargoCategory, string> = {
  NEW: "chip-new",
  IN_TRANSIT: "chip-transit",
  ARRIVED: "chip-arrived",
};

export const CARGO_STATUS_ORDER: CargoStatus[] = [
  "CHINA_WAREHOUSE",
  "DEPARTED",
  "AT_BORDER",
  "ARRIVED_TASHKENT",
];

export const SESSION_COOKIE = "dextrans_admin_session";

export type CargoCategory = "NEW" | "IN_TRANSIT" | "ARRIVED";
export type CargoStatus =
  | "CHINA_WAREHOUSE"
  | "DEPARTED"
  | "AT_BORDER"
  | "ARRIVED_TASHKENT";
export type WarehouseRegion = "CHINA" | "TASHKENT";

export const CARGO_CATEGORIES: CargoCategory[] = ["NEW", "IN_TRANSIT", "ARRIVED"];
export const CARGO_STATUSES: CargoStatus[] = [
  "CHINA_WAREHOUSE",
  "DEPARTED",
  "AT_BORDER",
  "ARRIVED_TASHKENT",
];
export const WAREHOUSE_REGIONS: WarehouseRegion[] = ["CHINA", "TASHKENT"];

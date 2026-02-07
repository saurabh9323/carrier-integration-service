export interface Package {
  weight: number;
  weightUnit: "KG" | "LB";
  length: number;
  width: number;
  height: number;
  dimensionUnit: "CM" | "IN";
}

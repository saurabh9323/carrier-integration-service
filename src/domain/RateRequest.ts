import type { Address } from "./Address.js";
import type { Package } from "./Package.js";

export interface RateRequest {
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceCode?: string; // optional (Ground, Express)
}

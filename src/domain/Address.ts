export interface Address {
  countryCode: string;   // "IN", "US"
  postalCode: string;
  city: string;
  state?: string;
}

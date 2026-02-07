export interface RateQuote {
  carrier: string;          // "UPS"
  serviceCode: string;
  serviceName: string;
  totalCharge: number;
  currency: string;
  estimatedDeliveryDays?: number;
}

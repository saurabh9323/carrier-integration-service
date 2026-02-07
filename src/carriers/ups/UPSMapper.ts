import { RateRequest } from "../../domain/RateRequest";
import { RateQuote } from "../../domain/RateQuote";

export class UPSMapper {
  static toUPSPayload(request: RateRequest) {
    return {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
        },
        Shipment: {
          Shipper: {
            Address: {
              CountryCode: request.origin.countryCode,
              PostalCode: request.origin.postalCode,
            },
          },
          ShipTo: {
            Address: {
              CountryCode: request.destination.countryCode,
              PostalCode: request.destination.postalCode,
              City: request.destination.city,
            },
          },
          Package: request.packages.map((pkg) => ({
            Packaging: { Code: "02" },
            Dimensions: {
              UnitOfMeasurement: { Code: pkg.dimensionUnit },
              Length: pkg.length.toString(),
              Width: pkg.width.toString(),
              Height: pkg.height.toString(),
            },
            PackageWeight: {
              UnitOfMeasurement: { Code: pkg.weightUnit === "LB" ? "LBS" : "KGS" },
              Weight: pkg.weight.toString(),
            },
          })),
        },
      },
    };
  }

 static toDomain(upsResponse: any): RateQuote[] {
    const ratedShipments = upsResponse?.RateResponse?.RatedShipment;
    
    if (!ratedShipments) {
      return [];
    }

    const shipments = Array.isArray(ratedShipments) ? ratedShipments : [ratedShipments];

    return shipments.map((shipment: any) => ({
      carrier: "UPS",
      serviceCode: shipment.Service.Code,
      serviceName: this.getServiceName(shipment.Service.Code),
      
      // FIX: Changed 'totalChargevb' to 'totalCharge'
      totalCharge: parseFloat(shipment.TotalCharges.MonetaryValue),
      
      currency: shipment.TotalCharges.CurrencyCode,
      estimatedDeliveryDays: shipment.GuaranteedDelivery?.BusinessDaysInTransit
        ? parseInt(shipment.GuaranteedDelivery.BusinessDaysInTransit)
        : undefined,
    }));
  }

  private static getServiceName(code: string): string {
    const names: Record<string, string> = {
      "03": "UPS Ground",
      "02": "UPS 2nd Day Air",
      "01": "UPS Next Day Air",
    };
    return names[code] || `UPS Service ${code}`;
  }
}
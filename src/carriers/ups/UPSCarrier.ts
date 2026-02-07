import axios from "axios";
import type { Carrier } from "../Carrier";
import type { RateRequest } from "../../domain/RateRequest";
import type { RateQuote } from "../../domain/RateQuote";
import { UPSAuthClient } from "./UPSAuthClient";
import { UPSMapper } from "./UPSMapper";
import { CarrierError } from "../../errors/CarrierError";

export class UPSCarrier implements Carrier {
  readonly name = "UPS";

  private authClient = new UPSAuthClient();
  private baseUrl =
    process.env.UPS_BASE_URL || "https://onlinetools.ups.com";

  async getRates(request: RateRequest): Promise<RateQuote[]> {
    try {
      const token = await this.authClient.getAccessToken();
      return await this.fetchRates(request, token);
    } catch (error: any) {
      const status =
        error?.response?.status ??
        error?.status ??
        error?.code;

      // 🔁 401 → refresh token and retry ONCE
      if (status === 401) {
        const newToken = await this.authClient.getAccessToken();

        try {
          return await this.fetchRates(request, newToken);
        } catch (retryError) {
          throw this.handleError(retryError);
        }
      }

      throw this.handleError(error);
    }
  }

 private async fetchRates(
  request: RateRequest,
  token: string
): Promise<RateQuote[]> {

  if (process.env.NODE_ENV !== "production") {
    // 🔒 Mocked response for local dev
    return [
      {
        carrier: this.name,
        serviceCode: "UPS_GROUND",
        serviceName: "UPS Ground",
        totalCharge: 450,
        currency: "INR",
        estimatedDeliveryDays: 3,
      },
    ];
  }

  // Real call (future)
  const payload = UPSMapper.toUPSPayload(request);

  const response = await axios.post(
    `${this.baseUrl}/rating/v1/Shop`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        transId: crypto.randomUUID(),
        transactionSrc: "Cybership_Takehome",
      },
    }
  );

  return UPSMapper.toDomain(response.data);
}

  private handleError(error: any): CarrierError {
    const status =
      error?.response?.status ??
      error?.status ??
      error?.code;

    if (status === 401) {
      return new CarrierError(
        this.name,
        "UNAUTHORIZED",
        "UPS authentication failed",
        error
      );
    }

    if (status >= 500) {
      return new CarrierError(
        this.name,
        "UPS_API_ERROR",
        "UPS API Error",
        error
      );
    }

    return new CarrierError(
      this.name,
      "UNKNOWN",
      "An unexpected error occurred",
      error
    );
  }
}

import type { Carrier } from "../Carrier";
import type { RateRequest } from "../../domain/RateRequest";
import type { RateQuote } from "../../domain/RateQuote";
import { UPSAuthClient } from "./UPSAuthClient";

export class UPSCarrier implements Carrier {
  readonly name = "UPS";
  private authClient = new UPSAuthClient();

  async getRates(request: RateRequest): Promise<RateQuote[]> {
    // 1️⃣ Get token (cached / refreshed automatically)
    const token = await this.authClient.getAccessToken();

    // 2️⃣ Simulate UPS rate API call using token
    console.log("📦 Calling UPS Rates API with token:", token);

    // 3️⃣ Return normalized response
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
}

import { describe, it, expect, vi } from "vitest";
import { UPSCarrier } from "../carriers/ups/UPSCarrier";
import { RateRequest } from "../domain/RateRequest";
import { UPSAuthClient } from "../carriers/ups/UPSAuthClient";


describe("UPSCarrier Integration", () => {
  it("returns normalized rate quotes for a valid request", async () => {
    const ups = new UPSCarrier();

    const request: RateRequest = {
      origin: {
        countryCode: "IN",
        postalCode: "110001",
        city: "Delhi",
      },
      destination: {
        countryCode: "IN",
        postalCode: "400001",
        city: "Mumbai",
      },
      packages: [
        {
          weight: 2,
          weightUnit: "KG",
          length: 10,
          width: 10,
          height: 10,
          dimensionUnit: "CM",
        },
      ],
    };

    const rates = await ups.getRates(request);

    expect(rates).toHaveLength(1);
    expect(rates[0]).toMatchObject({
      carrier: "UPS",
      serviceCode: "UPS_GROUND",
      currency: "INR",
    });
  });
});

describe("UPSAuthClient", () => {
  it("reuses UPS access token if not expired", async () => {
    const auth = new UPSAuthClient();

    const spy = vi.spyOn<any, any>(auth as any, "fetchNewToken");

    const token1 = await auth.getAccessToken();
    const token2 = await auth.getAccessToken();

    expect(token1).toBe(token2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

// ...existing code...
  it("refreshes token when expired", async () => {
    const auth = new UPSAuthClient();

    // we intentionally touch internal state for testing
    ;(auth as any).token = {
      accessToken: "expired-token",
      expiresAt: Date.now() - 1000,
    };

    const token = await auth.getAccessToken();

    expect(token).toBe("mock-ups-access-token");
  });
// ...existing code...
});

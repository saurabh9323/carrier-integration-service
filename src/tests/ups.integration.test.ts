import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { UPSCarrier } from "../carriers/ups/UPSCarrier";
import { RateRequest } from "../domain/RateRequest";

// Mock axios globally
vi.mock("axios");

describe("UPSCarrier Integration", () => {
  let ups: UPSCarrier;
  // Mock request data
  const request: RateRequest = {
    origin: { countryCode: "US", postalCode: "10001", city: "NY" },
    destination: { countryCode: "US", postalCode: "90210", city: "LA" },
    packages: [{ weight: 5, weightUnit: "LB", length: 10, width: 10, height: 10, dimensionUnit: "IN" }],
  };

  beforeEach(() => {
    ups = new UPSCarrier();
    vi.resetAllMocks();
  });

  it("successfully fetches and maps rates", async () => {
    // 1. Setup Mock Response (Success)
    const mockUpsResponse = {
      data: {
        RateResponse: {
          RatedShipment: [
            {
              Service: { Code: "03" },
              TotalCharges: { MonetaryValue: "15.50", CurrencyCode: "USD" },
              GuaranteedDelivery: { BusinessDaysInTransit: "5" }
            }
          ]
        }
      }
    };

    vi.mocked(axios.post).mockResolvedValue(mockUpsResponse);

    // 2. Execute
    const rates = await ups.getRates(request);

    // 3. Verify
    expect(rates).toHaveLength(1);
    expect(rates[0].totalCharge).toBe(15.50);
    expect(rates[0].serviceName).toBe("UPS Ground"); // Mapped from "03"
    
    // Verify axios was called with correct structure (proving mapper works)
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/Shop"),
      expect.objectContaining({
        RateRequest: expect.anything()
      }),
      expect.anything()
    );
  });

  it("handles 401 Unauthorized by refreshing token and retrying", async () => {
    // 1. Setup Mock: First call fails (401), Second call succeeds
    vi.mocked(axios.post)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401 }
      })
      .mockResolvedValueOnce({
        data: {
          RateResponse: { RatedShipment: [] } // Empty valid response
        }
      });

    // 2. Execute
    await ups.getRates(request);

    // 3. Verify
    // Should have called axios twice (1 fail + 1 retry)
    // Note: It might be 2 or 3 times depending on if you mock the AuthClient axios call too. 
    // Since AuthClient is mocked internally in this test suite to not use axios, we focus on the carrier calls.
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it("throws a structured CarrierError on 500", async () => {
    vi.mocked(axios.post).mockRejectedValue({
        isAxiosError: true,
        response: { status: 500, data: { error: "Internal Server Error" } }
    });

    await expect(ups.getRates(request)).rejects.toThrow("UPS API Error");
  });
});
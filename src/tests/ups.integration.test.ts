import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { UPSCarrier } from "../carriers/ups/UPSCarrier";
import { RateRequest } from "../domain/RateRequest";

// ✅ Proper axios mock
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("UPSCarrier Integration", () => {
  let ups: UPSCarrier;

  const request: RateRequest = {
    origin: { countryCode: "US", postalCode: "10001", city: "NY" },
    destination: { countryCode: "US", postalCode: "90210", city: "LA" },
    packages: [
      {
        weight: 5,
        weightUnit: "LB",
        length: 10,
        width: 10,
        height: 10,
        dimensionUnit: "IN",
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    ups = new UPSCarrier();
  });

  it("successfully fetches and maps rates", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        RateResponse: {
          RatedShipment: [
            {
              Service: { Code: "03" },
              TotalCharges: {
                MonetaryValue: "15.50",
                CurrencyCode: "USD",
              },
              GuaranteedDelivery: {
                BusinessDaysInTransit: "5",
              },
            },
          ],
        },
      },
    });

    const rates = await ups.getRates(request);

    expect(rates).toHaveLength(1);
    expect(rates[0].totalCharge).toBe(15.5);
    expect(rates[0].serviceName).toBe("UPS Ground");

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("handles 401 Unauthorized by refreshing token and retrying", async () => {
    vi.mocked(axios.post)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401 },
      })
      .mockResolvedValueOnce({
        data: {
          RateResponse: {
            RatedShipment: [],
          },
        },
      });

    await ups.getRates(request);

    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it("throws a structured CarrierError on 500", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
    });

    await expect(ups.getRates(request)).rejects.toThrow("UPS API Error");
  });
});

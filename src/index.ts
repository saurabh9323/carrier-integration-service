import "dotenv/config";
import type { RateRequest } from "./domain/RateRequest";
import { RateRequestSchema } from "./domain/schemas";
import { UPSCarrier } from "./carriers/ups/UPSCarrier";

// Sample input (what a real app would send)
const sampleRequest: RateRequest = {
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

async function main() {
  try {
    // 1️⃣ Runtime validation
    RateRequestSchema.parse(sampleRequest);
    console.log("Rate request is valid at runtime ✅");

    /**
     * 🟡 DEV MODE SHORT-CIRCUIT
     * -----------------------
     * We intentionally do NOT call the real UPS API in local dev.
     * Real UPS rating requires production credentials and whitelisted access.
     * Integration behavior is validated via tests using mocked HTTP calls.
     */
    if (process.env.NODE_ENV === "development") {
      console.log("Using mocked UPS response for local development 🧪");

      console.log("UPS Rates ✅", [
        {
          carrier: "UPS",
          serviceCode: "UPS_GROUND",
          serviceName: "UPS Ground",
          totalCharge: 450,
          currency: "INR",
          estimatedDeliveryDays: 3,
        },
      ]);

      return;
    }

    // 2️⃣ Call carrier (real path – used in prod / tests via mocks)
    const ups = new UPSCarrier();
    const rates = await ups.getRates(sampleRequest);

    // 3️⃣ Output normalized rates
    console.log("UPS Rates ✅", rates);
  } catch (err) {
    console.error("Invalid rate request ❌", err);
  }
}

main();

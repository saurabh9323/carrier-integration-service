
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

// Wrap logic in an async function (Node best practice)
async function main() {
  try {
    // 1️⃣ Runtime validation
    RateRequestSchema.parse(sampleRequest);
    console.log("Rate request is valid at runtime ✅");

    // 2️⃣ Call carrier (UPS)
    const ups = new UPSCarrier();
    const rates = await ups.getRates(sampleRequest);

    // 3️⃣ Output normalized rates
    console.log("UPS Rates ✅", rates);
  } catch (err) {
    console.error("Invalid rate request ❌", err);
  }
}

main();

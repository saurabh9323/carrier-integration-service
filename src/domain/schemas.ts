import { z } from "zod";

export const AddressSchema = z.object({
  countryCode: z.string().min(2),
  postalCode: z.string().min(3),
  city: z.string().min(1),
  state: z.string().optional(),
});

export const PackageSchema = z.object({
  weight: z.number().positive(),
  weightUnit: z.enum(["KG", "LB"]),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  dimensionUnit: z.enum(["CM", "IN"]),
});

export const RateRequestSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z.array(PackageSchema).min(1),
  serviceCode: z.string().optional(),
});

export class CarrierError extends Error {
  constructor(
    public readonly carrier: string,
    public readonly code: string,
    public readonly message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "CarrierError";
  }
}
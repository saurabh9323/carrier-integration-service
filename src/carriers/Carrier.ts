import type { RateRequest } from "../domain/RateRequest";
import type { RateQuote } from "../domain/RateQuote";

export interface Carrier {
  readonly name: string;

  getRates(request: RateRequest): Promise<RateQuote[]>;
}

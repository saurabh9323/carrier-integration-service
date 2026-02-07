type TokenResponse = {
  accessToken: string;
  expiresAt: number; // epoch ms
};

export class UPSAuthClient {
  private token?: TokenResponse;

  async getAccessToken(): Promise<string> {
    // 1️⃣ Reuse token if still valid
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.accessToken;
    }

    // 2️⃣ Otherwise fetch new token (mocked)
    const newToken = await this.fetchNewToken();

    this.token = newToken;
    return newToken.accessToken;
  }

  private async fetchNewToken(): Promise<TokenResponse> {
    // ⛔ MOCKED: simulate UPS OAuth call
    console.log("🔐 Fetching new UPS access token...");

    return {
      accessToken: "mock-ups-access-token",
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    };
  }
}

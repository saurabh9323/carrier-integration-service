# Carrier Integration Service (UPS)

A backend carrier integration service built in **TypeScript** that wraps the **UPS Rating API** to provide normalized shipping rate quotes.

This project is designed as a **production-ready, extensible service layer** that can be easily extended to support additional carriers (FedEx, USPS, DHL) and additional operations such as labels, tracking, and address validation.

> This is a backend-only project. No UI is included or required.

---

## ✨ Features

- 📦 Rate shopping with clean, normalized responses  
- 🔐 UPS OAuth 2.0 client-credentials flow (mocked)  
- ♻️ Access token caching and refresh logic  
- 🧱 Extensible carrier architecture  
- 🛡️ Strong TypeScript domain models  
- ✅ Runtime input validation using Zod  
- 🧪 Integration tests with stubbed carrier behavior  
- ⚙️ Environment-based configuration  

---


## 🧠 Architecture Overview

```
src/
 ├── domain/                 # Core domain models & validation
 │   ├── Address.ts
 │   ├── Package.ts
 │   ├── RateRequest.ts
 │   ├── RateQuote.ts
 │   └── schemas.ts
 │
 ├── carriers/
 │   ├── Carrier.ts          # Carrier interface
 │   └── ups/
 │       ├── UPSCarrier.ts
 │       └── UPSAuthClient.ts
 │
 └── index.ts                # Orchestration entry point
 │
tests/
 └── ups.integration.test.ts
```

---

## 🔑 Key Design Decisions

### 1. Carrier Interface

All carriers implement a shared `Carrier` interface:

```ts
interface Carrier {
  readonly name: string;
  getRates(request: RateRequest): Promise<RateQuote[]>;
}
```

This ensures:
- Clean separation of concerns  
- Open/Closed Principle adherence  
- New carriers can be added without modifying existing code  

---

### 2. Domain Isolation

Internal domain models (`RateRequest`, `RateQuote`) are fully decoupled from UPS request and response formats.  
The caller never needs to understand any UPS-specific payloads.

---

### 3. Authentication Separation

UPS OAuth logic is isolated in `UPSAuthClient`.

Responsibilities:
- Acquire access tokens  
- Cache tokens  
- Refresh tokens on expiry  

Although mocked, the implementation mirrors real OAuth behavior and is fully testable.

---

### 4. Runtime Validation

All incoming requests are validated at runtime using **Zod** before any carrier logic executes.

This ensures:
- Invalid requests never reach external services  
- Safer production behavior  
- Clear validation errors  

---

### 5. Integration Testing Strategy

Integration tests validate:
- End-to-end rate fetching logic  
- Token reuse and refresh behavior  
- Normalized output structure  

All external calls are stubbed — no real UPS API access is required.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+  
- npm  

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

This runs a sample rate request through:
1. Runtime validation  
2. UPS authentication (mocked)  
3. UPS rate fetching (mocked)  
4. Normalized response output  

---

## 🧪 Running Tests

```bash
npm test
```

Tests exercise the service end-to-end using mocked authentication and carrier responses.

---

## 🔐 Environment Variables

All configuration is environment-based.

See `.env.example`:

```env
UPS_CLIENT_ID=your_ups_client_id
UPS_CLIENT_SECRET=your_ups_client_secret
UPS_BASE_URL=https://onlinetools.ups.com
NODE_ENV=development
```

> Note: UPS credentials are mocked for this assessment.

---

## 🧱 Extending the Service

### Add a New Carrier
1. Implement the `Carrier` interface  
2. Place implementation under `src/carriers/<carrier-name>/`  
3. Plug it into the orchestration layer  

No existing carrier code needs to change.

---

## ❗ Error Handling (Current & Planned)

**Current:**
- Validation errors via Zod  
- Safe handling of token expiry  

**Planned Improvements:**
- Structured error classes  
- HTTP error mapping  
- Retry and rate-limit handling  

---

## 🛠 What I Would Improve With More Time

- Add real HTTP layer with request/response stubbing  
- Implement additional UPS operations (labels, tracking)  
- Add FedEx and USPS carrier implementations  
- Introduce structured error objects  
- Add request retries and timeout handling  
- Add logging and observability hooks  

---

## 📝 Notes

- This project focuses on architecture, correctness, and extensibility  
- No real UPS API calls are made  
- All external behavior is mocked but structurally accurate  

---

## ✅ Summary

This project demonstrates:
- Clean backend architecture  
- Production-style TypeScript  
- Strong validation and typing  
- Realistic authentication and integration logic  
- Extensible design for future carriers  

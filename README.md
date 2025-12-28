<div align="center">

# RATE-LIMITED-STRIPE-PROXY

*A Single-Instance Proxy for Stripe API with Built-in Rate Limiting*

![Last Commit](https://img.shields.io/github/last-commit/BigFudge420/rate-limited-stripe-proxy?label=last%20commit&color=blue)
![TypeScript](https://img.shields.io/badge/typescript-100.0%25-blue)
![License](https://img.shields.io/badge/license-ISC-green)

**Built with the tools and technologies:**

![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![.ENV](https://img.shields.io/badge/.ENV-ECD53F?style=flat&logo=dotenv&logoColor=black)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat&logo=stripe&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#overview-)
- [Features](#features-)
- [How It Works](#how-it-works-)
- [Tech Stack](#tech-stack-)
- [Architecture](#architecture-)
- [Environment Variables](#environment-variables-)
- [Build & Run Instructions](#build--run-instructions-)
  - [Prerequisites](#prerequisites-)
  - [1. Clone the repository](#1-clone-the-repository-)
  - [2. Installing dependencies](#2-installing-dependencies-)
  - [3. Configure environment variables](#3-configure-environment-variables-)
  - [4. Run in development mode](#4-run-in-development-mode-)
  - [5. Build for production](#5-build-for-production-)
  - [6. Run the production build](#6-run-the-production-build-)
- [Testing Strategy Overview](#testing-strategy-overview-)
  - [Setting Up a Mock Upstream Server](#setting-up-a-mock-upstream-server-)
  - [Test 1: Rate Limiting Accuracy](#test-1-rate-limiting-accuracy-)
  - [Test 2: Queue Overflow Handling](#test-2-queue-overflow-handling-)
  - [Test 3: Timeout Handling](#test-3-timeout-handling-)
  - [Test 4: Passthrough Correctness](#test-4-passthrough-correctness-)
  - [Test 5: Structured Logging](test-5-structured-logging-)
  - [Test 6: Concurrent Request Handling](test-6-concurrent-request-handling-)
- [Configuration Details](#configuration-details-)
- [Error Responses](#error-responses-)

---

## Overview 📋

A single-instance Node.js proxy that forwards requests to the Stripe API while enforcing Stripe's rate limits using a **custom token bucket implementation**. 

This proxy acts as a protective layer between your application and Stripe's API, preventing rate limit errors by intelligently queueing and throttling requests.

---

## Features ✨

- **Token Bucket Rate Limiting** 🪣 - Implements a token bucket algorithm to enforce configurable rate limits
- **Request Queueing** 📦 - Automatically queues excess requests instead of rejecting them
- **Request Forwarding** 🔄 - Transparently forwards all requests to Stripe API
- **Header Preservation** 🏷️ - Maintains authentication and custom headers
- **Timeout Handling** ⏱️ - Configurable upstream timeout with graceful error handling
- **X-Forwarded-For Support** 🌐 - Tracks client IP addresses through the proxy chain
- **Request ID Tracking** 🔍 - Adds unique request IDs for debugging and tracing
- **Structured Logging** 📊 - JSON-formatted logs for easy parsing and monitoring

---

## How It Works 🔧

1. **Request Arrives** - Client sends a request to `/proxy/stripe/*`
2. **Token Check** - Proxy checks if a token is available from the bucket
3. **Immediate Forward** - If token available, request is forwarded immediately
4. **Queue** - If no token, request is added to the queue
5. **Token Refill** - Tokens refill continuously based on configured rate
6. **Queue Processing** - As tokens become available, queued requests are processed
7. **Response** - Client receives the response from Stripe API

```
Client Request → Token Bucket → [Available? → Forward] 
                              → [Full? → Queue → Wait → Forward]
                              → [Queue Full? → 429 Error]
```

---

## Tech Stack 🛠️

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **dotenv** - Environment configuration
- **tsx** - TypeScript execution for development
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## Architecture 🏗️

### Core Components

- **`app.ts`** - Express application setup and route configuration
- **`proxyController.ts`** - Main request handler and coordination logic
- **`tokenLogic.ts`** - Token bucket algorithm implementation
- **`enqueueLogic.ts`** - Request queue management
- **`processQueue.ts`** - Queue processing worker
- **`handleUpstream.ts`** - Upstream request execution with timeout handling
- **`buildURL.ts`** - URL construction for upstream requests
- **`buildHeaders.ts`** - Header filtering and augmentation
- **`config.ts`** - Configuration loading and validation
- **`log.ts`** - Structured logging utility

### Request Flow

```typescript
proxyController
    ↓
tryConsume() → [Success] → handleUpstream() → Stripe API
    ↓
[Failure] → enqueue() → Queue
    ↓
processQueue() → [Token Available] → handleUpstream() → Stripe API
```

---

## Environment Variables 🌍

Create a `.env` file in the project root with the following variables:

```env
UPSTREAM_BASE_URL=https://api.stripe.com
RATE_LIMIT_PER_SEC=90
QUEUE_MAX_DEPTH=1000
UPSTREAM_TIMEOUT_MS=5000
PORT=3000
```

### Variable Descriptions

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `UPSTREAM_BASE_URL` | Base URL of the Stripe API | - | ✅ Yes |
| `RATE_LIMIT_PER_SEC` | Maximum requests per second | `90` | ❌ No |
| `QUEUE_MAX_DEPTH` | Maximum queued requests | `1000` | ❌ No |
| `UPSTREAM_TIMEOUT_MS` | Upstream request timeout (ms) | `5000` | ❌ No |
| `PORT` | Server port | `3000` | ❌ No |

---

## Build & Run Instructions 🏗️

### Prerequisites ✔️

- Node.js **18+**
- npm
- A Stripe API account (for testing with real API)

---

### 1. Clone the repository 📦

```bash
git clone https://github.com/BigFudge420/rate-limited-stripe-proxy.git
cd rate-limited-stripe-proxy
```

### 2. Installing dependencies ⬇️

```bash
npm install
```

### 3. Configure environment variables ⚙️

Create a `.env` file in the project root:

```env
UPSTREAM_BASE_URL=https://api.stripe.com
RATE_LIMIT_PER_SEC=90
QUEUE_MAX_DEPTH=1000
UPSTREAM_TIMEOUT_MS=5000
PORT=3000
```

### 4. Run in development mode 🔥

```bash
npm run dev
```

- Uses `tsx` with watch mode
- Auto-restarts on file changes
- Intended for local development only

### 5. Build for production 📦

```bash
npm run build
```

This compiles TypeScript into the `dist/` directory.

### 6. Run the production build 🚀

```bash
npm start
```

This runs the compiled JavaScript from `dist/server.js`.

---

## Configuration Details 🔧

### Token Bucket Algorithm

The proxy uses a **token bucket** algorithm for rate limiting:

- **Capacity**: Maximum number of tokens (configurable via `RATE_LIMIT_PER_SEC`)
- **Refill Rate**: Tokens refill at the rate of `RATE_LIMIT_PER_SEC` per second
- **Consumption**: Each request consumes 1 token
- **Continuous Refill**: Tokens refill based on elapsed time, not at discrete intervals

### Queue Management

- **Maximum Depth**: Configurable via `QUEUE_MAX_DEPTH`
- **FIFO Processing**: First-in, first-out processing order
- **Automatic Processing**: Queue processes automatically as tokens become available
- **Overflow Handling**: Returns `429 Too Many Requests` when queue is full

### Header Handling

The proxy preserves these headers:
- ✅ `Authorization` - Stripe API authentication
- ✅ `Content-Type` - Request content type
- ✅ `x-*` - All custom X-headers from client

The proxy adds these headers:
- ➕ `X-Forwarded-For` - Client IP address tracking
- ➕ `X-Proxy-Request-Id` - Unique request identifier (UUID)

The proxy filters out these headers:
- ❌ `Host` - Replaced with upstream host
- ❌ `Content-Length` - Recalculated by fetch API

---

## Error Responses ⚠️

### 429 Too Many Requests

Returned when the queue is full and cannot accept more requests.

```json
{
  "error": "Rate limit exceeded"
}
```

Response includes `Retry-After: 10` header suggesting retry timing.

### 502 Bad Gateway

Returned when the upstream Stripe API is unavailable or unreachable.

```json
{
  "error": "Upstream unavailable"
}
```

### 504 Gateway Timeout

Returned when the upstream request exceeds `UPSTREAM_TIMEOUT_MS`.

```json
{
  "error": "Upstream timeout"
}
```

---

## Best Practices 💡

1. **Set appropriate rate limits** - Match Stripe's rate limits for your account tier
2. **Monitor queue depth** - Watch for consistently full queues indicating insufficient capacity
3. **Configure timeouts** - Set `UPSTREAM_TIMEOUT_MS` based on typical Stripe API response times
4. **Handle 429 responses** - Implement exponential backoff in clients when queue is full
5. **Use structured logs** - Parse JSON logs for monitoring and alerting
6. **Single instance only** - This proxy is designed for single-instance deployment

---

## Limitations 🚧

- **Single Instance**: Not designed for horizontal scaling (shared state in memory)
- **No Persistence**: Queue is lost on restart
- **No Authentication**: Does not verify client credentials (relies on Stripe API auth)
- **Stripe-Specific**: Hardcoded for Stripe API patterns and paths

---

## License 📄

ISC

---

## Contributing 🤝

Issues and pull requests are welcome at the [GitHub repository](https://github.com/BigFudge420/rate-limited-stripe-proxy).

---

<div align="center">

Made with ❤️ by [BigFudge](https://github.com/BigFudge420)

</div>
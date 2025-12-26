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
- [Testing the Service](#testing-the-service-)
  - [Basic proxy request](#basic-proxy-request-)
  - [Test rate limiting](#test-rate-limiting-)
  - [Test queueing behavior](#test-queueing-behavior-)
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

1. **Request Arrives** - Client sends a request to `/post/stripe/*`
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

## Testing the Service 🧪

### Testing Strategy Overview 📋

A comprehensive testing approach should cover:

1. **Rate limiting accuracy** ⚡ - Verify token bucket behavior and throughput
2. **Queue overflow handling** 🚨 - Test queue depth limits and rejection
3. **Timeout handling** ⏱️ - Validate upstream timeout behavior
4. **Passthrough correctness** 🔄 - Ensure headers and responses are preserved

---

### Setting Up a Mock Upstream Server 🎭

For testing without hitting the real Stripe API, create a mock server:

**mock-stripe.js:**
```javascript
import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock customer creation endpoint
app.post('/v1/customers', (req, res) => {
  setTimeout(() => {
    res.status(200).json({
      id: 'cus_mock_' + Date.now(),
      email: req.body.email || 'test@example.com',
      created: Math.floor(Date.now() / 1000)
    });
  }, 100); // Simulate 100ms Stripe latency
});

// Mock charge creation endpoint
app.post('/v1/charges', (req, res) => {
  setTimeout(() => {
    res.status(201).json({
      id: 'ch_mock_' + Date.now(),
      amount: req.body.amount || 1000,
      currency: 'usd',
      status: 'succeeded'
    });
  }, 100);
});

// Mock slow endpoint for timeout testing
app.post('/v1/slow', (req, res) => {
  setTimeout(() => {
    res.status(200).json({ message: 'This should timeout' });
  }, 10000); // 10 second delay
});

app.listen(4000, () => {
  console.log('Mock Stripe API running on http://localhost:4000');
});
```

**Run the mock server:**
```bash
node mock-stripe.js
```

**Update `.env` to use mock:**
```env
UPSTREAM_BASE_URL=http://localhost:4000
```

---

### Test 1: Rate Limiting Accuracy ⚡

Verify that the proxy enforces the configured rate limit correctly.

**Send 900 requests instantly:**
```bash
# This script sends 900 requests and measures total time
time (
  for i in {1..900}; do
    curl -s -X POST http://localhost:3000/post/stripe/v1/customers \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "email=customer$i@example.com" > /dev/null &
  done
  wait
)
```

**Expected behavior:**
- Total time should be approximately **10 seconds** (900 requests ÷ 90 req/sec)
- All 900 requests should complete successfully
- No 429 errors should be returned

**Monitor token bucket state:**

Add this to `tokenLogic.ts` for debugging:
```typescript
export const getTokenState = () => ({
  tokens,
  capacity: CAPACITY,
  lastRefill: lastRefil
});
```

---

### Test 2: Queue Overflow Handling 🚨

Verify that the queue rejects requests when full.

**Send 1200 requests instantly:**
```bash
# Send more requests than queue can hold
results_file="test_results.txt"
> $results_file

for i in {1..1200}; do
  (
    response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/post/stripe/v1/customers \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "email=customer$i@example.com")
    status=$(echo "$response" | tail -n1)
    echo "$status" >> $results_file
  ) &
done
wait

# Count status codes
echo "Results:"
echo "200 OK: $(grep -c "^200$" $results_file)"
echo "429 Too Many Requests: $(grep -c "^429$" $results_file)"
```

**Expected behavior:**
- Approximately **1000 requests** should succeed (queue capacity)
- Approximately **200 requests** should receive `429` status
- 429 responses should include `Retry-After: 10` header

**Verify 429 response:**
```bash
curl -i -X POST http://localhost:3000/post/stripe/v1/customers \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=overflow@example.com"
```

**Expected 429 response:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 10
Content-Type: application/json

{"error":"Rate limit exceeded"}
```

---

### Test 3: Timeout Handling ⏱️

Verify the proxy returns 504 when upstream is slow.

**Using the mock server's slow endpoint:**
```bash
curl -i -X POST http://localhost:3000/post/stripe/v1/slow \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=timeout"
```

**Expected behavior:**
- Proxy returns `504 Gateway Timeout` after **5 seconds** (configured timeout)
- Does not wait for the full 10-second upstream delay

**Expected 504 response:**
```
HTTP/1.1 504 Gateway Timeout
Content-Type: application/json

{"error":"Upstream timeout"}
```

**Measure actual timeout duration:**
```bash
time curl -X POST http://localhost:3000/post/stripe/v1/slow \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=timeout"
```

Should complete in approximately **5 seconds**, not 10.

---

### Test 4: Passthrough Correctness 🔄

Verify headers and response bodies are correctly forwarded.

**Test custom header forwarding:**
```bash
curl -i -X POST http://localhost:3000/post/stripe/v1/customers \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Custom-Header: test-value" \
  -H "X-Request-Id: req_12345" \
  -d "email=passthrough@example.com"
```

**Check mock server logs** to verify custom headers are received.

**Test response body integrity:**
```bash
response=$(curl -s -X POST http://localhost:3000/post/stripe/v1/charges \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "amount=5000&currency=usd")

echo $response | jq .
```

**Expected response** (from mock):
```json
{
  "id": "ch_mock_1735305600000",
  "amount": 5000,
  "currency": "usd",
  "status": "succeeded"
}
```

**Verify X-Forwarded-For header:**
```bash
curl -X POST http://localhost:3000/post/stripe/v1/customers \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Forwarded-For: 203.0.113.1" \
  -d "email=xff-test@example.com"
```

Mock server should receive `X-Forwarded-For` header with the original IP preserved.

---

### Test 5: Structured Logging 📊

Monitor the proxy logs to verify request tracking:

```bash
npm run dev
```

**Send a test request:**
```bash
curl -X POST http://localhost:3000/post/stripe/v1/customers \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=logging-test@example.com"
```

**Expected log entry:**
```json
{
  "timestamp": "2025-12-27T10:30:00.000Z",
  "method": "POST",
  "path": "/post/stripe/v1/customers",
  "status": 200,
  "duration_ms": 145
}
```

---

### Test 6: Concurrent Request Handling 🔀

Verify the proxy correctly handles concurrent requests:

```bash
# Send 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/post/stripe/v1/customers \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=concurrent$i@example.com" &
done
wait
```

**Expected behavior:**
- All requests complete successfully
- Responses arrive in correct order
- No race conditions or dropped requests

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
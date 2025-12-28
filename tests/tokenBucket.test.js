import { jest } from '@jest/globals'

jest.useFakeTimers()

import {getTokenState, refillTokens, drainBucket, tryConsume} from '../src/tokenLogic.js'
import config from '../src/config.js'

const CAPACITY = config.rateLimitPerSec

afterEach(() => {
    jest.advanceTimersByTime(1000)
    refillTokens()
})

test('test token refill accuracy', () => {
    drainBucket()

    expect(getTokenState().tokens).toBe(0)

    jest.advanceTimersByTime(1000)

    refillTokens()

    expect(getTokenState().tokens).toBe(CAPACITY)
})

test('test token consumption', () => {
    expect(getTokenState().tokens).toBe(CAPACITY)

    for (let index = 0; index < CAPACITY; index++) {
        expect(tryConsume()).toBe(true)
    }

    expect(tryConsume()).toBe(false)
})

test('test fractional token accumulation', () => {
    drainBucket()

    expect(getTokenState().tokens).toBe(0)

    jest.advanceTimersByTime(100)

    for (let index = 0; index < CAPACITY/10; index++) {
        expect(tryConsume()).toBe(true)
    }

    expect(tryConsume()).toBe(false)
})

test('test token capacity', () => {
    drainBucket()

    expect(getTokenState().tokens).toBe(0)

    jest.advanceTimersByTime(10000)

    refillTokens()

    expect(getTokenState().tokens).toBe(CAPACITY)
})

test('test concurrent token consumption', async () => {
    expect(getTokenState().tokens).toBe(CAPACITY)

    const promises = []

    for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve().then(() => tryConsume()))
    }

    const results = await Promise.all(promises)
    const successCount = results.filter(Boolean).length

    expect(successCount).toBeLessThanOrEqual(CAPACITY)
})

test('test bucket idempotency', () => {
    drainBucket()

    refillTokens()
    expect(getTokenState().tokens).toBe(0)

    const intitalRefil = getTokenState().lastRefill

    jest.advanceTimersByTime(0)

    refillTokens()
    expect(getTokenState().tokens).toBe(0)

    expect(getTokenState().lastRefill).toBe(intitalRefil)
})

test('test if sequential refills are equivalent to one', () => {
    drainBucket()

    jest.advanceTimersByTime(250)
    refillTokens()

    expect(getTokenState().tokens).toBe(CAPACITY/4)

    jest.advanceTimersByTime(250)
    refillTokens()

    expect(getTokenState().tokens).toBe(CAPACITY/2)

    drainBucket()

    jest.advanceTimersByTime(500)
    refillTokens()

    expect(getTokenState().tokens).toBe(CAPACITY/2)
})

test('test behaviour in negative time', () => {
    drainBucket()
    
    const now = Date.now()

    jest.advanceTimersByTime(300)
    refillTokens()

    const intitalRefil = getTokenState().lastRefill

    jest.advanceTimersByTime(1)
    refillTokens(now)

    expect(getTokenState().lastRefill).toBe(intitalRefil)
})
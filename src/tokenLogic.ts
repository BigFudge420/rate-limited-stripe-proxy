import config from "./config"

const CAPACITY = config.rateLimitPerSec
const REFILL_RATE = CAPACITY
let tokens : number = CAPACITY
let lastRefill: number = Date.now()

const refillTokens = (now = Date.now()) => {
    const elapsedTimeMS = now - lastRefill
    
    if (elapsedTimeMS <= 0) return

    const refill = (elapsedTimeMS/1000) * REFILL_RATE
    tokens = Math.min(CAPACITY, refill + tokens) 
    lastRefill= now
}

const tryConsume = () : boolean => {
    refillTokens()

    if (tokens >= 1) {
        tokens -= 1
        return true
    }

    return false
}

export {tryConsume, refillTokens}
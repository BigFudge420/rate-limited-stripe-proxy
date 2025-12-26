import config from "./config"

const capacity = config.rateLimitPerSec
const refillRate = capacity
let tokens : number = capacity
let lastRefil : number = Date.now()

const refillTokens = (now = Date.now()) => {
    const elapsedTimeMS = now - lastRefil
    
    if (elapsedTimeMS <= 0) return

    const refill = (elapsedTimeMS/1000) * refillRate
    tokens = Math.min(capacity, refill) 
    lastRefil = now
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
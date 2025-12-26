import dotenv from 'dotenv'

dotenv.config()

interface Config {
    upstreamBaseUrl : string,
    rateLimitPerSec : number,
    queueMaxDepth : number,
    upstreamTimeoutMS : number,
    port : number
}

const config : Config = {
    upstreamBaseUrl : process.env.UPSTREAM_BASE_URL || (() => {
        throw new Error('UPSTREAM_BASE_URL is not set.')
    })(),
    rateLimitPerSec : Number(process.env.RATE_LIMIT_PER_SEC) || 90,
    queueMaxDepth : Number(process.env.QUEUE_MAX_DEPTH) || 1000,
    upstreamTimeoutMS : Number(process.env.UPSTREAM_TIMEOUT_MS) || 5000, 
    port : Number(process.env.PORT) || 3000
}

export default config

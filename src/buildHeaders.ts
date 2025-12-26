import { Request } from "express";  
import crypto from 'crypto'

const buildHeaders = (req : Request) => {
    const headers = new Headers()

    for (const [key, value] of Object.entries(req.headers)) {
        if (!value) continue
        const k = key.toLowerCase()

        if (k === 'host' || k === 'content-length') continue

        if (k === 'authorization' ||
            k === 'content-type' ||
            k.startsWith('x-')
        ) {
            headers.set(k, String(value))
        }
    }

    const xff = req.headers['x-forwarded-for']
    headers.set(
        'x-forwarded-for', 
        typeof xff === 'string' ? xff : req.ip ?? 'unknown'
    )
    headers.set('x-proxy-request-id', crypto.randomUUID())

    return headers
}

export default buildHeaders
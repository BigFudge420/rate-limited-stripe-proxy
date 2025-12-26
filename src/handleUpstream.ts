import { Request, Response } from "express"
import config from './config'
import buildURL from './buildURL'
import buildHeaders from './buildHeaders'
import processQueue from './processQueue'
import log from "./log"

const handleUpstream = async (req : Request, res : Response, start = Date.now() ) => {

    const UPSTREAM_TIMEOUT_MS = config.upstreamTimeoutMS
    const controller = new AbortController()
    const timeout = setTimeout(() => {
        controller.abort()
    }, UPSTREAM_TIMEOUT_MS)

    const upstreamURL = buildURL(req)
    const headers = buildHeaders(req)

    const body = req.body.length ? req.body : undefined

    res.on('finish', () => {
        log(req, res.statusCode, start)
    })

    try {
        const upstreamRes = await fetch(upstreamURL, {
            method : req.method,
            headers,
            body,
            signal : controller.signal
        })

        clearTimeout(timeout)

        res.status(upstreamRes.status)

        upstreamRes.headers.forEach((k , v) => {
            if (k === 'transfer-encoding') return
            res.setHeader(k, v)
        })

        const buffer = Buffer.from(await upstreamRes.arrayBuffer())
        res.send(buffer)
    }
    catch (err : any) {
        clearTimeout(timeout)

        if (err.name === 'AbortError') {
            res.status(504).json({error : "Upstream timeout"})
        }
        else {
            res.status(502).json({error : "Upstream unavailable"})
        }
    } finally {
        processQueue()
    }
}

export default handleUpstream
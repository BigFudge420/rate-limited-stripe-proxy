import { Request, Response, NextFunction } from "express"
import { tryConsume } from "./tokenLogic"
import handleUpstream from "./handleUpstream"
import { enqueue } from "./enqueueLogic"
import processQueue from "./processQueue"

const proxyController = (req : Request, res : Response) => {
    if (tryConsume()) {
        handleUpstream(req, res)
    }
    else {
        enqueue(req, res)
    }

    processQueue()
}

export default proxyController
import { Request, Response, NextFunction } from "express"
import { tryConsume } from "./tokenLogic"
import handleUpstream from "./handleUpstream"
import { enqueue } from "./enqueueLogic"
import processQueue from "./processQueue"

const proxyController = (req : Request, res : Response, next : NextFunction) => {
    try {
        if (tryConsume()) {
            handleUpstream(req, res)
        }
        else {
            enqueue(req, res)
        }
    
        processQueue()
    }catch (err) {
        next(err)
    }
    
}

export default proxyController
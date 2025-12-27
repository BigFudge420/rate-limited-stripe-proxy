import { Request, Response } from "express";
import config from "./config";

interface QueuedRequest {
    req : Request,
    res : Response, 
    enqueuedAt : number
}

const QUEUE_MAX_DEPTH = config.queueMaxDepth
const queue : QueuedRequest[] = [] 

const enqueue = (req : Request, res : Response) => {
    if (queue.length >= QUEUE_MAX_DEPTH) {
        res.setHeader('Retry-After', '10')
        res.status(429).json({error : "Rate limit exceeded"})
    }

    queue.push({req, res, enqueuedAt : Date.now()})
}

export {queue, enqueue}
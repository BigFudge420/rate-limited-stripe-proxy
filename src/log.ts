import { Request } from "express"

const log = (req : Request, status : number, start : number) => {
    console.log(JSON.stringify({
        timestamp : new Date().toISOString(),
        method : req.method,
        path  : req.originalUrl,
        status,
        duration_ms : Date.now() - start
    }))
}

export default log
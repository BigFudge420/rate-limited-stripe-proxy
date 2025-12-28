import {queue} from './enqueueLogic'
import {tryConsume} from './tokenLogic'
import handleUpstream from './handleUpstream'
import config from './config'

let processing = false

let inflight = 0
const MAX_INFLIGHT = config.maxInflight

const processQueue = async () => {
    if (processing) return
    processing = true
    
    try {
        while (queue.length > 0 && inflight < MAX_INFLIGHT) {
            const now = Date.now()
            
            if (!tryConsume()) break
            const item = queue.shift()!
            console.log('clearing queue')

            inflight++
            handleUpstream(item.req, item.res).catch(() => {}).finally(() => {
                inflight--
                setImmediate(processQueue)
            })
        }
    } finally {
        processing = false
    }

}

export default processQueue
import {queue} from './enqueueLogic'
import {tryConsume} from './tokenLogic'
import handleUpstream from './handleUpstream'

let processing = false

const processQueue = async () => {
    if (processing) return
    processing = true

    try {
        while (queue.length > 0){
            if (!tryConsume()) break

            const item = queue.shift()!
            handleUpstream(item.req, item.res)
        }
    }
    finally {
        processing = false
    }
}

export default processQueue
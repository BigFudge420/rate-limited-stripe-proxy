import {queue} from './enqueueLogic'
import {tryConsume} from './tokenLogic'
import handleUpstream from './handleUpstream'

let processing = false

const processQueue = () => {
    if (processing) return
    processing = true

    try {
        let fired = 0
        while (queue.length > 0 && tryConsume() && fired < 10) {
            const item = queue.shift()!
            fired++
            handleUpstream(item.req, item.res)
        }
    }
    finally {
        processing = false
    }
}

export default processQueue
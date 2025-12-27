import express, { NextFunction, Response, Request } from 'express'
import proxyController from './proxyController'

const app = express()

app.use(express.raw({type : "*/*"}))
app.post('/proxy/stripe/*', proxyController) 
app.use((err: any, _req : Request, res : Response, _next : NextFunction) => {
    console.error('Unhandled error: ', err),
    res.status(500).json({error : "Internal Server Error"})
})

export default app
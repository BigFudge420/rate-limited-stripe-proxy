import express from 'express'
import proxyController from './proxyController'

const app = express()

app.use(express.raw({type : "*/*"}))
app.post('/post/stripe/*', proxyController)

export default app
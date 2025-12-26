import { Request } from "express";
import config from "./config";

const buildURL = (req : Request) => {
    const UPSTREAM_BASE_URL = config.upstreamBaseUrl
    const path = req.originalUrl.replace('/proxy/stripe', '')
    const rebuiltURL = UPSTREAM_BASE_URL + path

    return rebuiltURL
}

export default buildURL
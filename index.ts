import { Hono } from "hono";
import Axios from 'axios'
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import type { StatusCode } from "hono/utils/http-status";

const http = Axios.create({
    withCredentials: true,
    baseURL: process.env.API_URL
})

const objectToString = (obj: any) => {
    return Object.entries(obj).map(([key, value]) => {
        return `${key}=${value}`;
    }).join('; ')
}

const port = process.env.PORT
const app = new Hono({})

app.use(
    '*',
    cors({
        origin: `http://localhost:3000`,
        allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
        allowMethods: ['POST', 'GET', 'PUT', 'OPTIONS', 'DELETE'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    }),
)

app.get('*', async (c) => {
    const cookies = getCookie(c)

    http.defaults.headers.common['Cookie'] = objectToString(cookies)
    
    try {
        const { data, status } = await http.get(c.req.path, {
            params: c.req.query()
        })

        return c.json(data)
    } catch (error) {
        return c.json(error.response.data, error.response)
    }
})

app.post('*', async function (c)  {
    const cookies = getCookie(c)
    
    http.defaults.headers.common['Cookie'] = objectToString(cookies)
    const body = await c.req.text()

    try {
        const { data} = await http.post(c.req.path, JSON.parse(body))
    
        return c.json(data)
    } catch (error) {
        return c.json(error.response.data, error.response)
    }
})

app.put('*', async (c) => {
    const cookies = getCookie(c)
    
    http.defaults.headers.common['Cookie'] = objectToString(cookies)
    const body = await c.req.text()

    try {
        const { data, status, } = await http.put(c.req.path, JSON.parse(body))

        return c.json(data)
    } catch (error) {
        return c.json(error.response.data, error.response)
    }
})

app.delete('*', async (c) => {
    const cookies = getCookie(c)
    
    http.defaults.headers.common['Cookie'] = objectToString(cookies)
    
    try {
        const { data } = await http.delete(c.req.path)

        return c.json(data)
    } catch (error) {
        return c.json(error.response.data, error.response)
    }
})

export default { 
    port, 
    fetch: app.fetch, 
} 

console.log(`Listening on localhost:${port}`);




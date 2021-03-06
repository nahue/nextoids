const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')

const dev = process.env.NODE_ENV !== 'production'
const dir = "./src"
const app = next({ dev, dir })
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
    const server = new Koa()
    const router = new Router()

    require('./src/routes').forEach(r => {
        router.get(r.path, async ctx => {
            await app.render(ctx.req, ctx.res, `/${r.page}`, ctx.query)
            ctx.respond = false
        })
    })

    require('./src/middlewares').forEach(m => {
        router.use(m)
    })

    router.get('*', async ctx => {
        await handle(ctx.req, ctx.res)
        ctx.respond = false
    })

    server.use(async (ctx, next) => {
        ctx.res.statusCode = 200
        await next()
    })

    server.use(router.routes())

    server.listen(3000, "0.0.0.0", (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:3000')
    })
})

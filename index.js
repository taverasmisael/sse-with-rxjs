const http = require('http')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const xstream = require('xstream')

const serve = serveStatic('./public/dist')
const SSE = (type, data) => JSON.stringify({ type, data })

const server = http.createServer((req, res) => {
  if (/sse/gim.test(req.url)) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    let id = 0
    res.write(`id: ${id}\ndata: ${SSE('PROCESSING', `This is event ${id}.`)}`)
    res.write('\n\n')
    const dualinter = setInterval(() => {
      id++
      res.write(`id: ${id}\ndata: ${SSE('CRONJOB', `This is event ${id}.`)}`)
      res.write('\n\n')
    }, 200)
    const inter = setInterval(() => {
      id++
      res.write(`id: ${id}\ndata: ${SSE('PROCESSING', `This is event ${id}.`)}`)
      res.write('\n\n')
    }, 1600)

    req.on('close', () => {
      clearInterval(inter)
      clearInterval(dualinter)
      res.end()
    })

    setTimeout(() => {
      clearInterval(inter)
      res.write(
        `event: DONE\nid: ${id}\ndata: ${SSE('DONE', `This is event ${id}.`)}`
      )
      res.write('\n\n')
    }, 1000 * 1000)
  } else {
    serve(req, res, finalhandler(req, res))
  }
})

server.listen(1621, () => console.log('Listening on http://localhost:1621'))

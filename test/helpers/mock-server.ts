import http from 'node:http'

const ME_RESPONSE = {
  data: {
    access_level: 'worker' as const,
    id: 42,
    name: 'Test Agent',
    project_id: 1,
    role: 'worker',
    user_id: 'user-123',
  },
}

export function createMockServer(notifications: unknown[] = []) {
  const server = http.createServer((req, res) => {
    const url = req.url ?? ''
    if (req.method === 'GET' && url.startsWith('/api/v1/me')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(ME_RESPONSE))
      return
    }

    if (req.method === 'GET' && url.startsWith('/api/v1/notifications')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: notifications }))
      return
    }

    res.writeHead(404)
    res.end()
  })

  return new Promise<{ close: () => Promise<void>; url: string; }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      const port =
        addr && typeof addr === 'object' && 'port' in addr ? addr.port : 0
      const url = `http://127.0.0.1:${port}`
      resolve({
        close: () =>
          new Promise((done) => {
            server.close(done)
          }),
        url,
      })
    })
  })
}

export { ME_RESPONSE }

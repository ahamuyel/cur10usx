const { WebSocketServer } = require("ws")
const http = require("http")
const Redis = require("ioredis")

const WS_PORT = parseInt(process.env.WS_PORT, 10) || 3001
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
const APP_HOST = process.env.APP_HOST || "localhost"
const APP_PORT = parseInt(process.env.APP_PORT, 10) || 3000

// ─── Heartbeat ──────────────────────────────────────────────────────
const HEARTBEAT_INTERVAL = 30_000
const HEARTBEAT_TIMEOUT = 10_000

// ─── Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({
  port: WS_PORT,
  maxPayload: 1024 * 100, // 100 KB max message
})

// Map<userId, Set<WebSocket>> — suporta múltiplos separadores/dispositivos
const clients = new Map()

// Rate limiter de conexões por IP
const connectionCount = new Map()
const MAX_CONN_PER_IP = 20

let pub = null
let sub = null
let redisEnabled = false

// ─── Heartbeat ──────────────────────────────────────────────────────
function heartbeat() {
  for (const [userId, sockets] of clients) {
    for (const ws of sockets) {
      if (ws._isAlive === false) {
        ws.terminate()
        sockets.delete(ws)
        continue
      }
      ws._isAlive = false
      ws.ping()
    }
    if (sockets.size === 0) clients.delete(userId)
  }
}

const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL)

wss.on("connection", (ws) => {
  ws._isAlive = true
  ws.on("pong", () => { ws._isAlive = true })
})

// ─── Redis ──────────────────────────────────────────────────────────

function onRedisMessage(channel, message) {
  if (channel !== "ws:messages") return
  try {
    const { target, userId, event, payload } = JSON.parse(message)
    if (target === "user") {
      const sockets = clients.get(userId)
      if (!sockets) return
      const msg = JSON.stringify({ event, payload })
      for (const ws of sockets) {
        if (ws.readyState === 1) ws.send(msg)
      }
    } else {
      broadcastToAll(event, payload)
    }
  } catch {
    // ignore
  }
}

function disableRedis() {
  if (!redisEnabled) return
  console.warn("[WS] Redis not available, running in single-instance mode")
  redisEnabled = false
  try { pub?.disconnect() } catch {}
  try { sub?.disconnect() } catch {}
  pub = null
  sub = null
}

function initRedis() {
  try {
    const redisOpts = {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      connectTimeout: 3000,
    }
    pub = new Redis(REDIS_URL, redisOpts)
    sub = new Redis(REDIS_URL, redisOpts)

    pub.on("error", disableRedis)
    sub.on("error", disableRedis)
    sub.on("message", onRedisMessage)

    Promise.all([pub.connect(), sub.connect()])
      .then(() => {
        redisEnabled = true
        sub.subscribe("ws:messages")
        console.log("[WS] Redis pub/sub connected")
      })
      .catch(disableRedis)
  } catch {
    disableRedis()
  }
}

function publishToRedis(msg) {
  if (pub && redisEnabled) {
    try {
      pub.publish("ws:messages", JSON.stringify(msg))
    } catch {
      // Redis not available
    }
  }
}

// ─── Broadcast ──────────────────────────────────────────────────────

function broadcastToUser(userId, event, payload) {
  const sockets = clients.get(userId)
  if (!sockets) return
  const msg = JSON.stringify({ event, payload })
  for (const ws of sockets) {
    if (ws.readyState === 1) ws.send(msg)
  }
}

function broadcastToAll(event, payload) {
  const msg = JSON.stringify({ event, payload })
  for (const sockets of clients.values()) {
    for (const ws of sockets) {
      if (ws.readyState === 1) ws.send(msg)
    }
  }
}

// ─── Token Verification ─────────────────────────────────────────────

function verifyToken(token) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ token })
    const options = {
      hostname: APP_HOST,
      port: APP_PORT,
      path: "/api/auth/verify-ws",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
      timeout: 5000,
    }
    const req = http.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve({ valid: false })
        }
      })
    })
    req.on("error", () => resolve({ valid: false }))
    req.on("timeout", () => {
      req.destroy()
      resolve({ valid: false })
    })
    req.write(data)
    req.end()
  })
}

// ─── Connection Handler ─────────────────────────────────────────────

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress

  // Rate limit por IP
  const current = connectionCount.get(ip) || 0
  if (current >= MAX_CONN_PER_IP) {
    console.warn(`[WS] Connection limit exceeded for ${ip}`)
    ws.close(4003, "Too many connections")
    return
  }
  connectionCount.set(ip, current + 1)
  ws._connCleanup = () => {
    const c = connectionCount.get(ip)
    if (c && c > 1) connectionCount.set(ip, c - 1)
    else connectionCount.delete(ip)
  }

  console.log(`[WS] Client connected from ${ip}`)

  let authTimer = setTimeout(() => {
    if (!ws.userId) {
      console.log(`[WS] Client ${ip} timed out without auth`)
      ws.close(4001, "Auth timeout")
    }
  }, 10000)

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString())

      if (msg.type === "auth") {
        if (msg.token) {
          const result = await verifyToken(msg.token)
          if (result.valid && result.userId) {
            ws.userId = result.userId
            ws.userRole = result.role

            // Suporta múltiplos separadores por userId
            if (!clients.has(result.userId)) clients.set(result.userId, new Set())
            clients.get(result.userId).add(ws)

            clearTimeout(authTimer)
            ws.send(JSON.stringify({ event: "auth_ok", payload: { userId: result.userId } }))
            publishToRedis({ target: "all", event: "online_status", payload: { userId: result.userId, online: true } })
            broadcastToAll("online_status", { userId: result.userId, online: true })
            console.log(`[WS] User ${result.userId} (${result.role}) authenticated`)
          } else {
            ws.send(JSON.stringify({ event: "auth_error", payload: { error: "Token inválido" } }))
            console.log(`[WS] Auth failed for ${ip}`)
          }
        } else {
          ws.send(JSON.stringify({ event: "auth_error", payload: { error: "Token required" } }))
        }
        return
      }

      if (msg.type === "broadcast") {
        publishToRedis(msg)
        if (msg.target === "user") {
          broadcastToUser(msg.userId, msg.event, msg.payload)
        } else {
          broadcastToAll(msg.event, msg.payload)
        }
        return
      }
    } catch {
      // ignore malformed messages
    }
  })

  ws.on("close", () => {
    if (ws.userId) {
      const sockets = clients.get(ws.userId)
      if (sockets) {
        sockets.delete(ws)
        if (sockets.size === 0) clients.delete(ws.userId)
      }
      publishToRedis({ target: "all", event: "online_status", payload: { userId: ws.userId, online: false } })
      broadcastToAll("online_status", { userId: ws.userId, online: false })
      console.log(`[WS] User ${ws.userId} disconnected`)
    }
    if (ws._connCleanup) ws._connCleanup()
    clearTimeout(authTimer)
  })

  ws.on("error", () => {
    if (ws.userId) {
      const sockets = clients.get(ws.userId)
      if (sockets) {
        sockets.delete(ws)
        if (sockets.size === 0) clients.delete(ws.userId)
      }
      publishToRedis({ target: "all", event: "online_status", payload: { userId: ws.userId, online: false } })
      broadcastToAll("online_status", { userId: ws.userId, online: false })
    }
    if (ws._connCleanup) ws._connCleanup()
    clearTimeout(authTimer)
  })
})

// ─── Graceful Shutdown ──────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n[WS] Received ${signal}, shutting down gracefully...`)
  clearInterval(heartbeatTimer)
  clearTimeout()
  for (const sockets of clients.values()) {
    for (const ws of sockets) {
      ws.close(4001, "Server shutting down")
    }
  }
  try { pub?.disconnect() } catch {}
  try { sub?.disconnect() } catch {}
  wss.close(() => {
    console.log("[WS] Server closed")
    process.exit(0)
  })
  // Force exit after 5s
  setTimeout(() => process.exit(1), 5000)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

// ─── Init ───────────────────────────────────────────────────────────

initRedis()
console.log(`[WS] WebSocket server running on port ${WS_PORT}`)

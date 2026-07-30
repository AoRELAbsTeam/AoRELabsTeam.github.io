// Cloudflare Pages Function - AoRE Admin (Optimized & Encrypted)

// --- CRYPTO UTILS (AES-GCM) ---
function hexToUint8Array(hex) {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return arr
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function encryptData(text, hexKey) {
  const keyBytes = hexToUint8Array(hexKey)
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)

  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return arrayBufferToBase64(combined.buffer)
}

async function decryptData(b64, hexKey) {
  const keyBytes = hexToUint8Array(hexKey)
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"])
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const iv = bytes.slice(0, 12)
  const ciphertext = bytes.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}
// ------------------------------

function htmlEscape(s) {
  return (s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]))
}
function htmlEmailLiteral(email) {
  const s = String(email || "")
  return htmlEscape(s).replace(/@/g, "&#64;").replace(/\./g, "&#46;")
}

function nowSec() { return Math.floor(Date.now() / 1000) }
const LOCK_SEC = 33 * 60
const AORE_BUILD = "12-6-12-ENCRYPTED"

function fmtEsDateTime(ts) {
  const d = ts ? new Date(ts) : new Date()
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(d)
  const get = (t) => (parts.find(p => p.type === t)?.value || "00")
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`
}

function fileSafeNow() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(d)
  const get = (t) => (parts.find(p => p.type === t)?.value || "00")
  return `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}-${get("second")}`
}

function htmlUsersExportPage(rowsHtml, summary) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>© AoRE Labs - Export Users</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <style>
    body{background:#05070b;color:#d7e0ff;font-family:system-ui,Segoe UI,Arial;margin:0}
    .wrap{max-width:1600px;margin:0 auto;padding:16px}
    h1{margin:0 0 8px 0;font-size:18px;letter-spacing:.08em;text-transform:uppercase;color:#7aa2ff}
    .meta{color:#9db3ff;font-size:12px;line-height:1.6;margin:0 0 16px 0}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #132041;background:#070b12;color:#d7e0ff;margin-right:6px}
    .card{background:#070b12;border:1px solid #101a2b;border-radius:14px;overflow:hidden}
    table{width:100%;border-collapse:collapse;table-layout:fixed}
    th,td{padding:10px;border-bottom:1px solid #101a2b;font-size:12px;vertical-align:top;overflow-wrap:anywhere}
    th{color:#9db3ff;text-transform:uppercase;letter-spacing:.06em;font-size:11px;background:#060a10}
    tr:hover td{background:#060a10}
    .mono{font-family:ui-monospace,Menlo,Consolas,monospace}
    td.msg{white-space:pre-wrap}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>© AoRE Labs - Users Export</h1>
    <p class="meta"><span class="badge">AoRE</span> <span class="badge">Users</span><br>${htmlEscape(summary)}</p>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th style="width:11%">Date (ES)</th>
            <th style="width:10%">Name</th>
            <th style="width:14%">Email</th>
            <th style="width:9%">Password</th>
            <th style="width:24%">Message</th>
            <th style="width:20%">User-Agent</th>
            <th style="width:7%">IP</th>
            <th style="width:5%">KV Key</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`
}

function cookieGet(request, name) {
  const h = request.headers.get("cookie") || ""
  const m = h.match(new RegExp("(?:^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)"))
  return m ? decodeURIComponent(m[1]) : ""
}

function cookieSet(name, value, maxAgeSec) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "Secure", "SameSite=Strict"]
  if (typeof maxAgeSec === "number") parts.push(`Max-Age=${maxAgeSec}`)
  return parts.join("; ")
}

function redirect(location, setCookieHeader) {
  const headers = new Headers({ Location: location })
  if (setCookieHeader) headers.set("Set-Cookie", setCookieHeader)
  return new Response(null, { status: 302, headers })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } })
}

async function readBody(request) {
  const ct = request.headers.get("content-type") || ""
  if (ct.includes("application/json")) return await request.json()
  if (ct.includes("application/x-www-form-urlencoded")) {
    const t = await request.text()
    const p = new URLSearchParams(t)
    const o = {}
    for (const [k, v] of p.entries()) o[k] = v
    return o
  }
  return {}
}

function aore404(path = "") {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>404 - AoRE Labs</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#05070b;color:#8bffb0;font-family:ui-monospace,Menlo,Consolas,monospace}.box{max-width:820px;padding:26px;border:1px solid #0e2a18;background:#060f09;border-radius:16px;text-align:center}</style></head>
<body><div class="box"><h1>404 - Not Found</h1><div>AoRE Labs security perimeter. Route does not exist.</div><div>${htmlEscape(path || "")}</div></div></body></html>`
  return new Response(html, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } })
}

function makeToken() {
  const a = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("")
}

async function verifyTurnstile(env, request, token) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: false, reason: "missing_secret" }
  if (!token) return { ok: false, reason: "missing_token" }
  const ip = request.headers.get("cf-connecting-ip") || ""
  const fd = new FormData()
  fd.append("secret", env.TURNSTILE_SECRET_KEY)
  fd.append("response", token)
  if (ip) fd.append("remoteip", ip)
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: fd })
  const j = await r.json().catch(() => ({}))
  return { ok: !!j.success, data: j }
}

function registerOkPage() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Register OK</title><link rel="stylesheet" href="/assets/css/main.css"></head>
<body><div style="text-align:center;padding:50px;color:#d7e0ff;background:#05070b;min-height:100vh"><h1>Submission accepted & Encrypted</h1><p>Your registration was received securely.</p><a href="/">Home</a></div></body></html>`
}

function registerFailPage(msg) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Register Failed</title><link rel="stylesheet" href="/assets/css/main.css"></head>
<body><div style="text-align:center;padding:50px;color:#ff8b8b;background:#05070b;min-height:100vh"><h1>Submission blocked</h1><p>${htmlEscape(msg)}</p><a href="/register">Back</a></div></body></html>`
}

function registerPage(siteKey) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AoRE Labs - Register</title>
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <form method="POST" action="/api/register" style="max-width:500px;margin:50px auto;background:#070b12;padding:20px;border-radius:10px;color:#d7e0ff">
    <h2>Register</h2>
    <label>Name</label><input name="name" type="text" required style="width:100%;margin-bottom:10px">
    <label>Email</label><input name="email" type="email" required style="width:100%;margin-bottom:10px">
    <label>Password</label><input name="password" type="password" required style="width:100%;margin-bottom:10px">
    <label>Confirm Password</label><input name="confirmPassword" type="password" required style="width:100%;margin-bottom:10px">
    <label>Message</label><textarea name="message" style="width:100%;margin-bottom:10px"></textarea>
    <div class="cf-turnstile" data-sitekey="${htmlEscape(siteKey || "")}" data-theme="dark"></div>
    <button type="submit" style="width:100%;margin-top:10px">Register</button>
  </form>
</body>
</html>`
}

function loginPage(siteKey, msg = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>© AoRE Labs - Admin - Login</title>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <style>
    body{background:#05070b;color:#d7e0ff;font-family:system-ui,sans-serif;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}
    .box{width:360px;background:#070b12;border:1px solid #101a2b;border-radius:14px;padding:22px}
    input{width:100%;padding:10px;margin:6px 0;background:#05070b;border:1px solid #132041;color:#fff;border-radius:6px}
    button{width:100%;padding:10px;margin-top:10px;background:#0a1d6a;color:#fff;border:0;border-radius:6px;cursor:pointer}
  </style>
</head>
<body>
  <div class="box">
    <h1>AoRE Admin</h1>
    <form method="POST" action="/admin/login">
      <label>Username</label><input name="username" type="text" required>
      <label>Password</label><input name="password" type="password" required>
      <div class="cf-turnstile" data-sitekey="${htmlEscape(siteKey || "")}" data-theme="dark"></div>
      <button type="submit">Login</button>
    </form>
    <div style="color:#ff7a7a;font-size:12px;margin-top:10px">${htmlEscape(msg)}</div>
  </div>
</body>
</html>`
}

function usersPage(rowsHtml, totalUsers, kvCostThisView) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>© AoRE Labs - Admin - Users</title>
  <style>
    body{background:#05070b;color:#d7e0ff;font-family:sans-serif;margin:0;padding:20px}
    table{width:100%;border-collapse:collapse;background:#070b12;border:1px solid #101a2b}
    th,td{padding:10px;border-bottom:1px solid #101a2b;font-size:12px}
    .enc-badge{background:#1a0f2e;color:#b98eff;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:6px;border:1px solid #3d246c}
  </style>
</head>
<body>
  <h1>AoRE Users (Total: ${String(totalUsers ?? 0)})</h1>
  <p><a href="/admin/users_export.html" target="_blank">Export HTML</a> | <form method="POST" action="/admin/logout" style="display:inline"><button type="submit">Logout</button></form></p>
  <table>
    <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Password</th><th>IP</th><th>Action</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`
}

async function requireSession(context) {
  const { request, env } = context
  const token = cookieGet(request, "aore_session")
  if (!token) return null
  const raw = await env.AORE_USERS.get(`sess_${token}`)
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    if (!s.exp || nowSec() > s.exp) {
      await env.AORE_USERS.delete(`sess_${token}`)
      return null
    }
    return { token, session: s }
  } catch { return null }
}

async function isLocked(env, ip) {
  const raw = await env.AORE_USERS.get(`lock_${ip}`)
  if (!raw) return false
  try {
    const e = JSON.parse(raw)
    return nowSec() < (parseInt(e.until, 10) || 0)
  } catch { return false }
}

async function addFail(env, info) {
  const { ip } = info
  const k = `attempt_${ip}`
  const raw = await env.AORE_USERS.get(k)
  let obj = { n: 0, t: nowSec() }
  if (raw) { try { obj = JSON.parse(raw) } catch {} }
  if (nowSec() - (obj.t || nowSec()) > 600) obj = { n: 0, t: nowSec() }
  obj.n = (obj.n || 0) + 1
  obj.ts = new Date().toISOString()
  await env.AORE_USERS.put(k, JSON.stringify(obj))
  if (obj.n >= 6) {
    await env.AORE_USERS.put(`lock_${ip}`, JSON.stringify({ ts: new Date().toISOString(), ip, until: nowSec() + LOCK_SEC }))
  }
}

async function clearFail(env, ip) {
  await env.AORE_USERS.delete(`attempt_${ip}`)
  await env.AORE_USERS.delete(`lock_${ip}`)
}

export async function onRequest(context) {
  const { request, next, env } = context
  const url = new URL(request.url)
  let path = url.pathname

  if (path.includes("//")) {
    path = path.replace(/\/{2,}/g, "/")
  }

  if (path === "/admin/api/users_delete" && request.method === "POST") {
    if (!env.AORE_USERS) return json({ ok: false }, 500)
    const body = await readBody(request)
    const key = String(body.key || "")
    if (!key.startsWith("user_")) return json({ ok: false }, 400)
    await env.AORE_USERS.delete(key)
    return json({ ok: true })
  }

  if (path === "/admin/api/users_clear" && request.method === "POST") {
    if (!env.AORE_USERS) return json({ ok: false }, 500)
    let cursor = undefined
    do {
      const list = await env.AORE_USERS.list({ prefix: "user_", cursor, limit: 500 })
      await Promise.all((list.keys || []).map(k => env.AORE_USERS.delete(k.name)))
      cursor = list.list_complete ? undefined : list.cursor
    } while (cursor)
    return json({ ok: true })
  }

  if (path === "/admin/users" && request.method === "GET") {
    if (!env.AORE_USERS) return new Response(aore404("AORE_USERS binding missing"), { status: 500 })
    let kvCost = 0
    const keys = []
    let cursor = undefined
    do {
      const list = await env.AORE_USERS.list({ prefix: "user_", cursor, limit: 500 })
      kvCost += 1
      for (const k of (list.keys || [])) keys.push(k.name)
      cursor = list.list_complete ? undefined : list.cursor
    } while (cursor)

    keys.sort().reverse()
    const rows = []
    for (const key of keys) {
      const raw = await env.AORE_USERS.get(key)
      kvCost += 1
      if (!raw) continue

      try {
        let e;
        const parsedRaw = JSON.parse(raw);
        let badge = "";

        // Check if data is encrypted
        if (parsedRaw.enc) {
          if (!env.KV_MASTER_KEY) {
             e = { ts: "", name: "[LOCKED]", email: "[ENCRYPTED DATA]", password: "...", message: "Missing KV_MASTER_KEY", ip: "" }
             badge = `<span class="enc-badge">LOCKED</span>`;
          } else {
             try {
               const dec = await decryptData(parsedRaw.enc, env.KV_MASTER_KEY)
               e = JSON.parse(dec)
               badge = `<span class="enc-badge">AES-GCM</span>`;
             } catch {
               e = { ts: "", name: "[ERROR]", email: "[DECRYPTION FAILED]", password: "...", message: "Key mismatch", ip: "" }
               badge = `<span class="enc-badge" style="background:#3a0000;color:#ff8b8b">ERR</span>`;
             }
          }
        } else {
          e = parsedRaw; // Fallback for old plain text data
        }

        rows.push(`<tr>
<td class="mono">${htmlEscape(fmtEsDateTime(e.ts))}</td>
<td>${htmlEscape(e.name)} ${badge}</td>
<td class="mono">${htmlEmailLiteral(e.email)}</td>
<td><details><summary>show</summary><div class="mono">${htmlEscape(e.password)}</div><div>${htmlEscape(e.message)}</div></details></td>
<td class="mono">${htmlEscape(e.ip)}</td>
<td><button onclick="fetch('/admin/api/users_delete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'${key}'})}).then(()=>location.reload())">delete</button></td>
</tr>`)
      } catch {}
    }
    return new Response(usersPage(rows.join("\n"), keys.length, kvCost), { headers: { "content-type": "text/html; charset=utf-8" } })
  }

  if (path === "/admin/users_export.html" && request.method === "GET") {
    if (!env.AORE_USERS) return aore404(path)
    let cursor = undefined
    const keys = []
    do {
      const list = await env.AORE_USERS.list({ prefix: "user_", cursor, limit: 1000 })
      for (const k of (list.keys || [])) keys.push(k.name)
      cursor = list.list_complete ? undefined : list.cursor
    } while (cursor)

    keys.sort().reverse()
    const rows = []
    for (const key of keys) {
      const raw = await env.AORE_USERS.get(key)
      if (!raw) continue

      try {
        let e;
        const parsedRaw = JSON.parse(raw);
        if (parsedRaw.enc) {
          if (!env.KV_MASTER_KEY) continue; // Skip if no key to decrypt
          const dec = await decryptData(parsedRaw.enc, env.KV_MASTER_KEY)
          e = JSON.parse(dec)
        } else {
          e = parsedRaw;
        }

        rows.push(`<tr>
<td class="mono">${htmlEscape(fmtEsDateTime(e.ts))}</td>
<td>${htmlEscape(e.name)}</td>
<td class="mono">${htmlEmailLiteral(e.email)}</td>
<td class="mono">${htmlEscape(e.password)}</td>
<td class="msg">${htmlEscape(e.message)}</td>
<td class="mono">${htmlEscape(e.ua)}</td>
<td class="mono">${htmlEscape(e.ip)}</td>
<td class="key">${htmlEscape(key)}</td>
</tr>`)
      } catch {}
    }
    const html = htmlUsersExportPage(rows.join("\n"), `Entries: ${rows.length} - Decrypted via AES-GCM`)
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "content-disposition": `attachment; filename="AoRE_Users_${fileSafeNow()}.html"` } })
  }

  const scan404 = [ "/.env", "/.git", "/wp-admin", "/phpmyadmin", "/config.json" ]
  if (!path.startsWith("/admin/") && scan404.some(s => path.toLowerCase().includes(s))) {
    return aore404(path)
  }

  if (path.startsWith("/admin/") && !["/admin/login", "/admin/logout", "/admin/users", "/admin/users_export.html", "/admin/api/users_delete", "/admin/api/users_clear"].includes(path)) {
    return aore404(path)
  }

  if (path === "/admin/login" && request.method === "GET") {
    return new Response(loginPage(env.TURNSTILE_SITE_KEY, ""), { headers: { "content-type": "text/html; charset=utf-8" } })
  }

  if (path === "/admin/login" && request.method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0"
    if (await isLocked(env, ip)) return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Blocked."), { status: 403, headers: { "content-type": "text/html; charset=utf-8" } })
    const body = await readBody(request)
    const vt = await verifyTurnstile(env, request, (body["cf-turnstile-response"] || "").trim())
    if (!vt.ok) {
      await addFail(env, { ip })
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Human check failed."), { status: 403, headers: { "content-type": "text/html; charset=utf-8" } })
    }
    if ((body.username || "").trim() !== env.ADMIN_USER || (body.password || "").trim() !== env.ADMIN_PASS) {
      await addFail(env, { ip })
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Invalid credentials."), { status: 401, headers: { "content-type": "text/html; charset=utf-8" } })
    }
    await clearFail(env, ip)
    const token = makeToken()
    await env.AORE_USERS.put(`sess_${token}`, JSON.stringify({ exp: nowSec() + 21600 }), { expirationTtl: 21600 })
    return redirect("/admin/users", cookieSet("aore_session", token, 21600))
  }

  if (path === "/admin/logout" && request.method === "POST") {
    const token = cookieGet(request, "aore_session")
    if (token) await env.AORE_USERS.delete(`sess_${token}`)
    return redirect("/admin/login", cookieSet("aore_session", "", 0))
  }

  if (path === "/admin/users" || path.startsWith("/admin/api/") || path === "/admin/users_export.html") {
    const s = await requireSession(context)
    if (!s) return redirect("/admin/login")
  }

  if ((path === "/register" || path === "/register/") && request.method === "GET") {
    return new Response(registerPage(env.TURNSTILE_SITE_KEY), { headers: { "content-type": "text/html; charset=utf-8" } })
  }

  if (path === "/api/register" && request.method === "POST") {
    if (!env.AORE_USERS) return new Response(registerFailPage("Missing AORE_USERS binding."), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } })
    
    // REQUIRE ENCRYPTION KEY
    if (!env.KV_MASTER_KEY) return new Response(registerFailPage("Encryption System Error (Missing Master Key)."), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } })

    const body = await readBody(request)
    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim()
    const password = String(body.password || "").trim()
    const confirmPassword = String(body.confirmPassword || "").trim()

    if (!name || !email || !password || password !== confirmPassword || password.length < 8) {
      return new Response(registerFailPage("Validation failed."), { status: 400, headers: { "content-type": "text/html; charset=utf-8" } })
    }
    const vt = await verifyTurnstile(env, request, String(body["cf-turnstile-response"] || "").trim())
    if (!vt.ok) return new Response(registerFailPage("Human check failed."), { status: 403, headers: { "content-type": "text/html; charset=utf-8" } })

    const entry = {
      ts: new Date().toISOString(),
      name, email, password,
      message: String(body.message || "").trim(),
      ip: request.headers.get("cf-connecting-ip") || "0.0.0.0",
      ua: request.headers.get("user-agent") || "unknown"
    }

    try {
      const payload = JSON.stringify(entry)
      // ENCRIPTACIÓN AES-GCM ANTES DE GUARDAR
      const encryptedBase64 = await encryptData(payload, env.KV_MASTER_KEY)
      const dataToStore = JSON.stringify({ enc: encryptedBase64 })
      
      await env.AORE_USERS.put(`user_${Date.now()}`, dataToStore)
    } catch {
      return new Response(registerFailPage("KV encryption/write failed."), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } })
    }

    return new Response(registerOkPage(), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } })
  }

  return next()
}

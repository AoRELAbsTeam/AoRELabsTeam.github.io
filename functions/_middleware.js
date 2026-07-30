// Cloudflare Pages Function - AoRE Admin (Optimized & Clean)

function htmlEscape(s) {
  return (s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]))
}
function htmlEmailLiteral(email) {
  const s = String(email || "")
  return htmlEscape(s)
    .replace(/@/g, "&#64;")
    .replace(/\./g, "&#46;")
}

function nowSec() { return Math.floor(Date.now() / 1000) }
const LOCK_SEC = 33 * 60
function mins(x) { return Math.max(0, Math.round(x / 60)) }
const AORE_BUILD = "12-6-11-OPTIMIZED"

function pad2(n) {
  return String(n).padStart(2, "0")
}

function fmtEsDateTime(ts) {
  const d = ts ? new Date(ts) : new Date()
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(d)

  const get = (t) => (parts.find(p => p.type === t)?.value || "00")
  const dd = get("day")
  const mm = get("month")
  const yyyy = get("year")
  const HH = get("hour")
  const MM = get("minute")
  const SS = get("second")
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`
}

function fileSafeNow() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
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
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <style>
    :root{--aore-cursor:url("/assets/cursor/aore_cursor.png") 16 16, auto}
    html,body{cursor:var(--aore-cursor)}
    a,button,input,textarea,select,summary,details{cursor:var(--aore-cursor)}

    body{background:#05070b;color:#d7e0ff;font-family:system-ui,Segoe UI,Arial;margin:0}
    .wrap{max-width:1600px;margin:0 auto;padding:16px}

    h1{margin:0 0 8px 0;font-size:18px;letter-spacing:.08em;text-transform:uppercase;color:#7aa2ff}
    .meta{color:#9db3ff;font-size:12px;line-height:1.6;margin:0 0 16px 0}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #132041;background:#070b12;color:#d7e0ff;margin-right:6px}

    .card{background:#070b12;border:1px solid #101a2b;border-radius:14px;overflow:hidden}
    table{width:100%;border-collapse:collapse;table-layout:fixed}

    th,td{
      padding:10px 10px;
      border-bottom:1px solid #101a2b;
      font-size:12px;
      vertical-align:top;
      overflow-wrap:anywhere;
      word-break:break-word;
      white-space:normal;
    }

    th{
      color:#9db3ff;
      text-transform:uppercase;
      letter-spacing:.06em;
      font-size:11px;
      background:#060a10;
      white-space:nowrap;
    }

    tr:hover td{background:#060a10}

    .mono{font-family:ui-monospace,Menlo,Consolas,monospace}
    .muted{color:#7f90c9}
    .key{font-family:ui-monospace,Menlo,Consolas,monospace;color:#8fb0ff}

    td.msg{white-space:pre-wrap}

    .export-footer{
      margin-top:14px;
      padding-top:12px;
      border-top:1px solid #101a2b;
      display:flex;
      justify-content:center;
      align-items:center;
      text-align:center;
    }

    .aore-sig{
      display:inline-block;
      max-width:1600px;
      padding:8px 12px;
      border:1px solid #132041;
      background:#070b12;
      border-radius:999px;
      font-size:12px;
      letter-spacing:.06em;
      line-height:1.35;
      white-space:normal;
      word-break:break-word;
    }

    .aore-sig .sig-aore{
      font-weight:800;
      text-transform:uppercase;
      letter-spacing:.12em;
      background:linear-gradient(90deg,#62a8ff,#0aa2ff,#7aa2ff);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }

    .aore-sig .sig-name{
      font-weight:800;
      background:linear-gradient(90deg,#7aa2ff,#b9ffd0,#7aa2ff);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }

    .aore-sig .sig-rest{
      color:#9db3ff;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>© AoRE Labs - Users Export</h1>
    <p class="meta">
      <span class="badge">AoRE</span>
      <span class="badge">Admin Export</span>
      <span class="badge">HTML</span>
      <br>
      ${htmlEscape(summary)}
    </p>

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

    <div class="export-footer">
      <div class="aore-sig">
        <span class="sig-rest">Generated by </span>
        <span class="sig-aore">AoRE Admin</span>
        <span class="sig-rest"> / </span>
        <span class="sig-name">InDuLgEo</span>
        <span class="sig-rest"> 2025-2026 - build ${AORE_BUILD} - ${htmlEscape(fmtEsDateTime(new Date().toISOString()))}</span>
      </div>
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
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
  ]
  if (typeof maxAgeSec === "number") parts.push(`Max-Age=${maxAgeSec}`)
  return parts.join("; ")
}

function redirect(location, setCookieHeader) {
  const headers = new Headers({ Location: location })
  if (setCookieHeader) headers.set("Set-Cookie", setCookieHeader)
  return new Response(null, { status: 302, headers })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  })
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
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - AoRE Labs</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#05070b;color:#8bffb0;font-family:ui-monospace,Menlo,Consolas,monospace}
    .box{max-width:820px;padding:26px 22px;border:1px solid #0e2a18;background:#060f09;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.55);text-align:center}
    h1{margin:0 0 10px 0;font-size:18px;letter-spacing:.12em;text-transform:uppercase}
    .muted{color:#6bdc95;opacity:.85;font-size:12px;line-height:1.6}
    .path{margin-top:12px;color:#b9ffd0;font-size:12px;word-break:break-all}
    .sig{margin-top:14px;color:#6bdc95;opacity:.75;font-size:11px}
  </style>
</head>
<body>
  <div class="box">
    <h1>404 - Not Found</h1>
    <div class="muted">
      AoRE Labs security perimeter.<br>
      This route does not exist on this server.
    </div>
    <div class="path">${htmlEscape(path || "")}</div>
    <div class="sig">© AoRE Labs 2006-2026 - build ${AORE_BUILD} {0100010101000100}</div>
  </div>
</body>
</html>`
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

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: fd
  })

  const j = await r.json().catch(() => ({}))
  return { ok: !!j.success, data: j }
}

function registerOkPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AoRE Labs - Register OK</title>
  <link rel="icon" href="/favicon.ico">
  <meta name="theme-color" content="#0aa2ff">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <div class="auth-bar">
    <a class="auth-btn" href="/">Home</a>
  </div>

  <section class="aore-hero">
    <div class="aore-wrap">
      <div class="aore-hero-inner">
        <p class="aore-eyebrow"><span class="neon">AoRE Labs</span> - submission accepted</p>
        <p class="aore-lead">
          Your registration was received successfully.<br>
          We will review the request and respond by email.
        </p>
      </div>
    </div>
  </section>

  <section class="aore-section">
    <div class="aore-wrap">
      <div class="aore-card">
        <div class="aore-card-title">Status</div>
        <div class="aore-card-sub">
         Ticket created - intake stored.
        </div>
      </div>
    </div>
  </section>

  <footer>
    <p>© AoRE Labs 2006-2026</p>
  </footer>
</body>
</html>`
}

function registerFailPage(msg) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AoRE Labs - Register Failed</title>
  <link rel="icon" href="/favicon.ico">
  <meta name="theme-color" content="#0aa2ff">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <div class="auth-bar">
    <a class="auth-btn" href="/register">Back</a>
  </div>

  <section class="aore-hero">
    <div class="aore-wrap">
      <div class="aore-hero-inner">
        <p class="aore-eyebrow"><span class="neon">AoRE Labs</span> - submission blocked</p>
        <p class="aore-lead">
          The request could not be processed.
        </p>
      </div>
    </div>
  </section>

  <section class="aore-section">
    <div class="aore-wrap">
      <div class="aore-card">
        <div class="aore-card-title">Reason</div>
        <div class="aore-card-sub">${htmlEscape(msg || "Unknown error")}</div>
      </div>
    </div>
  </section>

  <footer>
    <p>© AoRE Labs 2006-2026</p>
  </footer>
</body>
</html>`
}

function registerPage(siteKey) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AoRE Labs - Register</title>

  <link rel="icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <meta name="theme-color" content="#0aa2ff">
  <link rel="stylesheet" href="/assets/css/main.css">

  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>

  <div class="auth-bar">
    <a class="auth-btn" href="/">Home</a>
  </div>

  <section class="aore-hero">
    <div class="aore-wrap">
      <div class="aore-hero-inner">
        <p class="aore-eyebrow"><span class="neon">AoRE Labs</span> - registration gateway</p>
        <p class="aore-lead">
          Register your contact and request. This is a controlled intake. We only use your data to respond.
        </p>
      </div>
    </div>
  </section>

  <section class="aore-section">
    <div class="aore-wrap">
      <div class="aore-card aore-form-card">
        <div class="aore-card-title">Register</div>
        <div class="aore-card-sub">
          Fill the form and submit. Fields marked with * are required.
        </div>

        <form id="aoreRegisterForm" class="aore-form" method="POST" action="/api/register">
          <div class="aore-grid">
            <div class="aore-field">
              <label for="name">Name *</label>
              <input id="name" name="name" type="text" maxlength="64" autocomplete="name" required>
            </div>

            <div class="aore-field">
              <label for="email">Email *</label>
              <input id="email" name="email" type="email" maxlength="128" autocomplete="email" required>
            </div>
          </div>

          <div class="aore-grid">
            <div class="aore-field">
              <label for="password">Password *</label>
              <input id="password" name="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" required>
              <div class="aore-hint">Min 8 characters.</div>
            </div>

            <div class="aore-field">
              <label for="confirmPassword">Confirm password *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" minlength="8" maxlength="72" autocomplete="new-password" required>
            </div>
          </div>

          <div class="aore-field">
            <label for="message">Request details (optional)</label>
            <textarea id="message" name="message" rows="6" maxlength="800" placeholder="Describe what you need - context, goals, platform, constraints."></textarea>
            <div class="aore-hint"><span id="msgCount">0</span>/800</div>
          </div>

          <div class="aore-field">
            <label>Human check *</label>
            <div class="cf-turnstile" data-sitekey="${htmlEscape(siteKey || "")}" data-theme="dark"></div>
            <div class="aore-hint">This prevents automated spam.</div>
          </div>

          <div id="aoreFormError" class="aore-form-error" role="alert" aria-live="polite"></div>

          <div class="aore-actions">
            <button id="btnRegister" class="aore-btn" type="submit">Register</button>
            <a class="aore-link" href="/">Back to home</a>
          </div>

          <div class="aore-hint aore-footnote">
            By submitting, you confirm you own this email. We do not sell or share data.
          </div>
        </form>

      </div>
    </div>
  </section>

  <footer>
    <p>© AoRE Labs 2006-2026</p>
  </footer>

  <script src="/assets/js/register.js"></script>
</body>
</html>`
}

function loginPage(siteKey, msg = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>© AoRE Labs 2026 - Admin - Login</title>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <style>
    :root{--aore-cursor:url("/assets/cursor/aore_cursor.png") 6 2, auto}
    html,body{cursor:var(--aore-cursor)}
    a,button,input,textarea,select{cursor:var(--aore-cursor)}

    body{background:#05070b;color:#d7e0ff;font-family:system-ui,Segoe UI,Arial;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}
    .box{width:360px;background:#070b12;border:1px solid #101a2b;border-radius:14px;padding:22px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
    h1{font-size:16px;margin:0 0 14px 0;letter-spacing:.08em;text-transform:uppercase;color:#7aa2ff}
    label{display:block;margin:10px 0 6px 0;font-size:12px;color:#9db3ff}
    input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #132041;background:#05070b;color:#e9efff;outline:none}
    .cf-turnstile{margin-top:12px}
    button{width:100%;margin-top:14px;padding:10px 12px;border-radius:10px;border:1px solid #1b3bff;background:#0a1d6a;color:#e9efff;cursor:pointer}
    .msg{margin-top:10px;font-size:12px;color:#ff7a7a;min-height:16px}
    .hint{margin-top:10px;font-size:12px;color:#7f90c9}
  </style>
</head>
<body>
  <div class="box">
    <h1>AoRE Admin</h1>
    <form method="POST" action="/admin/login" autocomplete="on">
      <label for="username">username</label>
      <input id="username" name="username" type="text" autocomplete="username" required>
      <label for="password">password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <div class="cf-turnstile" data-sitekey="${htmlEscape(siteKey || "")}" data-theme="dark"></div>
      <button type="submit">login</button>
    </form>
    <div class="msg">${htmlEscape(msg)}</div>
    <div class="hint">No browser auth. Session based. © AoRE Labs 2026.</div>
  </div>
</body>
</html>`
}


function usersPage(rowsHtml, totalUsers, kvCostThisView) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>© AoRE Labs 2025-2026 - Admin - Users</title>

  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <style>
    :root{--aore-cursor:url("/assets/cursor/aore_cursor.png") 16 16, auto}
    html,body{cursor:var(--aore-cursor)}
    a,button,input,textarea,select,summary,details{cursor:var(--aore-cursor)}

    body{background:#05070b;color:#d7e0ff;font-family:system-ui,Segoe UI,Arial;margin:0}
    header{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #101a2b;background:#070b12;flex-wrap:wrap}
    h1{font-size:14px;margin:0;letter-spacing:.08em;text-transform:uppercase;color:#7aa2ff}
    .btns{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}

    button,a.btn{
      padding:8px 10px;
      border-radius:10px;
      border:1px solid #132041;
      background:#05070b;
      color:#e9efff;
      cursor:var(--aore-cursor);
      text-decoration:none;
      font-size:12px;
      display:inline-flex;
      align-items:center;
      line-height:1;
      outline:none;
    }
    a.btn:focus,button:focus{outline:2px solid #1b3bff;outline-offset:2px}
    button.danger{border-color:#3a1b1b;background:#180707}

    main{padding:16px}
    table{width:100%;border-collapse:collapse;background:#070b12;border:1px solid #101a2b;border-radius:14px;overflow:hidden;table-layout:fixed}
    th,td{padding:10px 10px;border-bottom:1px solid #101a2b;font-size:12px;vertical-align:top;overflow-wrap:anywhere}
    th{color:#9db3ff;text-transform:uppercase;letter-spacing:.06em;font-size:11px;background:#060a10}
    tr:hover td{background:#060a10}

    .muted{color:#7f90c9}
    .key{font-family:ui-monospace,Menlo,Consolas,monospace;color:#8fb0ff}
    .mono{font-family:ui-monospace,Menlo,Consolas,monospace}
    .actions{white-space:nowrap}

    details{border:1px solid #101a2b;background:#05070b;border-radius:10px;padding:8px}
    summary{cursor:var(--aore-cursor);color:#8fb0ff}

    .stats{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .stat{display:inline-flex;gap:6px;align-items:center;padding:6px 10px;border-radius:999px;border:1px solid #0e2a18;background:#060f09;color:#8bffb0;font-size:12px}
    .stat b{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;color:#b9ffd0}

    .panel-footer{
      margin-top:18px;
      display:flex;
      justify-content:center;
    }

    .panel-sign{
      padding:10px 18px;
      border-radius:999px;
      border:1px solid #132041;
      background:#070b12;
      font-size:13px;
      letter-spacing:.08em;
      color:#9db3ff;
      box-shadow:0 0 20px rgba(98,168,255,.08);
      text-align:center;
      white-space:normal;
    }

    .sig-a{color:#62a8ff}
    .sig-o{color:#7aa2ff}
    .sig-r{color:#9fd0ff}
    .sig-e{color:#b7e0ff}
    .sig-l{color:#6bdc95}
    .sig-b{color:#9cffd5}
    .sig-s{color:#c8ffe6}
    .sig-name{color:#ff8fb1}
    .sig-build{color:#7f90c9}
  </style>
</head>
<body>
  <header>
    <h1>AoRE Users</h1>

    <div class="stats">
      <span class="stat">Total: <b>${String(totalUsers ?? 0)}</b></span>
      <span class="stat">KV en esta sesión: <b id="aore_kv_session">0</b></span>
    </div>

    <div class="btns">
      <a class="btn" id="btn_export" href="/admin/users_export.html" target="_blank" rel="noopener">export html</a>
      <button class="danger" onclick="clearAllUsers()">delete all</button>
      <form method="POST" action="/admin/logout" style="margin:0">
        <button type="submit">logout</button>
      </form>
    </div>
  </header>

  <main>
    <table>
      <thead>
        <tr>
          <th style="width:160px">Date (ES)</th>
          <th style="width:220px">Name</th>
          <th style="width:260px">Email</th>
          <th>Password</th>
          <th style="width:220px">IP</th>
          <th style="width:170px" class="actions">Action</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="panel-footer">
      <div class="panel-sign">
        © 
        <span class="sig-a">A</span><span class="sig-o">o</span><span class="sig-r">R</span><span class="sig-e">E</span>
        <span class="sig-l">L</span><span class="sig-a">a</span><span class="sig-b">b</span><span class="sig-s">s</span>
        <span class="sig-build"> & Founder</span>
        <span class="sig-name">InDuLgEo</span>
        <span class="sig-build">2025-2026 - build ${AORE_BUILD} - EOF</span>
      </div>
    </div>

  </main>

  <script>
    const KV_COST_THIS_VIEW = ${Number(kvCostThisView || 0)}
    const KV_COST_EXPORT_EST = KV_COST_THIS_VIEW

    function kvGet() {
      const v = sessionStorage.getItem("aore_kv_session_users")
      const n = parseInt(v || "0", 10)
      return Number.isFinite(n) ? n : 0
    }

    function kvSet(n) {
      sessionStorage.setItem("aore_kv_session_users", String(n))
      const el = document.getElementById("aore_kv_session")
      if (el) el.textContent = String(n)
    }

    function kvAdd(n) {
      n = parseInt(String(n || 0), 10) || 0
      kvSet(kvGet() + n)
    }

    kvAdd(KV_COST_THIS_VIEW)

    const btnExport = document.getElementById("btn_export")
    if (btnExport) {
      btnExport.addEventListener("click", () => kvAdd(KV_COST_EXPORT_EST))
    }

    async function delUser(key) {
      if (!confirm("Delete this user entry?")) return
      const r = await fetch("/admin/api/users_delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key })
      })
      const j = await r.json()
      if (!j.ok) return alert("Delete failed")
      kvAdd(1)
      location.reload()
    }

    async function clearAllUsers() {
      if (!confirm("Delete ALL user entries?")) return
      const r = await fetch("/admin/api/users_clear", { method: "POST" })
      const j = await r.json()
      if (!j.ok) return alert("Clear failed")
      kvAdd(1)
      location.reload()
    }
  </script>
</body>
</html>`;
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
  } catch {
    return null
  }
}

async function isLocked(env, ip) {
  const raw = await env.AORE_USERS.get(`lock_${ip}`)
  if (!raw) return false

  try {
    const e = JSON.parse(raw)
    const until = parseInt(e.until, 10) || 0
    return nowSec() < until
  } catch {
    return false
  }
}

async function addFail(env, info) {
  const { ip, ua, country, city, colo, lang } = info

  const k = `attempt_${ip}`
  const raw = await env.AORE_USERS.get(k)

  let obj = { n: 0, t: nowSec() }
  if (raw) {
    try { obj = JSON.parse(raw) } catch {}
  }

  // ventana de 10 min
  const age = nowSec() - (obj.t || nowSec())
  if (age > 600) obj = { n: 0, t: nowSec() }

  obj.n = (obj.n || 0) + 1
  obj.ts = new Date().toISOString()
  obj.ip = ip

  await env.AORE_USERS.put(k, JSON.stringify(obj))

  // bloqueo tras 6 fallos
  if (obj.n >= 6) {
    const until = nowSec() + LOCK_SEC
    const lockObj = { ts: new Date().toISOString(), ip, until }
    await env.AORE_USERS.put(`lock_${ip}`, JSON.stringify(lockObj))
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
      const keys = list.keys || []
      await Promise.all(keys.map(k => env.AORE_USERS.delete(k.name)))
      cursor = list.cursor
      if (!list.list_complete) continue
      cursor = undefined
    } while (cursor)

    return json({ ok: true })
  }

  if (path === "/admin/users" && request.method === "GET") {
    if (!env.AORE_USERS) {
      return new Response(aore404("AORE_USERS binding missing"), { status: 500 })
    }

    let kvCost = 0
    const keys = []
    let cursor = undefined

    do {
      const list = await env.AORE_USERS.list({ prefix: "user_", cursor, limit: 500 })
      kvCost += 1
      for (const k of (list.keys || [])) keys.push(k.name)
      cursor = list.cursor
      if (!list.list_complete) continue
      cursor = undefined
    } while (cursor)

    keys.sort().reverse()

    const rows = []
    for (const key of keys) {
      const raw = await env.AORE_USERS.get(key)
      kvCost += 1
      if (!raw) continue

      try {
        const e = JSON.parse(raw)
        const tsIso = e.ts || ""
        const ip = e.ip || ""
        const name = e.name || ""
        const email = e.email || ""
        const pass = e.password || ""
        const ua = e.ua || ""
        const msg = e.message || ""

        rows.push(`<tr>
<td class="mono">${htmlEscape(fmtEsDateTime(tsIso))}</td>
<td>${htmlEscape(name)}</td>
<td class="mono">${htmlEmailLiteral(email)}</td>
<td>
  <details>
    <summary>show</summary>
    <div class="mono">${htmlEscape(pass)}</div>
    <div class="muted" style="margin-top:8px">Message:</div>
    <div>${htmlEscape(msg)}</div>
    <div class="muted" style="margin-top:8px">UA:</div>
    <div class="mono">${htmlEscape(ua)}</div>
  </details>
  <div class="muted key" style="margin-top:6px">${htmlEscape(key)}</div>
</td>
<td class="mono">${htmlEscape(ip)}</td>
<td class="actions"><button onclick="delUser('${htmlEscape(key)}')">delete</button></td>
</tr>`)
      } catch {}
    }

    return new Response(usersPage(rows.join("\n"), keys.length, kvCost), {
      headers: { "content-type": "text/html; charset=utf-8" }
    })
  }

  if (path === "/admin/users_export.html" && request.method === "GET") {
    if (!env.AORE_USERS) return aore404(path)

    let cursor = undefined
    const keys = []
    do {
      const list = await env.AORE_USERS.list({ prefix: "user_", cursor, limit: 1000 })
      for (const k of (list.keys || [])) keys.push(k.name)
      cursor = list.cursor
      if (!list.list_complete) continue
      cursor = undefined
    } while (cursor)

    keys.sort().reverse()

    const rows = []
    for (const key of keys) {
      const raw = await env.AORE_USERS.get(key)
      if (!raw) continue

      try {
        const e = JSON.parse(raw)
        const tsIso = e.ts || ""
        const name = e.name || ""
        const email = e.email || ""
        const pass = e.password || ""
        const msg = e.message || ""
        const ua = e.ua || ""
        const ip = e.ip || ""

        rows.push(`<tr>
<td class="mono">${htmlEscape(fmtEsDateTime(tsIso))}</td>
<td>${htmlEscape(name)}</td>
<td class="mono">${htmlEmailLiteral(email)}</td>
<td class="mono">${htmlEscape(pass)}</td>
<td class="msg">${htmlEscape(msg)}</td>
<td class="mono">${htmlEscape(ua)}</td>
<td class="mono">${htmlEscape(ip)}</td>
<td class="key">${htmlEscape(key)}</td>
</tr>`)
      } catch {}
    }

    const filename = `AoRE_Users_${fileSafeNow()}.html`
    const summary = `Entries: ${rows.length} - Export time (ES): ${fmtEsDateTime(new Date().toISOString())}`
    const html = htmlUsersExportPage(rows.join("\n"), summary)

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`
      }
    })
  }

  // -------------------------
  // Hard 404 para rutas de scan basura 
  // -------------------------
  const scan404 = [
    "/.env", "/.env.", "/.git", "/wp-", "/wordpress", "/xmlrpc.php",
    "/wlwmanifest.xml", "/phpmyadmin", "/pma", "/admin.php", "/login.php",
    "/cgi-bin", "/server-status", "/actuator", "/boaform", "/HNAP1",
    "/config.json", "/config.js", "/aws.config.js", "/aws-config.js"
  ]

  const isAdminPath = path.startsWith("/admin/")

  if (!isAdminPath) {
    const p = path.toLowerCase()
    if (scan404.some(s => p.startsWith(s) || p.includes(s))) {
      return aore404(path)
    }
  }

  // 404 AoRE para probes típicas dentro de /admin que NO existen en tu router
  if (path.startsWith("/admin/") && ![
    "/admin/login",
    "/admin/logout",
    "/admin/users",
    "/admin/users_export.html",
    "/admin/api/users_delete",
    "/admin/api/users_clear"
  ].includes(path)) {
    return aore404(path)
  }
  
  // -------------------------
  // Router ADMIN
  // -------------------------
  if (path === "/admin/login" && request.method === "GET") {
    return new Response(loginPage(env.TURNSTILE_SITE_KEY, ""), { headers: { "content-type": "text/html; charset=utf-8" } })
  }

  if (path === "/admin/login" && request.method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0"

    if (await isLocked(env, ip)) {
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Blocked. Too many attempts."), {
        status: 403,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    const body = await readBody(request)
    const tokenTs = (body["cf-turnstile-response"] || "").trim()
    const vt = await verifyTurnstile(env, request, tokenTs)
    
    if (!vt.ok) {
      await addFail(env, { ip })
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Human check failed."), {
        status: 403,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    const u = (body.username || "").trim()
    const p = (body.password || "").trim()

    const adminU = env.ADMIN_USER || ""
    const adminP = env.ADMIN_PASS || ""

    if (!adminU || !adminP || !env.SESSION_SECRET) {
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Auth not configured."), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    if (u !== adminU || p !== adminP) {
      await addFail(env, { ip })
      return new Response(loginPage(env.TURNSTILE_SITE_KEY, "Invalid credentials."), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    await clearFail(env, ip)

    const token = makeToken()
    const exp = nowSec() + 60 * 60 * 6
    await env.AORE_USERS.put(`sess_${token}`, JSON.stringify({ exp }), { expirationTtl: 60 * 60 * 6 })

    // Redirigir a users, ya no a logs
    return redirect("/admin/users", cookieSet("aore_session", token, 60 * 60 * 6))
  }

  if (path === "/admin/logout" && request.method === "POST") {
    const token = cookieGet(request, "aore_session")
    if (token) await env.AORE_USERS.delete(`sess_${token}`)
    return redirect("/admin/login", cookieSet("aore_session", "", 0))
  }

  // Protege las rutas de admin
  if (
    path === "/admin/users" ||
    path.startsWith("/admin/api/") ||
    path === "/admin/users_export.html"
  ) {
    const s = await requireSession(context)
    if (!s) return redirect("/admin/login")
  }

  // -------------------------
  // Route: REGISTER
  // -------------------------
  if ((path === "/register" || path === "/register/") && request.method === "GET") {
    return new Response(registerPage(env.TURNSTILE_SITE_KEY), {
      headers: { "content-type": "text/html; charset=utf-8" }
    })
  }

  // -------------------------
  // API: REGISTER (POST)
  // -------------------------
  if (path === "/api/register" && request.method === "POST") {
    if (!env.AORE_USERS) {
      return new Response(registerFailPage("Server not configured: missing AORE_USERS binding."), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0"
    const ua = request.headers.get("user-agent") || "unknown"
    const lang = request.headers.get("accept-language") || "unknown"
    const cf = request.cf || {}

    const body = await readBody(request)

    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim()
    const password = String(body.password || "").trim()
    const confirmPassword = String(body.confirmPassword || "").trim()
    const message = String(body.message || "").trim()

    // Turnstile token
    const tokenTs = String(body["cf-turnstile-response"] || "").trim()

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return new Response(registerFailPage("Missing required fields."), {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    if (password !== confirmPassword) {
      return new Response(registerFailPage("Passwords do not match."), {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    if (password.length < 8) {
      return new Response(registerFailPage("Password too short. Minimum is 8 characters."), {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    if (message.length > 800) {
      return new Response(registerFailPage("Message too long. Limit is 800 characters."), {
        status: 400,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    // Verify Turnstile server-side
    const vt = await verifyTurnstile(env, request, tokenTs)
    if (!vt.ok) {
      return new Response(registerFailPage("Human check failed."), {
        status: 403,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }

    // Store in KV (users)
    const ts = new Date().toISOString()
    const key = `user_${Date.now()}`
    const entry = {
      ts,
      type: "user_register",
      name,
      email,
      password,
      message,
      ip,
      ua,
      lang,
      country: cf.country || "UNK",
      city: cf.city || "UNK",
      colo: cf.colo || "UNK"
    }

    try {
      await env.AORE_USERS.put(key, JSON.stringify(entry))
    } catch (e) {
      return new Response(registerFailPage("KV write failed."), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" }
      })
    }
    
    return new Response(registerOkPage(), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" }
    })
  }

  return next()
}

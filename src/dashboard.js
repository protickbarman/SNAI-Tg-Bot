const http = require("http");
const db = require("./db");

const startTime = Date.now();

function statusData() {
  const data = db.load();
  const users = data.users || {};
  let totalUsers = 0, activeCycles = 0, totalBuys = 0;
  for (const [cid, s] of Object.entries(users)) {
    totalUsers++;
    if (s.cycle_active) activeCycles++;
    totalBuys += (s.buy_count || 0) + (s.history ? s.history.length : 0);
  }
  return {
    uptime: Math.floor((Date.now() - startTime) / 1000),
    users: totalUsers,
    active_cycles: activeCycles,
    total_buys: totalBuys,
    started: new Date(startTime).toISOString(),
  };
}

function html(status) {
  const u = status.uptime;
  const h = Math.floor(u / 3600);
  const m = Math.floor((u % 3600) / 60);
  const s = u % 60;
  const uptimeStr = `${h}h ${m}m ${s}s`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SN Bot Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#1e293b;border-radius:16px;padding:32px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.4)}
h1{font-size:22px;margin-bottom:24px;color:#38bdf8}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.item{background:#0f172a;border-radius:10px;padding:16px;text-align:center}
.label{font-size:11px;text-transform:uppercase;color:#94a3b8;letter-spacing:.5px}
.value{font-size:24px;font-weight:700;margin-top:4px}
.green{color:#4ade80}
.blue{color:#38bdf8}
.yellow{color:#fbbf24}
.purple{color:#a78bfa}
.footer{margin-top:20px;font-size:11px;color:#64748b;text-align:center}
</style></head>
<body>
<div class="card">
<h1>🤖 SN Bot Dashboard</h1>
<div class="grid">
<div class="item"><div class="label">Status</div><div class="value green">● Live</div></div>
<div class="item"><div class="label">Uptime</div><div class="value blue">${uptimeStr}</div></div>
<div class="item"><div class="label">Users</div><div class="value yellow">${status.users}</div></div>
<div class="item"><div class="label">Active Cycles</div><div class="value purple">${status.active_cycles}</div></div>
</div>
<div class="footer">started ${status.started} &middot; refreshes every 10s</div>
</div>
<script>setTimeout(()=>location.reload(),10000)</script>
</body></html>`;
}

function start(port = 3000) {
  const server = http.createServer((req, res) => {
    if (req.url === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(statusData()));
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html(statusData()));
  });
  server.listen(port, () => {
    console.log(`Dashboard: http://localhost:${port}`);
  });
  return server;
}

module.exports = { start, statusData };

const https = require("https");
const config = require("../config.json");

const API = `https://api.telegram.org/bot${config.BOT_TOKEN}`;

function send(chatId, text, opts = {}) {
  return new Promise((resolve, reject) => {
    const payload = { chat_id: chatId, text, parse_mode: "Markdown", ...opts };
    const b = JSON.stringify(payload);
    const u = new URL(`${API}/sendMessage`);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    });
    req.on("error", reject);
    req.write(b);
    req.end();
  });
}

function keyboard(rows) {
  return { keyboard: rows.map(r => r.map(c => ({ text: c }))), resize_keyboard: true };
}

const removeKeyboard = () => ({ remove_keyboard: true });

module.exports = { send, keyboard, removeKeyboard };

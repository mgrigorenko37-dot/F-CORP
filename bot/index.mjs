/**
 * F-CORP Telegram Bot
 * Long-polling bot that responds to /start with a Mini App button.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

// Replit injects REPLIT_DOMAINS (comma-separated) in production,
// and REPLIT_DEV_DOMAIN in development.
const domains = process.env.REPLIT_DOMAINS;
const devDomain = process.env.REPLIT_DEV_DOMAIN;
const BASE_APP_URL = domains
  ? `https://${domains.split(',')[0].trim()}`
  : devDomain
    ? `https://${devDomain}`
    : null;

// Cache-busting version tag: forces Telegram's WebView to fetch a fresh
// index.html/JS bundle instead of serving a stale cached copy on each launch.
const BUILD_VERSION = Date.now().toString(36);
const APP_URL = BASE_APP_URL ? `${BASE_APP_URL}/?v=${BUILD_VERSION}` : null;

if (!TOKEN) {
  console.error('[F-CORP Bot] ERROR: TELEGRAM_BOT_TOKEN is not set.');
  process.exit(1);
}

if (!APP_URL) {
  console.error('[F-CORP Bot] ERROR: Could not determine app URL (no REPLIT_DOMAINS or REPLIT_DEV_DOMAIN).');
  process.exit(1);
}

console.log(`[F-CORP Bot] Starting... Mini App URL: ${APP_URL}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, body = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35_000);
  try {
    const res = await fetch(`${API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!data.ok) {
      const err = new Error(`Telegram API error on ${method}: ${data.description ?? JSON.stringify(data)}`);
      err.errorCode = data.error_code;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function handleUpdate(update) {
  // Regular message
  const msg = update.message;
  if (msg?.text) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === '/start' || text.startsWith('/start ')) {
      await call('sendMessage', {
        chat_id: chatId,
        text:
          '⚽ *Добро пожаловать в F-CORP!*\n\n' +
          'Football Corporation — ты Владелец клуба.\n' +
          'Нанимай менеджера, управляй трансферами и веди клуб к чемпионству.\n\n' +
          'Нажми кнопку ниже, чтобы начать:',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚽  Открыть F-CORP', web_app: { url: APP_URL } }],
          ],
        },
      });
    }
  }
}

async function poll() {
  let offset = 0;
  console.log('[F-CORP Bot] Polling started. Waiting for messages...');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const data = await call('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message'],
      });

      if (Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          handleUpdate(update).catch((err) =>
            console.error('[F-CORP Bot] Handler error:', err.message ?? err)
          );
        }
      }
    } catch (err) {
      const code = err.errorCode;

      if (code === 401) {
        // Invalid token — no point retrying
        console.error('[F-CORP Bot] FATAL: Invalid bot token. Exiting.');
        process.exit(1);
      } else if (code === 409) {
        // Another instance is polling — back off longer
        console.warn('[F-CORP Bot] Conflict (409): another instance is running. Retrying in 10s...');
        await sleep(10_000);
      } else if (code === 429) {
        // Rate limited — respect retry_after if available, else 5s
        console.warn('[F-CORP Bot] Rate limited (429). Retrying in 5s...');
        await sleep(5_000);
      } else {
        // Network error or other API error — short backoff
        console.error('[F-CORP Bot] Error:', err.message ?? err);
        await sleep(3_000);
      }
    }
  }
}

poll();

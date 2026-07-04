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
const APP_URL = domains
  ? `https://${domains.split(',')[0].trim()}`
  : devDomain
    ? `https://${devDomain}`
    : null;

if (!TOKEN) {
  console.error('[F-CORP Bot] ERROR: TELEGRAM_BOT_TOKEN is not set.');
  process.exit(1);
}

if (!APP_URL) {
  console.error('[F-CORP Bot] ERROR: Could not determine app URL (no REPLIT_DOMAINS or REPLIT_DEV_DOMAIN).');
  process.exit(1);
}

console.log(`[F-CORP Bot] Starting... Mini App URL: ${APP_URL}`);

async function call(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`[F-CORP Bot] API error on ${method}:`, JSON.stringify(data));
  }
  return data;
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

      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          handleUpdate(update).catch((err) =>
            console.error('[F-CORP Bot] Handler error:', err)
          );
        }
      }
    } catch (err) {
      console.error('[F-CORP Bot] Network error:', err.message ?? err);
      // Back off briefly then retry
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

poll();

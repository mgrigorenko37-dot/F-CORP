# F-CORP

Football Manager Telegram Mini App. Users register, create a club, and manage their squad, staff, transfers, training, finances, and tournaments — all inside Telegram.

## Stack

- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + Framer Motion
- **Bot**: Node.js (ESM) long-polling via Telegram Bot API
- **Package manager**: pnpm workspace

## Project structure

```
/
├── artifacts/f-corp/   # React Mini App (Telegram WebApp)
│   ├── src/
│   │   ├── components/ # UI primitives + game components
│   │   ├── screens/    # Splash, Registration, LeagueSelect, ClubCreate, Main
│   │   ├── data/       # Static game data (leagues, players, personnel…)
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Telegram SDK helpers, localStorage utils
│   └── vite.config.ts
├── bot/
│   └── index.mjs       # Telegram bot (long-polling, responds to /start)
└── pnpm-workspace.yaml
```

## Running locally

Both workflows are pre-configured:

| Workflow | Command |
|---|---|
| F-CORP Web App | `PORT=23610 BASE_PATH=/ pnpm --filter @workspace/f-corp run dev` |
| F-CORP Telegram Bot | `node bot/index.mjs` |

## Required secrets

| Secret | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather — required for the bot workflow |

## Notes

- The bot uses long-polling (`getUpdates`) — suitable for single-instance dev/hobby use. For production autoscale deployments, switch to webhook mode to avoid 409 conflicts.
- The Mini App reads/writes game state via localStorage (no backend database).

## User preferences

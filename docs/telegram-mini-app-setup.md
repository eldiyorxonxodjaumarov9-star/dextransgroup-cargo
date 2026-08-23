# Telegram Mini App + webhook setup (DextransGroup Cargo)

This document is for the **next stage**, when you create the bot in BotFather.
The codebase is already prepared; do **not** commit real tokens.

## 1. Create the bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newbot` and follow prompts.
3. Copy the **bot token** (never commit it; never put it in `NEXT_PUBLIC_*`).

## 2. Collect admin Telegram numeric IDs

1. Open [@userinfobot](https://t.me/userinfobot) or a similar tool.
2. Note each admin’s **numeric user id** (digits only).
3. Do **not** use usernames for authorization.

## 3. Create a webhook secret

Generate a long random string (32+ chars), for example:

```bash
openssl rand -hex 32
```

## 4. Set Vercel environment variables

In the `dextransgroup-cargo` Vercel project → Settings → Environment Variables:

```env
APP_URL=https://dextransgroup-cargo.vercel.app
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_IDS=
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS=600
```

Also ensure `SESSION_SECRET` remains set (existing admin sessions).

Redeploy production after saving env vars.

## 5. Register webhook + menu (safe script)

With env loaded locally (or Vercel CLI env pull):

```bash
node scripts/setup-telegram-bot.mjs
```

The script will:

1. `getMe` — validate token (token not printed)
2. `setWebhook` → `${APP_URL}/api/telegram/webhook` with `secret_token`
3. `setMyCommands` — `/start`
4. `setChatMenuButton` → `${APP_URL}/telegram`

## 6. BotFather Main Mini App

In BotFather:

1. `/mybots` → your bot → **Bot Settings** → **Configure Mini App** / **Main Mini App**
2. Set URL to:

```text
https://dextransgroup-cargo.vercel.app/telegram
```

After this, the bot profile can show a **Launch app** button.

Optional: also configure Menu Button to the same URL (script already sets chat menu button via API).

## 7. Test plan

### Regular user

1. Open the bot → `/start`
2. Only **🚚 Saytni ochish** appears
3. Opens Mini App at `/telegram`
4. Languages UZ/RU/EN/ZH/KK and theme still work
5. Opening `/telegram/admin` without allowlist shows **Sizda admin ruxsati mavjud emas**

### Admin user (ID in `TELEGRAM_ADMIN_IDS`)

1. `/start` shows both:
   - 🚚 Saytni ochish
   - 🔐 Admin panel
2. Admin panel validates `initData` server-side, sets session cookie, redirects to `/admin`
3. Password login at `/admin/login` still works

### Security checks

- Webhook without `X-Telegram-Bot-Api-Secret-Token` → `401`
- Forged `initData` → `401`
- Non-admin valid `initData` → `403`
- Never trust `initDataUnsafe` alone
- Never authorize by Telegram username

## 8. If a token leaks

1. BotFather → `/revoke` (or regenerate token)
2. Update `TELEGRAM_BOT_TOKEN` on Vercel
3. Re-run `node scripts/setup-telegram-bot.mjs`
4. Redeploy

## Routes reference

| Path | Purpose |
|------|---------|
| `/telegram` | Public Mini App |
| `/telegram/admin` | Telegram → verify initData → `/admin` |
| `POST /api/auth/telegram` | Validate initData + set session |
| `POST /api/telegram/webhook` | `/start` keyboards |

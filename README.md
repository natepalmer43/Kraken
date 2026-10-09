# Release the Tickets 🐙

A small, fun web app for two friends splitting Seattle Kraken season tickets.
Draft the games, trade them, keep the split fair, and count down to the next
night at Climate Pledge.

## What it does

- **Home** – countdown to the next home game, who's going, a fairness meter,
  and a big *Release the Kraken* button (confetti, obviously).
- **Schedule** – every 2026-27 home game grouped by month with opponent
  badges, start times and a point value. Tap a game to claim it, mark it
  "both of us", sell it, add a note, or adjust its value.
- **Draft** – flip a coin for first pick, then snake-draft (A·B·B·A) the open
  games. Auto-pick, undo, live score, and a fairness readout at the end.
- **Ledger** – points per person, trade proposals with net swing, trade
  history, and achievements (Rivalry Hoarder, Weekend Warrior, Tuesday Hero…).
- **Settings** – names, emoji, colors, share link, backup/restore, manual
  games, and a refresh from the official NHL schedule API.

### How games are valued

Every game starts at 10 points. Rivalry games (VAN, EDM, CGY, VGK) add 6,
marquee opponents add 4, Saturdays add 4, Fridays 3, the home opener 8,
holidays and theme nights 2. You can add or subtract points on any game so
the two of you agree on what's fair.

## Sharing between the two of you

**Share link (no setup).** Settings → *Copy share link*. The whole board is
packed into the URL; your friend opens it and taps *Use shared board*.
Whoever changed something last sends the next link.

**Live sync (optional, free).** Create a Supabase project, run
`supabase/migration.sql` in its SQL editor, and put the project URL and
publishable key in `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Then both of you enter the same room code in Settings. Every change shows up
on both phones instantly.

## Schedule data

On load the app pulls the live Kraken home schedule from
`api-web.nhle.com` and re-keys your assignments by date and opponent so
nothing is lost. If that request fails it falls back to the list bundled in
`src/data/schedule.ts`, which was compiled from public listings and may have
a date or two off. Use *Refresh from NHL* in Settings whenever you're online.

## Run it

```
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

Deploy `dist/` anywhere static (Vercel, Netlify, Cloudflare Pages, GitHub
Pages). Add it to your phone's home screen and it feels like a native app.

Not affiliated with the Seattle Kraken or the NHL.

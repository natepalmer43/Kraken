# Release the Tickets 🐙

A small, fun web app for two friends splitting Seattle Kraken season tickets.
Decide who's going, keep the weekend games fair, see what each game is worth
on the resale market, and count down to the next night at Climate Pledge.

## What it does

- **Home** – countdown to the next home game, who's going, each person's
  weekend/weeknight count, a weekend-split meter, the games worth the most on
  the resale market right now, and a big *Release the Kraken* button
  (confetti, obviously).
- **Schedule** – every 2026-27 home game grouped by month with opponent
  badges, start times, a Weekend/Weeknight tag and the average resale price.
  Filter by unassigned, weekend, weeknight, selling, or person. Tap a game to
  claim it, mark it "both of us", mark it for sale, add a note, or edit the
  resale number.
- **Ledger** – games, weekend and weeknight counts per person, everything
  marked for sale (with what it sold for), swap history, and achievements
  (Weekend Warrior, Tuesday Hero, Rivalry Hoarder…).
- **Settings** – names, emoji, colors, share link, backup/restore, manual
  games, and refreshes for the NHL schedule and resale prices.

### Resale prices

Every game shows a per-ticket resale value so the two of you can decide
whether to sell. Two ways to fill it in:

1. **Automatic.** Get a free client ID at <https://platform.seatgeek.com>,
   put it in `.env` as `VITE_SEATGEEK_CLIENT_ID`, and the app pulls the live
   average, median, low and listing count for every home game from SeatGeek
   on load (and on *Refresh prices* in Settings).
2. **By hand.** Tap a game, hit *Edit*, and type the number you saw. Each
   game has one-tap links to SeatGeek, StubHub and Ticketmaster.

A number you type always wins over the live one. When you mark a game *Sell
it* you can record what the pair actually sold for, and the Ledger totals it.

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

Resale quotes are market data, not decisions, so they never overwrite the
other person's changes during a sync.

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

# Release the Tickets 🐙

A small, fun web app for two friends splitting Seattle Kraken season tickets.
Decide who's going, keep the weekend games fair, see what each game is worth
on the resale market, and count down to the next night at Climate Pledge.

## What it does

- **Home** – countdown to the next home game, who's going, each person's
  weekend/weeknight count, a weekend-split meter, the games worth the most on
  the resale market right now, and a big *Release the Kraken* button
  (confetti, obviously).
- **Schedule** – the games on your plan, grouped by month, with opponent
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

That's it. The room both phones share is baked into the app (`ROOM` in
`src/lib/supabase.ts`), so there is nothing to enter in Settings: open the
site and every change shows up on both phones instantly.

## Schedule data

The app ships with your 20-game plan (opening night plus the 19 in Ticketmaster)
(dates, opponents and start times), in `src/data/schedule.ts`. Edit that list
and bump `PLAN_VERSION` if the plan changes; saved boards migrate
automatically and keep who's going to what. Bought extra tickets for one
night? Add it from Settings. Sold the pair and want it gone? Remove it from
the game sheet.

*Verify times* in Settings checks your games against the NHL's public
schedule API and corrects any start time that moved. It never adds games.

## It's a website

Every push to `main` builds the app and publishes it to GitHub Pages at
<https://oleumextracts.github.io/Kraken/>. Open that on your phone, tap
*Share → Add to Home Screen*, and it behaves like an installed app.

To ship live resale prices or sync with the hosted build, add the keys from
`.env.example` as repository secrets (Settings → Secrets → Actions) with the
same names; the workflow passes them to the build.

## Run it locally

```
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

`dist/` is plain static files, so it also works on Vercel, Netlify or
Cloudflare Pages if you'd rather host it there.

Not affiliated with the Seattle Kraken or the NHL.

# AdoptLuck + Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase.sql`.
3. In Supabase Project Settings -> API, copy the project URL and the publishable/anon key.
4. Add these environment variables to the deployment:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

5. Rebuild/redeploy the Vite app.

## What is persisted

- verified Roblox profiles and balances
- player pet inventories
- waiting/active coinflip games
- wager/leaderboard totals
- pet value records can be migrated next if desired

The browser keeps a local cache so the UI can still open if Supabase is temporarily unavailable. Supabase is the shared persistence layer when configured.

> Security note: this project currently uses the public anon key with permissive table policies because Roblox verification is custom rather than Supabase Auth. Do not use this policy setup for real-money value. For a production economy, move balance/game mutations to trusted Supabase Edge Functions/RPCs and tighten RLS.

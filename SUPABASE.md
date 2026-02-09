# How to connect your project to Supabase

Use these steps to connect the Token Clicker app to Supabase (for PVP, users, leaderboards, etc.).

## 0. Create your first tables (if Table Editor is empty)

If you open **Table Editor** and see no tables, create them with SQL:

1. In Supabase dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Copy the contents of **`supabase/migrations/001_initial_tables.sql`** in this repo (or the SQL below) and paste into the editor.
4. Click **Run** (or Ctrl+Enter).

You’ll get two tables:

- **`leaderboard`** – for the Friends page (name, tokens, wallet, ref_code).
- **`rooms`** – for PVP (status, player1/player2, winner).

They will show up in **Table Editor** and already have RLS enabled with basic policies (public read; anon can insert/update). You can change policies later under **Authentication → Policies** or via SQL.

---

## 1. Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in (GitHub is fine).
2. Click **New project**.
3. Pick an organization (or create one), name the project (e.g. `nc-clicker-game-v1`), set a database password, and choose a region.
4. Click **Create new project** and wait for it to finish provisioning.

## 2. Get your project URL and anon key

1. In the Supabase dashboard, open your project.
2. Go to **Project Settings** (gear icon in the sidebar).
3. Click **API** in the left menu.
4. You’ll see:
   - **Project URL** — e.g. `https://abcdefghijk.supabase.co`
   - **Project API keys** — use the **anon public** key (long string starting with `eyJ...`).  
     This key is safe to use in the browser; use Row Level Security (RLS) in Supabase to protect data.

## 3. Add them to your project

1. Open **`supabase-config.js`** in the project root.
2. Set `url` and `anonKey`:

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

3. Save the file.

## 4. Use Supabase in the app

When both `url` and `anonKey` are set, the app creates a client as **`window.supabaseClient`**. You can use it anywhere in your scripts, e.g.:

```js
if (window.supabaseClient) {
  const { data, error } = await window.supabaseClient.from('rooms').select('*');
  // ...
}
```

For PVP you’ll add tables (e.g. `rooms`, `players`) and Realtime subscriptions; this connection is the first step.

## Optional: keep keys out of git

If you don’t want to commit real keys, copy the config and ignore the copy:

- Copy `supabase-config.js` to `supabase-config.local.js`.
- In `supabase-config.js`, leave `url` and `anonKey` as empty strings (or placeholder values for production).
- In `index.html`, load `supabase-config.local.js` **instead of** `supabase-config.js` when developing locally (or use a build step that injects the local file).
- Add `supabase-config.local.js` to **`.gitignore`** so it isn’t pushed.

For a public frontend, the anon key is designed to be public; protect data with Supabase RLS policies.

---

## Securing your Supabase project

The **anon key in the frontend is meant to be public**. Security comes from **Row Level Security (RLS)** and **never exposing the service_role key**.

### 1. Enable Row Level Security (RLS) on every table

Without RLS, anyone with your anon key could read or write all rows. With RLS, Supabase only allows what your policies permit.

1. In Supabase: **Table Editor** → select a table → **Settings** (or right-click table in SQL Editor).
2. Enable **Enable Row Level Security (RLS)**.
3. Add policies (see below). **If RLS is on and you have no policies, no one can read or write** (including your app), so add at least one policy per operation you need.

Do this for **every** table you create (e.g. `rooms`, `players`, `leaderboard`, `users`).

### 2. Add policies per table

In **SQL Editor** you can create policies. Examples:

**Leaderboard (public read, insert/update only for own row or via auth):**

```sql
-- Allow anyone to read leaderboard
CREATE POLICY "Leaderboard is public read"
ON public.leaderboard FOR SELECT
TO anon USING (true);

-- Allow insert (e.g. upsert by wallet or user id); tighten USING to match your auth
CREATE POLICY "Users can insert own row"
ON public.leaderboard FOR INSERT
TO anon WITH CHECK (true);  -- tighten: e.g. WITH CHECK (auth.uid() = user_id)

-- Allow update only for own row (if you identify by wallet address or user_id)
CREATE POLICY "Users can update own row"
ON public.leaderboard FOR UPDATE
TO anon USING (true);  -- tighten: e.g. USING (auth.uid() = user_id)
```

**Rooms (PVP) – example: anyone can read, only authenticated or constrained insert/update:**

```sql
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
ON public.rooms FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated or anon can create room"
ON public.rooms FOR INSERT TO anon WITH CHECK (true);  -- add WITH CHECK (auth.role() = 'authenticated') if you use Supabase Auth
```

Tighten `USING` and `WITH CHECK` once you have a clear idea of who “owns” a row (e.g. `auth.uid()`, wallet address in a column).

### 3. Never use the service_role key in the frontend

- **Project Settings → API** shows two keys: **anon (public)** and **service_role (secret)**.
- Use **anon** in the browser (`supabase-config.js`).
- Use **service_role** only on a **backend server** (e.g. your Node backend) for admin or bypassing RLS. If it’s ever in the repo or in the browser, rotate it immediately in the dashboard and revoke the leaked key.

### 4. Optional: keep the anon key out of git

If the repo is public and you prefer not to commit the anon key:

- Put real values in **`supabase-config.local.js`** and add **`supabase-config.local.js`** to **`.gitignore`**.
- In **`supabase-config.js`** (committed), leave `url` and `anonKey` empty.
- For **production** (e.g. GitHub Pages), either use a build step that injects env vars, or use a separate private repo / deployment config. Security still depends on RLS; hiding the anon key only reduces abuse of your project URL and rate limits.

### Summary

| What | Action |
|------|--------|
| **Anon key in frontend** | OK; it’s designed to be public. |
| **Service role key** | Never in frontend or public repo; backend only. |
| **Data access** | Enable RLS on every table and add policies that limit SELECT/INSERT/UPDATE/DELETE. |
| **Policies** | Start permissive (e.g. `USING (true)`) to get the app working, then tighten to `auth.uid()`, wallet, or other identity. |

# Supabase (one-time) — ratings, chat, query logs

Kairos stores **thumbs ratings**, **chat history**, and **agent query logs** in Supabase. Without `SUPABASE_URL` + `SUPABASE_ANON_KEY` on your **Railway backend**, ratings only live in memory (lost on restart) and the **Agents** page will show **“No ratings yet”** because `/providers` reads aggregates from the database.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project → choose a region and password.
2. Wait until the project is **healthy**.

## 2. Run the SQL schema (one file)

1. In Supabase: **SQL Editor** → **New query**.
2. Open this repo file **`kairos-backend/db/schema.sql`** and paste **the entire contents** into the editor.
3. Click **Run**.

You should see success for `CREATE TABLE` / `policy` statements. If a policy already exists from a previous run, delete duplicate `CREATE POLICY` lines or drop policies first — for a **fresh** project, the file is fine as-is.

### Optional: ensure rating upserts work

If `message_ratings` was created manually without `UNIQUE (message_id, user_address)`, run:

```sql
ALTER TABLE message_ratings
  ADD CONSTRAINT message_ratings_message_user_key UNIQUE (message_id, user_address);
```

(If the constraint already exists, skip this.)

## 3. Get API URL + anon key

1. Supabase **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`  
   (Use the **anon** key on the backend only — never the `service_role` key in client code.)

## 4. Railway (backend) environment variables

In your Railway service → **Variables**, add:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` (anon public) |

Redeploy the backend. Logs should show:

`[Supabase] Client initialized`

## 5. Frontend

No Supabase keys in the browser are required — the UI talks to your **Railway API**, which talks to Supabase.

Ensure:

```env
VITE_API_URL=https://your-backend.up.railway.app
```

## 6. Verify

- `GET https://<railway>/health` → `llmEnabled` / chain config as expected.
- Rate a chat message → toast **“Thanks — rating saved”** (not “server memory only”).
- Refresh **Agents** → star rating / count should update after a few seconds (cache may be minimal).

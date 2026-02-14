# ConfessBox Supabase

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `migrations/00001_initial_schema.sql`.
3. (Optional) To auto-create a profile row when a user signs up, run in the SQL Editor:
   ```sql
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```
   If you skip this, the Express API server will create the profile on first register.

## Env (for Express server)

- `SUPABASE_URL`: Project URL (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (Settings → API; keep secret)

-- sign_in_dates: array of all sign-in timestamps (first entry = sign-up date for new users)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS sign_in_dates TIMESTAMPTZ[] DEFAULT '{}' NOT NULL;

-- Always store email in lowercase
CREATE OR REPLACE FUNCTION public.lowercase_user_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_lowercase_email ON public.users;
CREATE TRIGGER users_lowercase_email
  BEFORE INSERT OR UPDATE OF email ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.lowercase_user_email();

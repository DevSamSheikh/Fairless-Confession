# Supabase URL config & reset email

## Fix "This site can't be reached" after clicking reset link

The reset link in the email sends you to **Site URL** (e.g. `http://localhost:3000`). If nothing is running on that port, the browser shows "This site can't be reached".

**Do this:**

1. In **Supabase Dashboard** → **Authentication** → **URL Configuration**:
   - **Site URL:** set to where your app actually runs:
     - **Expo web (browser):** `http://localhost:8081` (Metro default)
     - **Custom port:** e.g. `http://localhost:5000` if you use a different one
   - **Redirect URLs:** add the same URL, e.g. `http://localhost:8081` (and `http://localhost:8081/**` if Supabase allows a wildcard). This must be in the allow list or the redirect after reset will be blocked.  
2. Click **Save changes**.

So: **yes, change port 3000 to 8081** if your app (Expo web) runs on 8081. After saving, request a new reset email and use the new link.

When the user clicks the reset link, they are sent to the **Site URL** with the token in the hash (e.g. `#access_token=...`). The app detects this and opens the **Reset Your Password** screen so they can set a new password, then sign in from the Login screen.

---

## Reset password email template (dark theme)

In **Supabase** → **Authentication** → **Email Templates** → **Reset Password**, set **Message body** to the HTML below so the email matches your app (dark background, purple CTA).

Use **Subject** e.g.: `Reset your ConfessBox password`

**Message body (HTML):**

See the file `supabase/email-templates/reset-password.html` in this repo — copy its contents into the Supabase template.

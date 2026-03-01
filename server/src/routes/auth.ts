import { Router } from 'express';
import { supabase } from '../db/client.js';
import { getClientInfo } from '../lib/tracking.js';

const router = Router();

function generateIdentityId() {
  return `#Confess_${Math.floor(1000 + Math.random() * 9000)}`;
}
function generateAvatarSeed() {
  return crypto.randomUUID();
}
function generateUserIdCustom() {
  return `2004-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

// Normalize email so login and signup always match (Supabase Auth is case-sensitive).
function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, rulesAccepted } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    if (rulesAccepted !== true) return res.status(400).json({ error: 'Rules & Privacy policy must be accepted' });

    const emailNorm = normalizeEmail(email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailNorm,
      password,
      options: {
        data: { full_name: fullName ?? '' },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      if (authError.message?.includes('already registered')) return res.status(400).json({ error: 'Email exists' });
      const msg = (authError.message ?? '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        return res.status(429).json({ error: 'Too many sign-up attempts. Please wait a few minutes and try again.' });
      }
      return res.status(400).json({ error: authError.message ?? 'Sign up failed' });
    }

    const userId = authData.user?.id;
    if (!userId) return res.status(500).json({ error: 'User not created' });

    const { data: existingProfile } = await supabase.from('users').select('id').eq('id', userId).single();
    const identityId = generateIdentityId();
    const avatarSeed = generateAvatarSeed();
    const userIdCustom = generateUserIdCustom();

    const nowIso = new Date().toISOString();
    if (!existingProfile) {
      const { error: insertErr } = await supabase.from('users').insert({
        id: userId,
        email: emailNorm,
        full_name: fullName ?? null,
        identity_id: identityId,
        avatar_seed: avatarSeed,
        user_id_custom: userIdCustom,
        sign_in_dates: [nowIso]
      });
      if (insertErr) return res.status(500).json({ error: insertErr.message ?? 'Profile creation failed' });
    }

    const info = getClientInfo(req, req.body);
    try {
      await supabase.from('tracking_logs').insert({
        user_id: userId,
        event_type: 'register',
        ip_address: info.ip_address,
        mac_address: info.mac_address,
        mobile_sim_number: info.mobile_sim_number,
        device_info: info.device_info
      });
    } catch (_) { /* non-fatal */ }

    const { data: profile } = await supabase.from('users').select('id, identity_id, avatar_seed, email, user_id_custom').eq('id', userId).single();
    const user = { 
      id: userId, 
      identityId: profile?.identity_id ?? identityId, 
      avatarSeed: profile?.avatar_seed ?? avatarSeed, 
      email: emailNorm, 
      userIdCustom: profile?.user_id_custom ?? userIdCustom,
      emailVerified: authData.user?.email_confirmed_at != null
    };
    
    // Always try to sign in after registration to get a token
    let token = authData.session?.access_token;
    if (!token) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: emailNorm, password });
      if (signInErr) {
        console.error('Auto sign-in after registration failed:', signInErr);
        return res.status(500).json({ error: 'Account created but auto sign-in failed. Please try signing in manually.' });
      }
      if (!signInData?.session) {
        return res.status(500).json({ error: 'Account created but session not established. Please try signing in manually.' });
      }
      token = signInData.session.access_token;
    }
    
    if (!token) {
      return res.status(500).json({ error: 'Failed to establish session after registration. Please try signing in manually.' });
    }
    
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNorm = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailNorm, password });

    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        return res.status(401).json({ error: 'Please confirm your email first. Check your inbox for the verification link.' });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!data.session) return res.status(401).json({ error: 'No session' });

    const userId = data.user.id;
    const info = getClientInfo(req, req.body);
    await supabase.from('tracking_logs').insert({
      user_id: userId,
      event_type: 'login',
      ip_address: info.ip_address,
      mac_address: info.mac_address,
      mobile_sim_number: info.mobile_sim_number,
      device_info: info.device_info
    });

    const { data: signInRow } = await supabase.from('users').select('sign_in_dates').eq('id', userId).single();
    const nextSignInDates = [...(signInRow?.sign_in_dates ?? []), new Date().toISOString()];
    await supabase.from('users').update({ sign_in_dates: nextSignInDates }).eq('id', userId);

    const { data: profile } = await supabase.from('users').select('id, identity_id, avatar_seed, user_id_custom, email').eq('id', userId).single();

    res.json({
      token: data.session.access_token,
      user: { 
        id: data.user.id, 
        email: profile?.email ?? data.user.email ?? emailNorm, 
        identityId: profile?.identity_id, 
        avatarSeed: profile?.avatar_seed, 
        userIdCustom: profile?.user_id_custom,
        emailVerified: data.user.email_confirmed_at != null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forget-password – send magic link; user clicks link → Supabase set-password page → then login
router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const emailNorm = normalizeEmail(email);

    const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
      redirectTo: req.body.redirectTo ?? undefined
    });

    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        return res.status(429).json({ error: 'Too many reset emails. Please wait a few minutes and try again.' });
      }
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Reset link sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// “” // POST /api/auth/logout (optional; client should discard token; this can revoke server-side if needed later)
// POST /api/auth/set-new-password – token from magic link redirect (#access_token=...)
router.post('/set-new-password', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Token, new password and confirm password required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(resetToken);
    if (userError || !user?.id) {
      return res.status(401).json({ error: 'Invalid or expired link. Request a new reset link from the app.' });
    }

    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateErr) return res.status(400).json({ error: updateErr.message ?? 'Failed to update password' });

    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;


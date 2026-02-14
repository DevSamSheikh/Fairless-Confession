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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, rulesAccepted } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    if (rulesAccepted !== true) return res.status(400).json({ error: 'Rules & Privacy policy must be accepted' });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName ?? '' },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      if (authError.message?.includes('already registered')) return res.status(400).json({ error: 'Email exists' });
      return res.status(400).json({ error: authError.message ?? 'Sign up failed' });
    }

    const userId = authData.user?.id;
    if (!userId) return res.status(500).json({ error: 'User not created' });

    const { data: existingProfile } = await supabase.from('users').select('id').eq('id', userId).single();
    const identityId = generateIdentityId();
    const avatarSeed = generateAvatarSeed();
    const userIdCustom = generateUserIdCustom();

    if (!existingProfile) {
      await supabase.from('users').insert({
        id: userId,
        email,
        full_name: fullName ?? null,
        identity_id: identityId,
        avatar_seed: avatarSeed,
        user_id_custom: userIdCustom
      });
    }

    const info = getClientInfo(req, req.body);
    await supabase.from('tracking_logs').insert({
      user_id: userId,
      event_type: 'register',
      ip_address: info.ip_address,
      mac_address: info.mac_address,
      mobile_sim_number: info.mobile_sim_number,
      device_info: info.device_info
    });

    const { data: profile } = await supabase.from('users').select('id, identity_id, avatar_seed, email, user_id_custom').eq('id', userId).single();
    const user = { id: userId, identityId: profile?.identity_id ?? identityId, avatarSeed: profile?.avatar_seed ?? avatarSeed, email, userIdCustom: profile?.user_id_custom ?? userIdCustom };
    const token = authData.session?.access_token;
    res.status(201).json(token ? { token, user } : { user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: 'Invalid credentials' });
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

    const { data: profile } = await supabase.from('users').select('id, identity_id, avatar_seed, user_id_custom').eq('id', userId).single();

    res.json({
      token: data.session.access_token,
      user: { id: data.user.id, identityId: profile?.identity_id, avatarSeed: profile?.avatar_seed, userIdCustom: profile?.user_id_custom }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forget-password
router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: req.body.redirectTo ?? undefined
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout (optional; client should discard token; this can revoke server-side if needed later)
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;

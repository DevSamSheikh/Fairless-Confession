/**
 * Seed Supabase with dummy data from the app frontend mock.
 * Run: npx tsx server/scripts/seed.ts
 * Requires: .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * Run migrations (00001 + 00002) in Supabase SQL Editor first.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const SEED_EMAIL = 'seed@confessbox.demo';
const SEED_PASSWORD = 'SeedPass123!';

function generateUserIdCustom() {
  return `2004-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

async function main() {
  console.log('Connecting to Supabase...');

  // 1) Create seed user in Auth (so we have a valid user_id for FKs)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Seed User' }
  });

  let userId: string;
  if (authError) {
    if (authError.message?.includes('already been registered')) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const u = existing?.users?.find((x) => x.email === SEED_EMAIL);
      if (!u) {
        console.error('User exists but could not fetch:', authError.message);
        process.exit(1);
      }
      userId = u.id;
      console.log('Using existing seed user:', userId);
    } else {
      console.error('Auth create user failed:', authError.message);
      process.exit(1);
    }
  } else {
    userId = authUser.user.id;
    console.log('Created seed user:', userId);
  }

  // 2) Ensure profile in public.users
  const { data: existingProfile } = await supabase.from('users').select('id').eq('id', userId).single();
  if (!existingProfile) {
    const identityId = `#Confess_${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarSeed = crypto.randomUUID();
    const userIdCustom = generateUserIdCustom();
    await supabase.from('users').insert({
      id: userId,
      email: SEED_EMAIL,
      full_name: 'Seed User',
      identity_id: identityId,
      avatar_seed: avatarSeed,
      user_id_custom: userIdCustom
    });
    console.log('Created profile (2004-* id):', userIdCustom);
  }

  // 3) Societies (from TrendingScreen MOCK_SOCIETIES)
  const societiesData = [
    { name: 'Midnight Society', description: 'Confessions for the night owls.', icon_name: 'moon', member_count: 1240 },
    { name: 'College Life Society', description: 'Campus secrets and exam stress.', icon_name: 'school', member_count: 8500 },
    { name: 'Workplace Society', description: 'Office drama and boss rants.', icon_name: 'briefcase', member_count: 3200 },
    { name: 'Broken Hearts Society', description: 'Anonymously heal together.', icon_name: 'heart-discontinuous', member_count: 5600 },
    { name: 'Gamer Society', description: 'Lobby rants and game secrets.', icon_name: 'game-controller', member_count: 2100 }
  ];

  const societyIds: string[] = [];
  for (const s of societiesData) {
    const { data: inserted, error } = await supabase
      .from('societies')
      .insert({
        name: s.name,
        description: s.description,
        icon_name: s.icon_name,
        member_count: s.member_count,
        creator_id: userId,
        is_private: false
      })
      .select('id')
      .single();
    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase.from('societies').select('id').eq('name', s.name).single();
        if (existing) societyIds.push(existing.id);
      }
    } else if (inserted) {
      societyIds.push(inserted.id);
    }
  }
  if (societyIds.length === 0) {
    const { data: list } = await supabase.from('societies').select('id').limit(5);
    list?.forEach((r) => societyIds.push(r.id));
  }
  console.log('Societies:', societyIds.length);

  // Map society name -> id for posts
  const { data: allSocieties } = await supabase.from('societies').select('id, name');
  const nameToId: Record<string, string> = {};
  allSocieties?.forEach((r) => { nameToId[r.name] = r.id; });

  // 4) Posts (from feed.store dummyPosts) - map emoji reactions to our enum
  const postsData = [
    { title: 'Group project nightmare', content: "I secretly hate group projects but always end up doing all the work anyway. It's so frustrating when people just slack off.", category: 'College' as const, societyName: 'Midnight Society', reactions: { Like: 234, Supportive: 45, Thought: 12, Anger: 89, Funny: 156 }, commentCount: 67 },
    { title: 'Beach work life', content: "My boss thinks I work from home but I actually work from the beach most days. The view is amazing and I'm more productive here.", category: 'Work' as const, societyName: null, reactions: { Like: 567, Supportive: 123, Thought: 8, Anger: 34, Funny: 445 }, commentCount: 89 },
    { title: 'Secret crush', content: "Still in love with someone who doesn't even know I exist. I see them every day and my heart just melts.", category: 'Love' as const, societyName: null, reactions: { Like: 890, Supportive: 23, Thought: 456, Anger: 12, Funny: 34 }, commentCount: 234 },
    { title: 'Testing the waters', content: "I started a rumor about myself just to see who would believe it. It turned out to be quite revealing about my friends.", category: 'Drama' as const, societyName: null, reactions: { Like: 123, Supportive: 567, Thought: 23, Anger: 45, Funny: 678 }, commentCount: 156 },
    { title: 'Uncontrollable laughter', content: "Sometimes I laugh at completely inappropriate moments and can't stop. It's a problem, especially during serious meetings.", category: 'Funny' as const, societyName: null, reactions: { Like: 345, Supportive: 67, Thought: 12, Anger: 8, Funny: 890 }, commentCount: 78 }
  ];

  const commentTexts = ['This is so relatable!', 'Stay strong, things will get better.', 'Same here!', 'Thanks for sharing.'];

  for (const p of postsData) {
    const societyId = p.societyName ? nameToId[p.societyName] ?? null : null;
    const { data: post, error: postErr } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        society_id: societyId,
        title: p.title,
        content: p.content,
        category: p.category,
        reactions_summary: p.reactions,
        comment_count: p.commentCount,
        view_count: Math.floor(Math.random() * 500),
        is_trending: p.commentCount + Object.values(p.reactions).reduce((a, b) => a + b, 0) > 400,
        visibility: 'public'
      })
      .select('id')
      .single();

    if (postErr) {
      console.warn('Post insert skip:', p.title, postErr.message);
      continue;
    }
    if (post && p.commentCount > 0) {
      for (let i = 0; i < Math.min(2, commentTexts.length); i++) {
        await supabase.from('comments').insert({
          post_id: post.id,
          user_id: userId,
          content: commentTexts[i]
        });
      }
    }
  }

  // Add seed user as member of first two societies so /societies/confessions has data
  for (const sid of [societyIds[0], societyIds[2]].filter(Boolean)) {
    await supabase.from('society_members').insert({ user_id: userId, society_id: sid, role: 'Member' }).then(() => {}).catch(() => {});
  }

  console.log('Seed done. You can log in with:', SEED_EMAIL, '/', SEED_PASSWORD);
  console.log('Check Supabase Dashboard -> Table Editor to see data.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

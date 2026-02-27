import 'dotenv/config';
import { supabase } from '../src/db/client.js';

async function fixReactionsConstraint() {
  console.log('Fixing reactions table unique constraint...');
  
  // Step 1: Drop old constraint
  const dropConstraint = `
    ALTER TABLE public.reactions 
    DROP CONSTRAINT IF EXISTS reactions_post_id_user_id_reaction_type_key;
  `;
  
  const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropConstraint }).single();
  
  if (dropError) {
    console.log('Note: Could not drop old constraint (may not exist):', dropError.message);
  } else {
    console.log('✓ Dropped old constraint');
  }
  
  // Step 2: Clean up duplicate reactions (keep only the most recent one per user+post)
  const cleanupDuplicates = `
    DELETE FROM public.reactions r1
    USING public.reactions r2
    WHERE r1.post_id = r2.post_id 
      AND r1.user_id = r2.user_id
      AND r1.created_at < r2.created_at;
  `;
  
  const { error: cleanupError } = await supabase.rpc('exec_sql', { sql: cleanupDuplicates }).single();
  
  if (cleanupError) {
    console.error('Error cleaning duplicates:', cleanupError);
  } else {
    console.log('✓ Cleaned up duplicate reactions');
  }
  
  // Step 3: Add new constraint
  const addConstraint = `
    ALTER TABLE public.reactions 
    ADD CONSTRAINT reactions_post_id_user_id_key UNIQUE(post_id, user_id);
  `;
  
  const { error: addError } = await supabase.rpc('exec_sql', { sql: addConstraint }).single();
  
  if (addError) {
    console.error('Error adding new constraint:', addError);
  } else {
    console.log('✓ Added new unique constraint (post_id, user_id)');
  }
  
  console.log('\nDone! Reactions table now enforces one reaction per user per post.');
}

fixReactionsConstraint().catch(console.error);

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAllStreakUpdatedAt() {
  try {
    // Define the target timestamp
    const newUpdatedAt = new Date(Date.UTC(2025, 9, 9, 0, 0, 0)); // October 10th 2025 12:00 AM UTC

    // Update all streaks' updated_at field
    const { data, error } = await supabase
  .from('streak')
  .update({ updated_at: newUpdatedAt.toISOString(),count:0 })
  .is('updated_at', 'not_null');

// dummy condition to ensure a WHERE clause is present; id ≠ 0 matches all rows

    if (error) throw error;

    console.log(`Updated streaks with updated_at = ${newUpdatedAt.toISOString()}`);
  } catch (error) {
    console.error('Error updating streaks:', error);
  }
}

updateAllStreakUpdatedAt();

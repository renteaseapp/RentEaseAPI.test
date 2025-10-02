import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function removeUniqueConstraint() {
  console.log('Removing UNIQUE constraint from reviews.rental_id...\n');
  
  try {
    // ลบ UNIQUE constraint จาก rental_id
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rental_id_key;'
    });
    
    if (error) {
      console.log('❌ Error removing constraint:', error);
      
      // ลองใช้วิธีอื่น - ใช้ SQL โดยตรง
      console.log('Trying alternative method...');
      const { data: altData, error: altError } = await supabase
        .from('reviews')
        .select('rental_id, count(*)')
        .group('rental_id')
        .having('count(*) > 1');
        
      if (altError) {
        console.log('Cannot check for duplicates:', altError);
      } else {
        console.log('Current duplicate rental_ids:', altData);
      }
      
    } else {
      console.log('✓ UNIQUE constraint removed successfully!');
      console.log('Now you can create multiple reviews for the same rental_id');
    }
    
  } catch (error) {
    console.error('❌ Database operation error:', error);
    console.log('\n📝 Manual SQL to run in Supabase dashboard:');
    console.log('ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rental_id_key;');
  }
}

removeUniqueConstraint();
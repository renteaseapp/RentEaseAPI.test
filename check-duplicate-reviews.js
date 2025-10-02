import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkDuplicateReviews() {
  console.log('Checking for duplicate reviews...\n');
  
  try {
    // ตรวจสอบรีวิวทั้งหมดสำหรับ rental_id 75
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rental_id,
        rating_product,
        rating_owner,
        comment,
        created_at
      `)
      .eq('rental_id', 75)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.log('❌ Error fetching reviews:', error);
      return;
    }
    
    console.log(`Found ${reviews.length} reviews for rental_id 75:`);
    reviews.forEach((review, index) => {
      console.log(`${index + 1}. Review ID: ${review.id}`);
      console.log(`   Created: ${review.created_at}`);
      console.log(`   Rating Product: ${review.rating_product}, Rating Owner: ${review.rating_owner}`);
      console.log(`   Comment: "${review.comment}"`);
      console.log('');
    });
    
    if (reviews.length > 1) {
      console.log('✅ Success! Multiple reviews for the same rental are now allowed!');
    } else {
      console.log('ℹ️  Only one review found. Try running the test again to create more.');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

checkDuplicateReviews();
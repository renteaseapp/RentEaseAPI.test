import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkExistingReviews() {
  console.log('Checking existing reviews...\n');
  
  try {
    // ตรวจสอบรีวิวทั้งหมดในระบบ
    console.log('1. All reviews in the system:');
    const { data: allReviews, error: allError } = await supabase
      .from('reviews')
      .select(`
        id, 
        rental_id, 
        rating_product, 
        rating_owner, 
        comment,
        created_at,
        rentals!inner(
          id,
          renter_id,
          owner_id,
          product_id,
          rental_status
        )
      `)
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.log('❌ Error fetching reviews:', allError);
    } else {
      console.log(`Found ${allReviews.length} reviews:`);
      allReviews.forEach(review => {
        console.log(`- Review ID: ${review.id}, Rental: ${review.rental_id}, Renter: ${review.rentals.renter_id}, Product Rating: ${review.rating_product}, Owner Rating: ${review.rating_owner}`);
        console.log(`  Comment: "${review.comment}"`);
        console.log(`  Created: ${review.created_at}`);
        console.log('');
      });
    }
    
    // ตรวจสอบรีวิวสำหรับ rental_id 61 โดยเฉพาะ
    console.log('\n2. Reviews for rental_id 61:');
    const { data: rental61Reviews, error: rental61Error } = await supabase
      .from('reviews')
      .select('*')
      .eq('rental_id', 61);
    
    if (rental61Error) {
      console.log('❌ Error fetching rental 61 reviews:', rental61Error);
    } else {
      console.log(`Found ${rental61Reviews.length} reviews for rental 61:`);
      rental61Reviews.forEach(review => {
        console.log(`- Review ID: ${review.id}, Created: ${review.created_at}`);
      });
    }
    
    // ตรวจสอบ rentals ที่ user 39 สามารถรีวิวได้ (completed และยังไม่มีรีวิว)
    console.log('\n3. Completed rentals by user 39 that can be reviewed:');
    const { data: availableRentals, error: availableError } = await supabase
      .from('rentals')
      .select(`
        id,
        rental_status,
        renter_id,
        owner_id,
        product_id,
        reviews!left(id)
      `)
      .eq('renter_id', 39)
      .eq('rental_status', 'completed');
    
    if (availableError) {
      console.log('❌ Error fetching available rentals:', availableError);
    } else {
      console.log(`Found ${availableRentals.length} completed rentals by user 39:`);
      availableRentals.forEach(rental => {
        const hasReview = rental.reviews && rental.reviews.length > 0;
        console.log(`- Rental ID: ${rental.id}, Owner: ${rental.owner_id}, Product: ${rental.product_id}, Has Review: ${hasReview ? 'Yes' : 'No'}`);
      });
      
      const reviewableRentals = availableRentals.filter(rental => !rental.reviews || rental.reviews.length === 0);
      console.log(`\nRentals that can be reviewed: ${reviewableRentals.length}`);
      reviewableRentals.forEach(rental => {
        console.log(`- Rental ID: ${rental.id} (can be reviewed)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

checkExistingReviews();
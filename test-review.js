import supabase from './db/supabaseClient.js';

console.log('Testing review system...');

async function testReviewSystem() {
  try {
    // Test 1: Check database connection
    console.log('\n1. Testing database connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (connectionError) {
      console.error('Database connection error:', connectionError);
      return;
    }
    console.log('✓ Database connection successful');

    // ตรวจสอบข้อมูลในตาราง rentals
    console.log('\n2. ตรวจสอบข้อมูลในตาราง rentals...');
    const { data: rentals, error: rentalsError } = await supabase
      .from('rentals')
      .select('id, rental_uid, renter_id, product_id, owner_id, rental_status')
      .limit(5);
    
    if (rentalsError) {
      console.error('Error fetching rentals:', rentalsError);
      return;
    }
    
    console.log(`✓ Found ${rentals.length} rentals`);
    if (rentals.length > 0) {
      console.log('Sample rental:', rentals[0]);
    }

    // ตรวจสอบข้อมูลในตาราง reviews
    console.log('\n3. ตรวจสอบข้อมูลในตาราง reviews...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5);
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return;
    }
    
    console.log('Successfully connected to Supabase');
    console.log(`✓ Found ${reviews.length} existing reviews`);

    // ทดสอบการ insert review ด้วยข้อมูลจริงจากตาราง rentals
    if (rentals && rentals.length > 0) {
      console.log('\n4. ทดสอบการ insert review ด้วยข้อมูลจริง...');
      const testRental = rentals[0];
      
      const testReviewData = {
        rental_id: testRental.id,
        renter_id: testRental.renter_id,
        product_id: testRental.product_id,
        owner_id: testRental.owner_id,
        rating_product: 5,
        rating_owner: 4,
        comment: 'Test review from test script'
      };
      
      console.log('Attempting to insert review with data:', testReviewData);
      
      const { data: insertedReview, error: insertError } = await supabase
        .from('reviews')
        .insert(testReviewData)
        .select();
      
      if (insertError) {
        console.log('Review insertion error:', insertError);
        console.log('Error details:', insertError.details);
        console.log('Error hint:', insertError.hint);
      } else {
        console.log('✓ Review inserted successfully:', insertedReview);
        
        // ลบ test review ที่เพิ่งสร้าง
        console.log('\n5. ลบ test review...');
        const { error: deleteError } = await supabase
          .from('reviews')
          .delete()
          .eq('id', insertedReview[0].id);
        
        if (deleteError) {
          console.log('Error deleting test review:', deleteError);
        } else {
          console.log('✓ Test review deleted successfully');
        }
      }
    } else {
      console.log('No rentals found to test with');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testReviewSystem();
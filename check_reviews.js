import supabase from './db/supabaseClient.js';

async function checkReviews() {
  console.log('=== ตรวจสอบข้อมูล Reviews ===');
  
  // ดู reviews ทั้งหมด
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, rental_id, rating_product, rating_owner, comment, created_at')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('จำนวน reviews ทั้งหมด:', reviews?.length || 0);
  
  if (reviews && reviews.length > 0) {
    console.log('\nReviews ที่มีอยู่:');
    reviews.forEach(review => {
      console.log(`- Review ID: ${review.id}, Rental ID: ${review.rental_id}, Rating Product: ${review.rating_product}, Rating Owner: ${review.rating_owner}`);
    });
  } else {
    console.log('ไม่มี reviews ในฐานข้อมูล');
  }
  
  // ตรวจสอบ rental_id = 93 โดยเฉพาะ
  console.log('\n=== ตรวจสอบ rental_id = 93 ===');
  const { data: review93, error: error93 } = await supabase
    .from('reviews')
    .select('*')
    .eq('rental_id', 93)
    .single();
    
  if (error93) {
    if (error93.code === 'PGRST116') {
      console.log('ไม่พบ review สำหรับ rental_id = 93');
    } else {
      console.error('Error checking rental_id 93:', error93);
    }
  } else {
    console.log('พบ review สำหรับ rental_id = 93:', review93);
  }
  
  // ตรวจสอบว่ามี rental_id = 93 ในตาราง rentals หรือไม่
  console.log('\n=== ตรวจสอบ rental_id = 93 ในตาราง rentals ===');
  const { data: rental93, error: rentalError } = await supabase
    .from('rentals')
    .select('id, rental_status, renter_id, owner_id, product_id')
    .eq('id', 93)
    .single();
    
  if (rentalError) {
    if (rentalError.code === 'PGRST116') {
      console.log('ไม่พบ rental ที่มี id = 93');
    } else {
      console.error('Error checking rental 93:', rentalError);
    }
  } else {
    console.log('พบ rental id = 93:', rental93);
  }
  
  process.exit(0);
}

checkReviews().catch(console.error);
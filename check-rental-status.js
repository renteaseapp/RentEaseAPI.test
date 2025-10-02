import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY  // เปลี่ยนจาก SUPABASE_ANON_KEY เป็น SUPABASE_KEY
);

async function checkRentalStatus() {
  console.log('Checking rental status...\n');
  
  try {
    // ตรวจสอบสถานะของ rental_id: 63
    console.log('1. Checking status of rental_id: 63');
    const { data: rental63, error: error63 } = await supabase
      .from('rentals')
      .select('id, rental_status, renter_id, owner_id, product_id')
      .eq('id', 63)
      .single();
    
    if (error63) {
      console.log('❌ Error fetching rental 63:', error63);
    } else {
      console.log('Rental 63 details:', rental63);
    }
    
    // หา rentals ที่มีสถานะ 'completed'
    console.log('\n2. Finding completed rentals...');
    const { data: completedRentals, error: completedError } = await supabase
      .from('rentals')
      .select('id, rental_status, renter_id, owner_id, product_id, created_at')
      .eq('rental_status', 'completed')
      .limit(5);
    
    if (completedError) {
      console.log('❌ Error fetching completed rentals:', completedError);
    } else {
      console.log(`Found ${completedRentals.length} completed rentals:`);
      completedRentals.forEach(rental => {
        console.log(`- Rental ID: ${rental.id}, Renter: ${rental.renter_id}, Owner: ${rental.owner_id}, Product: ${rental.product_id}`);
      });
    }
    
    // หา rentals ทั้งหมดและแสดงสถานะ
    console.log('\n3. All rental statuses:');
    const { data: allRentals, error: allError } = await supabase
      .from('rentals')
      .select('id, rental_status, renter_id')
      .order('id', { ascending: true });
    
    if (allError) {
      console.log('❌ Error fetching all rentals:', allError);
    } else {
      const statusCount = {};
      allRentals.forEach(rental => {
        statusCount[rental.rental_status] = (statusCount[rental.rental_status] || 0) + 1;
      });
      
      console.log('Status distribution:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`- ${status}: ${count} rentals`);
      });
      
      console.log('\nFirst 10 rentals:');
      allRentals.slice(0, 10).forEach(rental => {
        console.log(`- ID: ${rental.id}, Status: ${rental.rental_status}, Renter: ${rental.renter_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

checkRentalStatus();
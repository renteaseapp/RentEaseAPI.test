import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createTestRental() {
  console.log('Creating test rental for review testing...\n');
  
  try {
    // ข้อมูลสำหรับสร้าง rental ทดสอบ (ใช้ชื่อ column ที่ถูกต้องตาม schema)
    const testRentalData = {
      renter_id: 39,  // user ที่เราใช้ทดสอบ
      owner_id: 33,   // owner จากข้อมูลเดิม
      product_id: 56, // product จากข้อมูลเดิม
      rental_status: 'completed',
      start_date: '2025-09-01',
      end_date: '2025-09-05',
      rental_price_per_day_at_booking: 100.00,
      security_deposit_at_booking: 50.00,
      calculated_subtotal_rental_fee: 400.00,
      delivery_fee: 0.00,
      platform_fee_renter: 40.00,
      platform_fee_owner: 36.00,
      total_amount_due: 490.00,
      final_amount_paid: 490.00,
      pickup_method: 'self_pickup',
      return_method: 'self_return',
      payment_status: 'paid',
      return_condition_status: 'as_rented',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('1. Creating test rental...');
    console.log('Test rental data:', JSON.stringify(testRentalData, null, 2));
    
    const { data: newRental, error: rentalError } = await supabase
      .from('rentals')
      .insert([testRentalData])
      .select()
      .single();
    
    if (rentalError) {
      console.log('❌ Error creating test rental:', rentalError);
      return null;
    }
    
    console.log('✓ Test rental created successfully!');
    console.log('New rental ID:', newRental.id);
    console.log('Rental details:', JSON.stringify(newRental, null, 2));
    
    return newRental.id;
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return null;
  }
}

async function main() {
  const rentalId = await createTestRental();
  
  if (rentalId) {
    console.log(`\n🎉 Success! You can now test reviews with rental_id: ${rentalId}`);
    console.log(`Update your test-api.js file to use rental_id: ${rentalId}`);
  }
}

main();
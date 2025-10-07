import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createLateRental() {
  console.log('Creating test rental with late return for testing...\n');
  
  try {
    // สร้างวันที่เกินกำหนดคืน (เมื่อ 3 วันที่แล้ว)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 10); // เริ่มเช่า 10 วันที่แล้ว
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 3); // ควรคืนเมื่อ 3 วันที่แล้ว (เกินกำหนดแล้ว)
    
    const testRentalData = {
      renter_id: 39,  // user ที่เราใช้ทดสอบ
      owner_id: 33,   // owner จากข้อมูลเดิม
      product_id: 56, // product จากข้อมูลเดิม
      rental_status: 'active', // ยังคงเป็น active เพื่อให้ scheduler อัปเดตเป็น late_return
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      rental_price_per_day_at_booking: 100.00,
      security_deposit_at_booking: 500.00, // เงินประกันสูงเพื่อทดสอบการหักค่าปรับ
      calculated_subtotal_rental_fee: 700.00,
      delivery_fee: 50.00,
      platform_fee_renter: 75.00,
      platform_fee_owner: 63.00,
      total_amount_due: 825.00,
      final_amount_paid: 825.00,
      pickup_method: 'delivery',
      return_method: 'delivery',
      payment_status: 'paid',
      payment_verified_at: startDate.toISOString(),
      actual_pickup_time: startDate.toISOString(),
      return_condition_status: null,
      created_at: startDate.toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('1. Creating test rental with overdue return...');
    console.log('Start date:', testRentalData.start_date);
    console.log('End date (overdue):', testRentalData.end_date);
    console.log('Days overdue:', Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)));
    
    const { data: newRental, error: rentalError } = await supabase
      .from('rentals')
      .insert([testRentalData])
      .select()
      .single();
    
    if (rentalError) {
      console.log('❌ Error creating test rental:', rentalError);
      return null;
    }
    
    console.log('✅ Test rental created successfully!');
    console.log('Rental ID:', newRental.id);
    console.log('Rental UID:', newRental.rental_uid);
    console.log('Status:', newRental.rental_status);
    
    return newRental;
    
  } catch (error) {
    console.error('❌ Error in createLateRental:', error);
    return null;
  }
}

async function main() {
  const rental = await createLateRental();
  if (rental) {
    console.log('\n🎉 Test rental created! Now run the scheduler to update status to late_return');
    console.log('Run: npm run test-scheduler');
  }
  process.exit(0);
}

main();
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRental94() {
    console.log('🔍 ตรวจสอบข้อมูล rental ID 94...\n');

    try {
        // ดึงข้อมูล rental ID 94
        const { data: rental, error } = await supabase
            .from('rentals')
            .select('*')
            .eq('id', 94)
            .single();

        if (error) {
            console.error('❌ Error fetching rental:', error);
            return;
        }

        if (!rental) {
            console.log('❌ ไม่พบ rental ID 94');
            return;
        }

        console.log('✅ พบข้อมูล rental ID 94:');
        console.log('==========================================');
        console.log(`📋 Rental ID: ${rental.id}`);
        console.log(`📅 วันที่เช่า: ${rental.start_date} ถึง ${rental.end_date}`);
        console.log(`📊 สถานะ: ${rental.rental_status}`);
        console.log(`💰 ค่าเช่า: ${rental.total_amount} บาท`);
        console.log(`🛡️ เงินประกัน: ${rental.security_deposit} บาท`);
        console.log(`⚠️ ค่าปรับคำนวณแล้ว: ${rental.late_fee_calculated || 0} บาท`);
        console.log(`💸 เงินประกันคืน: ${rental.security_deposit_refund_amount || 'ยังไม่คำนวณ'} บาท`);
        console.log(`👤 ผู้เช่า ID: ${rental.renter_id}`);
        console.log(`🏪 เจ้าของ ID: ${rental.owner_id}`);
        console.log(`📦 สินค้า ID: ${rental.product_id}`);
        
        if (rental.actual_return_time) {
            console.log(`🔄 วันที่คืนจริง: ${rental.actual_return_time}`);
        }
        
        console.log('==========================================\n');

        // ตรวจสอบประวัติสถานะ
        const { data: statusHistory, error: historyError } = await supabase
            .from('rental_status_history')
            .select('*')
            .eq('rental_id', 94)
            .order('created_at', { ascending: false });

        if (historyError) {
            console.error('❌ Error fetching status history:', historyError);
        } else {
            console.log('📜 ประวัติการเปลี่ยนสถานะ:');
            statusHistory.forEach((history, index) => {
                console.log(`${index + 1}. ${history.status} - ${history.created_at}`);
                if (history.notes) {
                    console.log(`   หมายเหตุ: ${history.notes}`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkRental94();
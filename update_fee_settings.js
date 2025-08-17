import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateFeeSettings() {
  console.log('🔧 Updating fee settings to 0 (no fees)...');
  
  try {
    // Update platform fee percentage for renters (0%)
    const { error: platformFeeError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'platform_fee_percentage',
        setting_value: '0.0',
        description: 'อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับผู้เช่า (0% - ไม่มีค่าธรรมเนียม)',
        data_type: 'float',
        is_publicly_readable: true
      });

    if (platformFeeError) {
      console.error('❌ Error updating platform_fee_percentage:', platformFeeError);
    } else {
      console.log('✅ Updated platform_fee_percentage to 0.0%');
    }

    // Update platform fee percentage for owners (0%)
    const { error: platformFeeOwnerError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'platform_fee_owner_percentage',
        setting_value: '0.0',
        description: 'อัตราค่าธรรมเนียมแพลตฟอร์มสำหรับเจ้าของสินค้า (0% - ไม่มีค่าธรรมเนียม)',
        data_type: 'float',
        is_publicly_readable: true
      });

    if (platformFeeOwnerError) {
      console.error('❌ Error updating platform_fee_owner_percentage:', platformFeeOwnerError);
    } else {
      console.log('✅ Updated platform_fee_owner_percentage to 0.0%');
    }

    // Update delivery fee base (0 baht)
    const { error: deliveryFeeError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'delivery_fee_base',
        setting_value: '0.0',
        description: 'ค่าส่งพื้นฐาน (0 บาท - ไม่มีค่าส่ง)',
        data_type: 'float',
        is_publicly_readable: true
      });

    if (deliveryFeeError) {
      console.error('❌ Error updating delivery_fee_base:', deliveryFeeError);
    } else {
      console.log('✅ Updated delivery_fee_base to 0.0 baht');
    }

    // Verify the settings
    console.log('\n🔍 Verifying updated settings...');
    const { data: settings, error: fetchError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, description')
      .in('setting_key', ['platform_fee_percentage', 'platform_fee_owner_percentage', 'delivery_fee_base']);

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
    } else {
      console.log('📋 Current fee settings:');
      settings.forEach(setting => {
        console.log(`   • ${setting.setting_key}: ${setting.setting_value} - ${setting.description}`);
      });
    }

    console.log('\n🎉 Fee settings updated to 0 (no fees)!');
    
  } catch (error) {
    console.error('❌ Error updating fee settings:', error);
  }
}

// Run the update
updateFeeSettings();

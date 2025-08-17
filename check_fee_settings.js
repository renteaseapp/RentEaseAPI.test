import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFeeSettings() {
  console.log('🔍 Checking current fee settings...');
  
  try {
    // Fetch current fee settings
    const { data: settings, error: fetchError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, description, data_type, is_publicly_readable')
      .in('setting_key', ['platform_fee_percentage', 'platform_fee_owner_percentage', 'delivery_fee_base']);

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
      return;
    }

    console.log('\n📋 Current fee settings in database:');
    console.log('=====================================');
    
    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        console.log(`   • ${setting.setting_key}:`);
        console.log(`     - Value: ${setting.setting_value}`);
        console.log(`     - Type: ${setting.data_type}`);
        console.log(`     - Description: ${setting.description}`);
        console.log(`     - Public: ${setting.is_publicly_readable}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No fee settings found in database');
    }

    // Test API endpoint
    console.log('🧪 Testing API endpoint...');
    console.log('=====================================');
    
    try {
      const response = await fetch('http://localhost:3001/api/settings/calculate-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtotal_rental_fee: 24000,
          pickup_method: 'self_pickup'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:');
        console.log(JSON.stringify(result, null, 2));
        
        // Calculate expected values
        const subtotal = 24000;
        const platformFeeRenter = subtotal * 0; // 0%
        const platformFeeOwner = subtotal * 0; // 0%
        const deliveryFee = 0; // self_pickup
        const totalEstimatedFees = platformFeeRenter + deliveryFee;
        const totalAmountEstimate = subtotal + totalEstimatedFees;
        
        console.log('\n🔢 Expected calculation:');
        console.log(`   • subtotal_rental_fee: ${subtotal}`);
        console.log(`   • platform_fee_renter: ${platformFeeRenter} (0%)`);
        console.log(`   • platform_fee_owner: ${platformFeeOwner} (0%)`);
        console.log(`   • delivery_fee: ${deliveryFee}`);
        console.log(`   • total_estimated_fees: ${totalEstimatedFees}`);
        console.log(`   • total_amount_estimate: ${totalAmountEstimate}`);
        
      } else {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log(`❌ API Test failed: ${apiError.message}`);
      console.log('   Make sure backend server is running on port 3001');
    }

  } catch (error) {
    console.error('❌ Error checking fee settings:', error);
  }
}

// Run the check
checkFeeSettings();

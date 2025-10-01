// Simple test script to check fee calculation API
import fetch from 'node-fetch';

async function testFeeCalculation() {
  console.log('🧪 Testing Fee Calculation API...');
  
  try {
    // Test different scenarios
    const testCases = [
      {
        name: 'Daily rental - Self pickup',
        subtotal_rental_fee: 1000,
        pickup_method: 'self_pickup'
      },
      {
        name: 'Weekly rental - Delivery',
        subtotal_rental_fee: 5000,
        pickup_method: 'delivery'
      },
      {
        name: 'Monthly rental - Self pickup',
        subtotal_rental_fee: 15000,
        pickup_method: 'self_pickup'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`   Input: ฿${testCase.subtotal_rental_fee}, ${testCase.pickup_method}`);
      
      try {
        const response = await fetch('http://localhost:65019/api/settings/calculate-fees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subtotal_rental_fee: testCase.subtotal_rental_fee,
            pickup_method: testCase.pickup_method
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('   ✅ API Response:');
          console.log(`      • Subtotal: ฿${result.data.subtotal_rental_fee}`);
          console.log(`      • Platform Fee (Renter): ฿${result.data.platform_fee_renter}`);
          console.log(`      • Platform Fee (Owner): ฿${result.data.platform_fee_owner}`);
          console.log(`      • Delivery Fee: ฿${result.data.delivery_fee}`);
          console.log(`      • Total Estimated Fees: ฿${result.data.total_estimated_fees}`);
          console.log(`      • Total Amount Estimate: ฿${result.data.total_amount_estimate}`);
        } else {
          console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.log(`   Error details: ${errorText}`);
        }
      } catch (apiError) {
        console.log(`   ❌ Request failed: ${apiError.message}`);
      }
    }

    // Test fee settings endpoint
    console.log('\n🔧 Testing Fee Settings API...');
    try {
      const response = await fetch('http://localhost:65019/api/settings/fee-settings');
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fee Settings:');
        console.log(`   • Platform Fee Percentage: ${result.data.platform_fee_percentage}%`);
        console.log(`   • Platform Fee Owner Percentage: ${result.data.platform_fee_owner_percentage}%`);
        console.log(`   • Delivery Fee Base: ฿${result.data.delivery_fee_base}`);
      } else {
        console.log(`❌ Fee Settings API Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Fee Settings API failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFeeCalculation();
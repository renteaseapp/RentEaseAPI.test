import supabase from './db/supabaseClient.js';

async function setupBufferSettings() {
  try {
    console.log('🔧 Setting up buffer time settings...');
    
    // Insert buffer time settings
    const { error } = await supabase
      .from('system_settings')
      .upsert([
        {
          setting_key: 'delivery_buffer_days',
          setting_value: '1',
          description: 'จำนวนวันที่ต้องเผื่อสำหรับการจัดส่งสินค้า (วัน)',
          data_type: 'integer',
          is_publicly_readable: false,
          validation_rules: 'min:0,max:7'
        },
        {
          setting_key: 'return_buffer_days',
          setting_value: '1',
          description: 'จำนวนวันที่ต้องเผื่อสำหรับการรับคืนสินค้า (วัน)',
          data_type: 'integer',
          is_publicly_readable: false,
          validation_rules: 'min:0,max:7'
        },
        {
          setting_key: 'enable_buffer_time',
          setting_value: 'true',
          description: 'เปิดใช้งาน buffer time สำหรับการจองสินค้า (true/false)',
          data_type: 'boolean',
          is_publicly_readable: false,
          validation_rules: null
        }
      ]);

    if (error) {
      console.error('❌ Error setting up buffer settings:', error);
      return;
    }

    // Verify the settings
    const { data: settings, error: fetchError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, description')
      .in('setting_key', ['delivery_buffer_days', 'return_buffer_days', 'enable_buffer_time']);

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
    } else {
      console.log('📋 Buffer time settings:');
      settings.forEach(setting => {
        console.log(`   • ${setting.setting_key}: ${setting.setting_value} - ${setting.description}`);
      });
    }

    console.log('✅ Buffer time settings setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up buffer settings:', error);
  }
}

// Run the setup
setupBufferSettings();
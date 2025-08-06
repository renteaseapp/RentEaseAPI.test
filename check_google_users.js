import supabase from './db/supabaseClient.js';

async function checkGoogleUsers() {
  try {
    console.log('🔍 Checking users with Google login...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, google_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users:`);
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Google ID: ${user.google_id || '❌ Missing'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('-'.repeat(40));
    });
    
    // Count users with google_id
    const usersWithGoogleId = users.filter(user => user.google_id);
    console.log(`\n📊 Summary:`);
    console.log(`Total users checked: ${users.length}`);
    console.log(`Users with google_id: ${usersWithGoogleId.length}`);
    console.log(`Users without google_id: ${users.length - usersWithGoogleId.length}`);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkGoogleUsers(); 
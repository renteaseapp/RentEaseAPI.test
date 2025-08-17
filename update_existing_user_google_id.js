import supabase from './db/supabaseClient.js';

async function updateExistingUserGoogleId() {
  try {
    console.log('🔍 Updating existing user with Google ID...');
    
    // Example: Update a specific user (replace with actual email and Google ID)
    const email = 'cooksy.org@gmail.com'; // Replace with actual email
    const googleId = '123456789012345678901'; // Replace with actual Google ID
    
    console.log(`Updating user: ${email} with Google ID: ${googleId}`);
    
    // First, check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, email, google_id')
      .eq('email', email)
      .single();
    
    if (findError) {
      console.error('❌ Error finding user:', findError);
      return;
    }
    
    if (!existingUser) {
      console.error('❌ User not found:', email);
      return;
    }
    
    console.log('Found user:', existingUser);
    
    if (existingUser.google_id) {
      console.log('⚠️ User already has Google ID:', existingUser.google_id);
      return;
    }
    
    // Update the user with Google ID
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ google_id: googleId })
      .eq('id', existingUser.id)
      .select('id, email, google_id, first_name, last_name')
      .single();
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }
    
    console.log('✅ User updated successfully:', updatedUser);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Instructions for manual update
console.log('📝 Instructions:');
console.log('1. Replace the email and googleId variables with actual values');
console.log('2. Run this script to update a specific user');
console.log('3. Or use the Google login flow which will automatically update existing users');

updateExistingUserGoogleId(); 
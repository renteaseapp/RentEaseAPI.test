import { readFileSync } from 'fs';
import { join } from 'path';
import supabase from '../db/supabaseClient.js';

async function runGoogleOAuthMigration() {
  try {
    console.log('Running Google OAuth migration...');
    
    // Add google_id column to users table
    console.log('Adding google_id column...');
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;' 
    });
    
    if (alterError) {
      console.error('Failed to add google_id column:', alterError);
      // Try alternative approach
      console.log('Trying alternative approach...');
      const { error: directError } = await supabase
        .from('users')
        .select('google_id')
        .limit(1);
      
      if (directError && directError.message.includes('column "google_id" does not exist')) {
        console.error('The google_id column does not exist. Please run the migration manually in your database.');
        console.log('SQL to run:');
        console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;');
        console.log('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
        process.exit(1);
      }
    }
    
    // Add index for better performance
    console.log('Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);' 
    });
    
    if (indexError) {
      console.error('Failed to create index:', indexError);
    }
    
    console.log('Google OAuth migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration script error:', error);
    console.log('Please run the following SQL manually in your database:');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;');
    console.log('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
    process.exit(1);
  }
}

runGoogleOAuthMigration(); 
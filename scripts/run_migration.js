import { readFileSync } from 'fs';
import { join } from 'path';
import supabase from '../db/supabaseClient.js';

async function runMigration() {
  try {
    console.log('Running product approval settings migration...');
    
    const migrationPath = join(process.cwd(), 'migrations', 'add_product_approval_settings.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration script error:', error);
    process.exit(1);
  }
}

runMigration(); 
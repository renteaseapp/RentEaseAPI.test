import { readFileSync } from 'fs';
import { join } from 'path';
import supabase from '../db/supabaseClient.js';

async function runMigration() {
  try {
    console.log('Running rental_pricing_type_used migration...');

    // 1) ตรวจสอบก่อนว่าคอลัมน์มีอยู่แล้วหรือยัง
    try {
      const { error: precheckError } = await supabase
        .from('rentals')
        .select('id, rental_pricing_type_used')
        .limit(1);

      if (!precheckError) {
        console.log('Column rental_pricing_type_used already exists. Skipping migration.');
        process.exit(0);
        return;
      }
    } catch (e) {
      // ถ้า select ล้มเหลวเพราะคอลัมน์ไม่มี ให้ไปทำ migration ต่อ
    }

    const migrationPath = join(process.cwd(), 'migrations', 'add_rental_pricing_type_used.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // จัดการกรณีไม่มีฟังก์ชัน exec_sql
      if (error.code === 'PGRST202' || /Could not find the function public\.exec_sql/i.test(error.message)) {
        console.error('\nMigration could not run because the RPC function public.exec_sql(sql) does not exist in your Supabase project.');
        console.error('Please run the following SQL once in the Supabase SQL Editor (or via psql) with a service-role to create it:');
        console.error('\n-- Create helper function to execute arbitrary SQL (use with care)');
        console.error('create or replace function public.exec_sql(sql text)');
        console.error('returns void language plpgsql security definer as $$');
        console.error('begin');
        console.error('  execute sql;');
        console.error('end;');
        console.error('$$;');
        console.error('grant execute on function public.exec_sql(text) to anon, authenticated, service_role;\n');
        console.error('After creating exec_sql, re-run: node scripts/run_migration_rental_pricing_type_used.js');
        process.exit(1);
        return;
      }

      console.error('Migration failed:', error);
      process.exit(1);
      return;
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration script error:', error);
    process.exit(1);
  }
}

runMigration();
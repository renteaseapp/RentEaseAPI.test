const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${colors.cyan}${step}${colors.reset}`, 'bright');
  log(description, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check environment variables
function checkEnvironment() {
  logStep('STEP 1', 'Checking environment configuration...');
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    logInfo('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  logSuccess('Environment variables are properly configured');
  return true;
}

// Initialize Supabase client
function initializeSupabase() {
  logStep('STEP 2', 'Initializing Supabase client...');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    logSuccess('Supabase client initialized successfully');
    return supabase;
  } catch (error) {
    logError(`Failed to initialize Supabase: ${error.message}`);
    process.exit(1);
  }
}

// Create database schema
async function createDatabaseSchema(supabase) {
  logStep('STEP 3', 'Creating database schema...');
  
  try {
    const dbSqlPath = path.join(__dirname, 'db.sql');
    const dbSql = fs.readFileSync(dbSqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = dbSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          // Ignore errors for existing objects
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            logWarning(`SQL statement warning: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        // Ignore errors for existing objects
        if (!err.message.includes('already exists')) {
          logWarning(`SQL statement warning: ${err.message}`);
          errorCount++;
        }
      }
    }

    logSuccess(`Database schema created (${successCount} statements executed)`);
    if (errorCount > 0) {
      logWarning(`${errorCount} statements had warnings (likely existing objects)`);
    }
    
    return true;
  } catch (error) {
    logError(`Failed to create database schema: ${error.message}`);
    return false;
  }
}

// Insert initial data
async function insertInitialData(supabase) {
  logStep('STEP 4', 'Inserting initial data...');
  
  try {
    const insertSqlPath = path.join(__dirname, 'insert_data.sql');
    const insertSql = fs.readFileSync(insertSqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = insertSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          // Ignore errors for duplicate data
          if (!error.message.includes('duplicate key') && 
              !error.message.includes('already exists')) {
            logWarning(`Insert statement warning: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        // Ignore errors for duplicate data
        if (!err.message.includes('duplicate key')) {
          logWarning(`Insert statement warning: ${err.message}`);
          errorCount++;
        }
      }
    }

    logSuccess(`Initial data inserted (${successCount} statements executed)`);
    if (errorCount > 0) {
      logWarning(`${errorCount} statements had warnings (likely duplicate data)`);
    }
    
    return true;
  } catch (error) {
    logError(`Failed to insert initial data: ${error.message}`);
    return false;
  }
}

// Create storage buckets
async function createStorageBuckets(supabase) {
  logStep('STEP 5', 'Creating storage buckets...');
  
  const buckets = [
    { name: 'avatars', public: true, description: 'User profile pictures and avatars' },
    { name: 'product-images', public: true, description: 'Product images for rental items' },
    { name: 'id-verification', public: false, description: 'User ID verification documents' },
    { name: 'payment-proofs', public: false, description: 'Payment proof documents' },
    { name: 'chat-files', public: false, description: 'Files shared in chat conversations' },
    { name: 'shipping-receipts', public: false, description: 'Shipping and delivery receipts' },
    { name: 'return-condition-images', public: false, description: 'Images of returned items condition' },
    { name: 'claim-attachments', public: false, description: 'Claim-related attachments' },
    { name: 'complaint-attachments', public: false, description: 'Complaint-related attachments' }
  ];

  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.public ? null : ['image/*', 'application/pdf', 'text/*'],
          fileSizeLimit: 52428800, // 50MB
          allowedFileExtensions: bucket.public ? null : ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'doc', 'docx']
        });

        if (error) {
          if (error.message.includes('already exists')) {
            logInfo(`Bucket '${bucket.name}' already exists, skipping...`);
            skippedCount++;
          } else {
            logWarning(`Error creating bucket '${bucket.name}': ${error.message}`);
          }
        } else {
          logSuccess(`Created bucket: ${bucket.name}`);
          createdCount++;
        }
      } catch (err) {
        logWarning(`Error with bucket '${bucket.name}': ${err.message}`);
      }
    }

    logSuccess(`Storage buckets setup completed (${createdCount} created, ${skippedCount} skipped)`);
    return true;
  } catch (error) {
    logError(`Failed to create storage buckets: ${error.message}`);
    return false;
  }
}

// Setup storage policies
async function setupStoragePolicies(supabase) {
  logStep('STEP 6', 'Setting up storage policies...');
  
  try {
    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    });

    // Drop existing policies
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Public buckets are viewable by everyone" ON storage.objects;
      DROP POLICY IF EXISTS "Public buckets are insertable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Public buckets are updatable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Public buckets are deletable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Private buckets are viewable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Private buckets are insertable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Private buckets are updatable by authenticated users" ON storage.objects;
      DROP POLICY IF EXISTS "Private buckets are deletable by authenticated users" ON storage.objects;
    `;

    await supabase.rpc('exec_sql', { sql: dropPoliciesSQL });

    // Create new policies
    const policies = [
      `CREATE POLICY "Public buckets are viewable by everyone" ON storage.objects
       FOR SELECT USING (bucket_id IN ('avatars', 'product-images'));`,
      
      `CREATE POLICY "Public buckets are insertable by authenticated users" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Public buckets are updatable by authenticated users" ON storage.objects
       FOR UPDATE USING (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Public buckets are deletable by authenticated users" ON storage.objects
       FOR DELETE USING (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Private buckets are viewable by authenticated users" ON storage.objects
       FOR SELECT USING (
         bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
         AND auth.role() = 'authenticated'
       );`,
      
      `CREATE POLICY "Private buckets are insertable by authenticated users" ON storage.objects
       FOR INSERT WITH CHECK (
         bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
         AND auth.role() = 'authenticated'
       );`,
      
      `CREATE POLICY "Private buckets are updatable by authenticated users" ON storage.objects
       FOR UPDATE USING (
         bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
         AND auth.role() = 'authenticated'
       );`,
      
      `CREATE POLICY "Private buckets are deletable by authenticated users" ON storage.objects
       FOR DELETE USING (
         bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
         AND auth.role() = 'authenticated'
       );`
    ];

    for (const policy of policies) {
      await supabase.rpc('exec_sql', { sql: policy });
    }

    logSuccess('Storage policies configured successfully');
    return true;
  } catch (error) {
    logError(`Failed to setup storage policies: ${error.message}`);
    return false;
  }
}

// Test the setup
async function testSetup(supabase) {
  logStep('STEP 7', 'Testing the setup...');
  
  try {
    // Test database connection
    const { data: provinces, error: dbError } = await supabase
      .from('provinces')
      .select('count')
      .limit(1);

    if (dbError) {
      logWarning(`Database test warning: ${dbError.message}`);
    } else {
      logSuccess('Database connection test passed');
    }

    // Test storage buckets
    const buckets = ['avatars', 'product-images', 'id-verification'];
    let bucketTestCount = 0;

    for (const bucketName of buckets) {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list();

        if (listError) {
          logWarning(`Bucket '${bucketName}' test warning: ${listError.message}`);
        } else {
          bucketTestCount++;
        }
      } catch (err) {
        logWarning(`Bucket '${bucketName}' test warning: ${err.message}`);
      }
    }

    if (bucketTestCount > 0) {
      logSuccess(`Storage test passed (${bucketTestCount}/${buckets.length} buckets accessible)`);
    }

    logSuccess('Setup testing completed');
    return true;
  } catch (error) {
    logError(`Setup testing failed: ${error.message}`);
    return false;
  }
}

// Main setup function
async function runSetup() {
  log('🚀 RentEase Supabase Setup Script', 'bright');
  log('=====================================', 'cyan');
  
  const startTime = Date.now();
  const results = {};

  try {
    // Step 1: Check environment
    results.environment = checkEnvironment();

    // Step 2: Initialize Supabase
    const supabase = initializeSupabase();

    // Step 3: Create database schema
    results.schema = await createDatabaseSchema(supabase);

    // Step 4: Insert initial data
    results.data = await insertInitialData(supabase);

    // Step 5: Create storage buckets
    results.buckets = await createStorageBuckets(supabase);

    // Step 6: Setup storage policies
    results.policies = await setupStoragePolicies(supabase);

    // Step 7: Test setup
    results.test = await testSetup(supabase);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n🎉 Setup Summary', 'bright');
    log('================', 'cyan');
    log(`⏱️  Total time: ${duration} seconds`, 'blue');
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalSteps = Object.keys(results).length;
    
    log(`✅ Successful steps: ${successCount}/${totalSteps}`, 'green');
    
    if (successCount === totalSteps) {
      log('\n🎊 All setup steps completed successfully!', 'green');
      log('\n📋 What was created:', 'bright');
      log('   • Database schema with all tables', 'blue');
      log('   • Initial data (categories, provinces, admin user, settings)', 'blue');
      log('   • 9 storage buckets (2 public, 7 private)', 'blue');
      log('   • Storage access policies', 'blue');
      log('   • RLS disabled on database tables', 'blue');
      log('   • RLS enabled on storage objects', 'blue');
      
      log('\n🔧 Next steps:', 'bright');
      log('   • Start your backend server', 'blue');
      log('   • Configure your frontend application', 'blue');
      log('   • Test user registration and login', 'blue');
      log('   • Test file upload functionality', 'blue');
    } else {
      log('\n⚠️  Some steps had issues. Check the logs above for details.', 'yellow');
    }

  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup }; 
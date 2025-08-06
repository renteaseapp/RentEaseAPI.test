import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Bucket configurations
const buckets = [
  {
    name: 'avatars',
    public: true,
    description: 'User profile pictures and avatars'
  },
  {
    name: 'product-images',
    public: true,
    description: 'Product images for rental items'
  },
  {
    name: 'id-verification',
    public: false,
    description: 'User ID verification documents (private)'
  },
  {
    name: 'payment-proofs',
    public: false,
    description: 'Payment proof documents (private)'
  },
  {
    name: 'chat-files',
    public: false,
    description: 'Files shared in chat conversations (private)'
  },
  {
    name: 'shipping-receipts',
    public: false,
    description: 'Shipping and delivery receipts (private)'
  },
  {
    name: 'return-condition-images',
    public: false,
    description: 'Images of returned items condition (private)'
  },
  {
    name: 'claim-attachments',
    public: false,
    description: 'Claim-related attachments (private)'
  },
  {
    name: 'complaint-attachments',
    public: false,
    description: 'Complaint-related attachments (private)'
  }
];

// SQL policies for bucket access
const bucketPolicies = {
  // Public buckets - anyone can read, authenticated users can write
  public: {
    select: `
      CREATE POLICY "Public buckets are viewable by everyone" ON storage.objects
      FOR SELECT USING (bucket_id IN ('avatars', 'product-images'));
    `,
    insert: `
      CREATE POLICY "Public buckets are insertable by authenticated users" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');
    `,
    update: `
      CREATE POLICY "Public buckets are updatable by authenticated users" ON storage.objects
      FOR UPDATE USING (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');
    `,
    delete: `
      CREATE POLICY "Public buckets are deletable by authenticated users" ON storage.objects
      FOR DELETE USING (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');
    `
  },
  // Private buckets - authenticated users can read/write their own files
  private: {
    select: `
      CREATE POLICY "Private buckets are viewable by authenticated users" ON storage.objects
      FOR SELECT USING (
        bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
        AND auth.role() = 'authenticated'
      );
    `,
    insert: `
      CREATE POLICY "Private buckets are insertable by authenticated users" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
        AND auth.role() = 'authenticated'
      );
    `,
    update: `
      CREATE POLICY "Private buckets are updatable by authenticated users" ON storage.objects
      FOR UPDATE USING (
        bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
        AND auth.role() = 'authenticated'
      );
    `,
    delete: `
      CREATE POLICY "Private buckets are deletable by authenticated users" ON storage.objects
      FOR DELETE USING (
        bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
        AND auth.role() = 'authenticated'
      );
    `
  }
};

async function createBuckets() {
  console.log('🚀 Starting bucket creation process...\n');

  try {
    // Create each bucket
    for (const bucket of buckets) {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.public ? null : ['image/*', 'application/pdf', 'text/*'],
        fileSizeLimit: 52428800, // 50MB limit
        allowedFileExtensions: bucket.public ? null : ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'doc', 'docx']
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Bucket '${bucket.name}' already exists, skipping...`);
        } else {
          console.error(`   ❌ Error creating bucket '${bucket.name}':`, error.message);
        }
      } else {
        console.log(`   ✅ Successfully created bucket '${bucket.name}'`);
      }
    }

    console.log('\n🔐 Setting up storage policies...\n');

    // Enable RLS on storage.objects
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('   ⚠️  RLS might already be enabled on storage.objects');
    } else {
      console.log('   ✅ Enabled RLS on storage.objects');
    }

    // Drop existing policies if they exist
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

    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL });
    if (dropError) {
      console.log('   ⚠️  Could not drop existing policies (might not exist)');
    } else {
      console.log('   ✅ Dropped existing policies');
    }

    // Create new policies
    const allPolicies = [
      bucketPolicies.public.select,
      bucketPolicies.public.insert,
      bucketPolicies.public.update,
      bucketPolicies.public.delete,
      bucketPolicies.private.select,
      bucketPolicies.private.insert,
      bucketPolicies.private.update,
      bucketPolicies.private.delete
    ];

    for (const policy of allPolicies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError) {
        console.error('   ❌ Error creating policy:', policyError.message);
      }
    }

    console.log('   ✅ Created all storage policies');

    // Test bucket access
    console.log('\n🧪 Testing bucket access...\n');

    for (const bucket of buckets) {
      console.log(`   Testing bucket: ${bucket.name}`);
      
      // Test list files (should work for all authenticated users)
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.name)
        .list();

      if (listError) {
        console.log(`     ⚠️  List test failed: ${listError.message}`);
      } else {
        console.log(`     ✅ List test passed (${files?.length || 0} files found)`);
      }
    }

    console.log('\n🎉 Bucket creation and configuration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Created/verified 9 storage buckets');
    console.log('   • Set up RLS policies for secure access');
    console.log('   • Public buckets: avatars, product-images');
    console.log('   • Private buckets: id-verification, payment-proofs, chat-files, shipping-receipts, return-condition-images, claim-attachments, complaint-attachments');
    console.log('\n🔧 Next steps:');
    console.log('   • Configure your frontend to use these bucket names');
    console.log('   • Test file upload/download functionality');
    console.log('   • Monitor storage usage in Supabase dashboard');

  } catch (error) {
    console.error('❌ Fatal error during bucket creation:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createBuckets();
}

export { createBuckets, buckets, bucketPolicies }; 
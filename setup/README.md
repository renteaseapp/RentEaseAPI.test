# RentEase Supabase Setup

This directory contains scripts to set up the complete RentEase Supabase infrastructure.

## Files

- `setup.js` - **Main setup script** (runs everything in one go)
- `db.sql` - Database schema creation script
- `create_buckets.js` - Storage bucket creation script (standalone)
- `insert_data.sql` - Initial data insertion script
- `package.json` - Dependencies and scripts
- `README.md` - This file

## Quick Start (Recommended)

### 1. Install Dependencies

```bash
cd backend/setup
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Complete Setup

```bash
npm run setup
```

This single command will:
- ✅ Check environment configuration
- ✅ Create database schema
- ✅ Insert initial data (categories, provinces, admin user, settings)
- ✅ Create 9 storage buckets
- ✅ Configure storage policies
- ✅ Test the setup

## Manual Setup (Alternative)

If you prefer to run steps individually:

### 1. Database Schema Only

```bash
# Run database schema creation
psql -h your-db-host -U postgres -d postgres -f db.sql
```

### 2. Storage Buckets Only

```bash
npm run create-buckets
```

### 3. Initial Data Only

```bash
# Run data insertion
psql -h your-db-host -U postgres -d postgres -f insert_data.sql
```

## What Gets Created

### Database Tables
- `provinces` - 77 Thai provinces
- `users` - User accounts and profiles
- `admin_users` - Admin user management
- `categories` - Product categories (10 main + 16 sub-categories)
- `products` - Rental products
- `product_images` - Product images
- `user_addresses` - User shipping addresses
- `rentals` - Rental transactions
- `rental_status_history` - Rental status tracking
- `reviews` - Product and user reviews
- `payout_methods` - Payment methods for owners
- `chat_conversations` - Chat rooms
- `chat_messages` - Chat messages
- `complaints` - User complaints
- `complaint_attachments` - Complaint files
- `notifications` - System notifications
- `wishlist` - User wishlists
- `payment_transactions` - Payment records
- `admin_logs` - Admin action logs
- `system_settings` - System configuration

### Storage Buckets

#### Public Buckets (Anyone can read, authenticated users can write)
- `avatars` - User profile pictures and avatars
- `product-images` - Product images for rental items

#### Private Buckets (Authenticated users only)
- `id-verification` - User ID verification documents
- `payment-proofs` - Payment proof documents
- `chat-files` - Files shared in chat conversations
- `shipping-receipts` - Shipping and delivery receipts
- `return-condition-images` - Images of returned items condition
- `claim-attachments` - Claim-related attachments
- `complaint-attachments` - Complaint-related attachments

### Initial Data
- **77 Thai provinces** with Thai and English names
- **26 product categories** (10 main + 16 sub-categories)
- **Admin user** (admin@rentease.com)
- **System settings** (platform fees, contact info, etc.)

## Storage Policies

### Public Buckets
- **SELECT**: Anyone can view files
- **INSERT/UPDATE/DELETE**: Only authenticated users

### Private Buckets
- **SELECT/INSERT/UPDATE/DELETE**: Only authenticated users

## Bucket Configuration

### Public Buckets
- No file type restrictions
- No file size limits
- Public read access

### Private Buckets
- **Allowed MIME Types**: `image/*`, `application/pdf`, `text/*`
- **Allowed Extensions**: `jpg`, `jpeg`, `png`, `gif`, `pdf`, `txt`, `doc`, `docx`
- **File Size Limit**: 50MB
- **Private access only**

## Frontend Integration

### Upload Files
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Upload to public bucket
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('path/to/file.jpg', file)

// Upload to private bucket
const { data, error } = await supabase.storage
  .from('id-verification')
  .upload('user-123/id-card.jpg', file)
```

### Download Files
```javascript
// Get public URL (for public buckets)
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.jpg')

// Download private file
const { data, error } = await supabase.storage
  .from('payment-proofs')
  .download('rental-456/payment.jpg')
```

### List Files
```javascript
const { data, error } = await supabase.storage
  .from('product-images')
  .list('folder-path')
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase configuration"**
   - Check your `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

2. **"Bucket already exists"**
   - This is normal, the script will skip existing buckets

3. **"Permission denied"**
   - Ensure you're using the Service Role Key, not the anon key
   - Check that storage is enabled in your Supabase project

4. **"RLS policy creation failed"**
   - Policies might already exist, the script will handle this gracefully

5. **"SQL statement warnings"**
   - These are usually harmless (existing objects, duplicate data)
   - Check the logs for specific details

### Manual Bucket Creation

If the script fails, you can create buckets manually in the Supabase dashboard:

1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Enter bucket name and settings
4. Repeat for all 9 buckets

### Manual Policy Creation

If policies need to be created manually, run these SQL commands in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public bucket policies
CREATE POLICY "Public buckets are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id IN ('avatars', 'product-images'));

CREATE POLICY "Public buckets are insertable by authenticated users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'product-images') AND auth.role() = 'authenticated');

-- Private bucket policies
CREATE POLICY "Private buckets are viewable by authenticated users" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Private buckets are insertable by authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id IN ('id-verification', 'payment-proofs', 'chat-files', 'shipping-receipts', 'return-condition-images', 'claim-attachments', 'complaint-attachments')
  AND auth.role() = 'authenticated'
);
```

## Security Notes

- **Service Role Key**: Only use the service role key for server-side operations
- **Anon Key**: Use the anon key for client-side operations
- **RLS**: Row Level Security is enabled to protect private files
- **File Validation**: Implement additional file validation in your application
- **Virus Scanning**: Consider implementing virus scanning for uploaded files

## Monitoring

Monitor your storage usage in the Supabase dashboard:
- Storage tab shows bucket usage
- Database logs show access patterns
- Set up alerts for storage limits

## Script Output

The setup script provides colored output with detailed progress:

```
🚀 RentEase Supabase Setup Script
=====================================

STEP 1
Checking environment configuration...
✅ Environment variables are properly configured

STEP 2
Initializing Supabase client...
✅ Supabase client initialized successfully

STEP 3
Creating database schema...
✅ Database schema created (45 statements executed)

STEP 4
Inserting initial data...
✅ Initial data inserted (120 statements executed)

STEP 5
Creating storage buckets...
✅ Created bucket: avatars
✅ Created bucket: product-images
✅ Storage buckets setup completed (9 created, 0 skipped)

STEP 6
Setting up storage policies...
✅ Storage policies configured successfully

STEP 7
Testing the setup...
✅ Database connection test passed
✅ Storage test passed (3/3 buckets accessible)
✅ Setup testing completed

🎉 Setup Summary
================
⏱️  Total time: 12.34 seconds
✅ Successful steps: 7/7

🎊 All setup steps completed successfully!
```

## Next Steps

After successful setup:

1. **Start your backend server**
2. **Configure your frontend application**
3. **Test user registration and login**
4. **Test file upload functionality**
5. **Monitor logs and performance** 
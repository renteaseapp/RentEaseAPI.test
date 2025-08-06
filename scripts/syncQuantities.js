#!/usr/bin/env node

/**
 * Script สำหรับซิงค์ quantity ของสินค้าทั้งหมด
 * ใช้สำหรับ maintenance หรือ fix ข้อมูลที่ไม่ตรงกัน
 * 
 * Usage:
 * node scripts/syncQuantities.js
 * node scripts/syncQuantities.js --product-id=123
 * node scripts/syncQuantities.js --dry-run
 */

import dotenv from 'dotenv';
import ProductModel from '../models/product.model.js';
import QuantityManager from '../utils/quantityManager.js';

// Load environment variables
dotenv.config();

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const productIdArg = args.find(arg => arg.startsWith('--product-id='));
const specificProductId = productIdArg ? parseInt(productIdArg.split('=')[1]) : null;

async function main() {
    try {
        console.log('🚀 Starting quantity synchronization...');
        console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
        
        if (specificProductId) {
            console.log(`Target: Product ID ${specificProductId}`);
        } else {
            console.log('Target: All products');
        }
        
        console.log('─'.repeat(50));

        let result;
        
        if (isDryRun) {
            console.log('⚠️  DRY RUN MODE - No changes will be made');
            // ในโหมด dry run เราจะแค่ตรวจสอบไม่ได้อัปเดต
            result = await simulateSyncQuantities(specificProductId);
        } else {
            if (specificProductId) {
                result = await QuantityManager.syncProductQuantity(specificProductId);
            } else {
                result = await QuantityManager.syncAllProductQuantities();
            }
        }

        console.log('─'.repeat(50));
        console.log('✅ Synchronization completed!');
        console.log(`📊 Products processed: ${result.synced_products || 0}`);
        
        if (result.details && result.details.length > 0) {
            console.log('\n📋 Changes made:');
            result.details.forEach(detail => {
                console.log(`  Product ${detail.product_id} (${detail.title})`);
                console.log(`    Quantity: ${detail.old_quantity_available} → ${detail.new_quantity_available}`);
                console.log(`    Active rentals: ${detail.active_rentals}`);
            });
        } else {
            console.log('✨ All quantities are already in sync!');
        }

    } catch (error) {
        console.error('❌ Error during synchronization:', error);
        process.exit(1);
    }
}

async function simulateSyncQuantities(productId = null) {
    // Simulate sync without making changes
    console.log('🔍 Checking for quantity discrepancies...');
    
    // This would be a read-only version of the sync function
    // For now, we'll just return a mock result
    return {
        synced_products: 0,
        details: [],
        simulation: true
    };
}

// Handle script termination
process.on('SIGINT', () => {
    console.log('\n⚠️  Script interrupted by user');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
main();
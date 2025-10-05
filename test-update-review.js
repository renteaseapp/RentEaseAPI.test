import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use actual environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Validate environment variables
if (!supabaseUrl || !supabaseKey || !JWT_SECRET) {
    console.error('❌ Missing environment variables. Please check your .env file.');
    console.error('Required: SUPABASE_URL, SUPABASE_KEY, JWT_SECRET');
    process.exit(1);
}

// Test data
const userId = 39; // User ID from previous tests
const rentalId = 75; // Rental ID from previous tests

// Generate JWT token for authentication
function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
}

// Test function to update a review
async function testUpdateReview() {
    try {
        console.log('🧪 Testing Update Review API...');
        console.log(`User ID: ${userId}`);
        console.log(`Rental ID: ${rentalId}`);
        
        const token = generateToken(userId);
        
        // First, let's check if there's an existing review
        console.log('\n📋 Checking existing review...');
        const checkResponse = await fetch(`http://localhost:65019/api/reviews/${rentalId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (checkResponse.ok) {
            const existingReview = await checkResponse.json();
            console.log('✅ Existing review found:', existingReview.data);
            
            // Now test updating the review
            console.log('\n🔄 Testing review update...');
            const updateData = {
                rating_product: 4,
                rating_owner: 5,
                comment: "Updated review: This product was even better than I initially thought! Great service from the owner too."
            };
            
            const updateResponse = await fetch(`http://localhost:65019/api/reviews/${rentalId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            console.log(`Response Status: ${updateResponse.status}`);
            
            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('✅ Review updated successfully!');
                console.log('Updated Review:', result.data);
            } else {
                const error = await updateResponse.json();
                console.log('❌ Update failed:', error);
            }
            
        } else if (checkResponse.status === 404) {
            console.log('❌ No existing review found for this rental');
            console.log('💡 You need to create a review first before updating it');
        } else {
            const error = await checkResponse.json();
            console.log('❌ Error checking existing review:', error);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Test function to create a review first (if needed)
async function testCreateReview() {
    try {
        console.log('\n🆕 Creating a new review first...');
        
        const token = generateToken(userId);
        const reviewData = {
            rental_id: rentalId,
            rating_product: 3,
            rating_owner: 4,
            comment: "Initial review: Good product and service."
        };
        
        const response = await fetch('http://localhost:65019/api/reviews', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });
        
        console.log(`Create Response Status: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Review created successfully!');
            console.log('New Review:', result.data);
            return true;
        } else {
            const error = await response.json();
            console.log('❌ Create failed:', error);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Create test failed:', error.message);
        return false;
    }
}

// Main test execution
async function runTests() {
    console.log('🚀 Starting Review Update Tests...\n');
    
    // First try to update existing review
    await testUpdateReview();
    
    // If no review exists, create one and then test update
    console.log('\n' + '='.repeat(50));
    console.log('If no review existed, let\'s create one and test update again...');
    
    const created = await testCreateReview();
    if (created) {
        console.log('\n' + '='.repeat(50));
        console.log('Now testing update on the newly created review...');
        await testUpdateReview();
    }
}

runTests();
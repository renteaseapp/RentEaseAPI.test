import axios from 'axios';

const API_BASE_URL = 'https://renteaseapi2.onrender.com/api';

// JWT Token ที่สร้างจาก generate-test-token.js
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IFVzZXIiLCJpc19hZG1pbiI6ZmFsc2UsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU5NDE4NjM2LCJleHAiOjE3NTk1MDUwMzZ9.Xh_8X192tNiRzWU3ZxqmW19tLkZZjiPPxrzFOK54nNg';

async function testCreateReviewAPI() {
  console.log('Testing createReview API endpoint...\n');
  
  // ตรวจสอบว่า server กำลังทำงานอยู่หรือไม่
  try {
    console.log('1. Checking if server is running...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log('✓ Server is running');
  } catch (error) {
    console.log('❌ Server is not running or health endpoint not available');
    console.log('Error:', error.message);
    return;
  }
  
  // ทดสอบ API endpoint
  try {
    console.log('\n2. Testing createReview API...');
    
    const reviewData = {
       rental_id: 75, // ใช้ rental ใหม่ที่สร้างขึ้น
       rating_product: 5,
       rating_owner: 4,
       comment: 'Test review from API test - New rental'
     };
    
    console.log('Request data:', JSON.stringify(reviewData, null, 2));
    console.log('Using JWT token for user ID: 39');
    
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('✓ Review created successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error creating review:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('Response headers:', error.response.headers);
    } else {
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
    }
  }
}

// รันการทดสอบ
testCreateReviewAPI();
import { generateToken } from './utils/jwt.utils.js';

// สร้าง test token สำหรับการทดสอบ API
function generateTestToken() {
  console.log('Generating test JWT token...\n');
  
  // ข้อมูลผู้ใช้ทดสอบ (ใช้ข้อมูลจริงจากฐานข้อมูล)
  const testUserPayload = {
    id: 39, // renter_id จากข้อมูลทดสอบ
    email: 'test@example.com',
    first_name: 'Test User',
    is_admin: false,
    role: 'user'
  };
  
  try {
    const token = generateToken(testUserPayload);
    
    console.log('✓ Test JWT Token generated successfully!');
    console.log('Token payload:', JSON.stringify(testUserPayload, null, 2));
    console.log('\nJWT Token:');
    console.log(token);
    console.log('\nUse this token in your API requests:');
    console.log(`Authorization: Bearer ${token}`);
    
    return token;
  } catch (error) {
    console.error('❌ Error generating token:', error);
    return null;
  }
}

// รันฟังก์ชัน
const token = generateTestToken();

export { generateTestToken };
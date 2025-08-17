import fetch from 'node-fetch';
import FormData from 'form-data';

const testProductCreation = async () => {
    try {
        const formData = new FormData();
        
        // Add basic product data
        formData.append('title', 'Test Product');
        formData.append('description', 'Test Description');
        formData.append('category_id', '1');
        formData.append('province_id', '1');
        formData.append('rental_price_per_day', '100.00');
        formData.append('quantity', '1');
        formData.append('availability_status', 'draft');
        
        console.log('Testing product creation...');
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        const response = await fetch('https://renteaseapi-test.onrender.com/api/products', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE'
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response body:', result);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testProductCreation();

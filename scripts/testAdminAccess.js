const axios = require('axios');

async function testAdminAccess() {
  try {
    console.log('Testing admin login...');
    
    // Login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@elearning.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    const token = loginResponse.data.token;
    
    // Now try to access the course with the token
    console.log('\nTesting course access with admin token...');
    const courseResponse = await axios.get('http://localhost:5000/api/courses/6938e5edc7984a3132b8a0da', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Course access successful!');
    console.log('Course title:', courseResponse.data.data.title);
    console.log('Course published status:', courseResponse.data.data.isPublished);
    
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminAccess();
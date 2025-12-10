const axios = require('axios');

async function testCourseAccess() {
  try {
    console.log('Testing Lisa login...');
    
    // Login as Lisa to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'lisa.anderson@elearning.com',
      password: 'mentor123'
    });
    
    console.log('Login successful!');
    const token = loginResponse.data.token;
    console.log('Token retrieved.');
    
    // Now try to access the course with the token
    console.log('\nTesting course access with Lisa\'s token...');
    const courseResponse = await axios.get('http://localhost:5000/api/courses/6938e5edc7984a3132b8a0da', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('SUCCESS! Course response received:');
    console.log('Status:', courseResponse.status);
    console.log('Course Title:', courseResponse.data.data.title);
    console.log('Creator ID:', courseResponse.data.data.creator._id);
    console.log('Approval Status:', courseResponse.data.data.approvalStatus);
    console.log('Is Published:', courseResponse.data.data.isPublished);
    console.log('Course Mentors:', courseResponse.data.data.mentors.map(m => m._id));
    
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCourseAccess();
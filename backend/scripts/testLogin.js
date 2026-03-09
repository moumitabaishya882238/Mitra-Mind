const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing admin login...');
    console.log('Email: sahidwork@gmail.com');
    console.log('Password: sahid123sahim');
    console.log('');

    const response = await axios.post('http://localhost:5000/auth/admin/login', {
      email: 'sahidwork@gmail.com',
      password: 'sahid123sahim'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('Set-Cookie header:', response.headers['set-cookie']);

  } catch (err) {
    console.error('❌ Login failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

testLogin();

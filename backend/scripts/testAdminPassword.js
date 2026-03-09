const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await Admin.findOne({ email: 'sahidwork@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    console.log('📧 Admin found:', admin.email);
    
    // Test password
    const isMatch = await admin.comparePassword('sahid123sahim');
    console.log('🔑 Password test result:', isMatch);

    if (!isMatch) {
      console.log('⚠️  Password does not match - updating password...');
      admin.password = 'sahid123sahim'; // Will be re-hashed by pre-save hook
      await admin.save();
      console.log('✅ Password updated successfully!');
      
      // Test again
      const admin2 = await Admin.findOne({ email: 'sahidwork@gmail.com' });
      const isMatchNow = await admin2.comparePassword('sahid123sahim');
      console.log('🔑 Password test after update:', isMatchNow);
    } else {
      console.log('✅ Password is correct!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testPassword();

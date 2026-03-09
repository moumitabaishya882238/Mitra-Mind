/**
 * Seed Script: Create Admin User
 * Run: node backend/scripts/createAdmin.js
 * 
 * Creates an admin user with credentials:
 * Email: sahidwork@gmail.com
 * Password: sahid123sahim
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mitra-mind';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'sahidwork@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists. Updating password...');
      existingAdmin.password = 'sahid123sahim'; // Will be hashed by pre-save hook
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin user
      console.log('📝 Creating new admin user...');
      const admin = new Admin({
        email: 'sahidwork@gmail.com',
        password: 'sahid123sahim', // Will be hashed by pre-save hook
        name: 'Sahid',
        role: 'super-admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Email: sahidwork@gmail.com');
    console.log('🔑 Password: sahid123sahim');
    console.log('\n✨ You can now login at the admin portal!');

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:');
    console.error(err);
    process.exit(1);
  }
};

createAdmin();

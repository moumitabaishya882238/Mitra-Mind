const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Listener = require('../models/Listener');

async function viewListeners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const listeners = await Listener.find({}).lean();
    
    if (listeners.length === 0) {
      console.log('❌ No listeners found in database');
    } else {
      console.log(`📋 Found ${listeners.length} listener(s):\n`);
      
      listeners.forEach((listener, index) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Listener #${index + 1}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`ID: ${listener._id}`);
        console.log(`Name: ${listener.name}`);
        console.log(`Email: ${listener.email}`);
        console.log(`Phone: ${listener.phone}`);
        console.log(`Role: ${listener.role}`);
        console.log(`Verification Status: ${listener.verificationStatus}`);
        console.log(`Training Completed: ${listener.trainingCompleted}`);
        console.log(`Availability: ${listener.availabilityStatus}`);
        console.log(`Location: ${listener.city}, ${listener.state}, ${listener.country}`);
        console.log(`Created: ${listener.createdAt}`);
        console.log(`Source Application ID: ${listener.sourceApplicationId || 'N/A'}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

viewListeners();

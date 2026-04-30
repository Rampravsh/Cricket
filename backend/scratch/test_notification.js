const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');
const { sendNotification } = require('../src/modules/notification/notification.service');

async function testAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users who have at least one token
    const users = await User.find({ 
      fcmTokens: { $exists: true, $not: { $size: 0 } } 
    });
    
    if (users.length === 0) {
      console.log('No users found with any tokens. Please log in on physical devices first.');
      process.exit(0);
    }

    console.log(`Found ${users.length} users with tokens. Sending "hii" to all...\n`);

    for (const user of users) {
      const token = user.fcmTokens[0];
      console.log(`Processing: ${user.email} (${user._id})`);
      
      if (token.startsWith('ExponentPushToken')) {
        console.warn(`  ⚠️  User has Expo token. Direct FCM (backend) might not deliver this.`);
      }

      try {
        const notification = await sendNotification({
          userId: user._id,
          type: 'info',
          title: 'System Check',
          message: 'hii',
          meta: { test: true }
        });
        console.log(`  ✅ Notification sent/queued. ID: ${notification._id}`);
      } catch (err) {
        console.error(`  ❌ Failed to send to ${user.email}:`, err.message);
      }
    }

    console.log('\n--- Broadcast Complete ---');
    console.log('Check backend console for FCM delivery logs and frontend apps for "hii".');
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testAll();

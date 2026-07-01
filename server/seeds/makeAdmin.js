const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena');
    console.log('MongoDB Connected...');

    // We can just upgrade all existing users to admin for testing purposes
    // Or you can specify an email
    const result = await User.updateMany({}, { role: 'admin' });
    
    console.log(`Successfully upgraded ${result.modifiedCount} users to Admin role.`);

    process.exit();
  } catch (error) {
    console.error('Error with script:', error);
    process.exit(1);
  }
};

makeAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const createAdminAccount = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena');
    console.log('MongoDB Connected...');

    const adminEmail = 'admin@codearena.com';
    const adminPassword = 'adminpassword123';

    // Check if user already exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin account already exists.');
    } else {
      admin = await User.create({
        fullName: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        dob: new Date('1990-01-01'),
        role: 'admin'
      });
      console.log('Created new Admin account successfully!');
    }

    console.log('Admin Email:', adminEmail);
    console.log('Admin Password:', adminPassword);

    process.exit();
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
};

createAdminAccount();

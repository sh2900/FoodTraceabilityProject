const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const users = [
  { username: 'admin', password: 'password123', role: 'admin', isApproved: true },
  { username: 'farmer1', password: 'password123', role: 'farmer', isApproved: true },
  { username: 'transporter1', password: 'password123', role: 'transporter', isApproved: true },
  { username: 'warehouse1', password: 'password123', role: 'warehouse', isApproved: true },
  { username: 'retailer1', password: 'password123', role: 'retailer', isApproved: true }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // Add new users
    for (let u of users) {
      const user = new User(u);
      await user.save();
      console.log(`Created user: ${u.username} (${u.role})`);
    }

    console.log('Seeding complete! Use "password123" for all accounts.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();

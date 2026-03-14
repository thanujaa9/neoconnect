const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const users = [
  { name: 'Staff User', email: 'staff@test.com', password: 'password123', role: 'staff', department: 'Engineering' },
  { name: 'Secretariat User', email: 'secret@test.com', password: 'password123', role: 'secretariat', department: 'HR' },
  { name: 'Case Manager', email: 'manager@test.com', password: 'password123', role: 'case_manager', department: 'HR' },
  { name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'admin', department: 'IT' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  await User.deleteMany({});
  for (const u of users) {
    u.password = await bcrypt.hash(u.password, 10);
    await User.create(u);
    console.log(`Created: ${u.email}`);
  }
  console.log('Seeding done!');
  process.exit();
});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../dist/src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@taskflow.com' });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      roles: ['super_admin', 'admin'],
      permissions: [
        'create_user',
        'delete_user',
        'update_user',
        'create_role',
        'delete_role',
        'manage_permissions',
        'view_all',
        'edit_all',
        'delete_all'
      ],
      isSuperAdmin: true,
      status: 'active',
      role: 'System Administrator',
      department: 'IT',
      location: 'Headquarters'
    });

    await adminUser.save();
    console.log('Default admin user created successfully!');
    console.log('Email: admin@taskflow.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedAdminUser();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../dist/models/User');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/taskmanagement?authSource=admin';
        console.log('Using MongoDB URI:', mongoUri);

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connection successful');

        // Check if users exist
        const users = await User.find({});
        console.log(`Found ${users.length} users in database`);

        if (users.length === 0) {
            console.log('🔧 Creating test user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);

            const testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                roles: ['admin']
            });

            console.log('✅ Test user created:', testUser.email);
        } else {
            console.log('📋 Existing users:');
            users.forEach(user => {
                console.log(`- ${user.email} (${user._id})`);
            });
        }

        // Test password comparison with first user
        if (users.length > 0) {
            const testUser = users[0];
            console.log('🔑 Testing password comparison...');
            const passwordMatch = await bcrypt.compare('password', testUser.password || '');
            console.log('Password match result:', passwordMatch);
        }

        await mongoose.disconnect();
        console.log('✅ Test completed successfully');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testConnection();
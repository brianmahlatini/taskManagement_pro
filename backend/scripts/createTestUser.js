const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./dist/models/User').default;

async function createTestUser() {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/taskmanagement?authSource=admin';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connection successful');

        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('✅ Test user already exists:', existingUser.email);
            console.log('User ID:', existingUser._id);
            return;
        }

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
        console.log('User ID:', testUser._id);
        console.log('Password hash:', testUser.password ? 'set' : 'not set');

        // Test password comparison
        const passwordMatch = await bcrypt.compare('password', testUser.password || '');
        console.log('Password verification test:', passwordMatch ? '✅ PASS' : '❌ FAIL');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

createTestUser();
const { MongoClient } = require('mongodb');

async function setupMongoUser() {
    try {
        console.log('🔧 Setting up MongoDB user and permissions...');

        // Connect to admin database with root credentials
        const adminUri = 'mongodb://root:example@mongo:27017/admin?authSource=admin';
        const adminClient = new MongoClient(adminUri);
        await adminClient.connect();

        const adminDb = adminClient.db('admin');

        // Check if taskmanagement user already exists
        const users = await adminDb.command({ usersInfo: { user: 'taskuser', db: 'taskmanagement' } });
        console.log('Current users:', users.users.length > 0 ? users.users : 'None');

        if (users.users.length === 0) {
            console.log('🔑 Creating taskmanagement user...');

            // Create user in taskmanagement database
            const taskDb = adminClient.db('taskmanagement');

            await adminDb.command({
                createUser: 'taskuser',
                pwd: 'taskpassword',
                roles: [
                    { role: 'readWrite', db: 'taskmanagement' },
                    { role: 'dbAdmin', db: 'taskmanagement' }
                ]
            });

            console.log('✅ User created successfully');
        } else {
            console.log('✅ User already exists');
        }

        // Test connection with new user
        console.log('🧪 Testing connection with taskmanagement user...');
        const taskUri = 'mongodb://taskuser:taskpassword@mongo:27017/taskmanagement?authSource=taskmanagement';
        const taskClient = new MongoClient(taskUri);

        try {
            await taskClient.connect();
            const testDb = taskClient.db('taskmanagement');

            // Test find operation
            const collections = await testDb.listCollections().toArray();
            console.log('✅ Connection and find operations work!');

            // Create test user if none exists
            const usersCollection = testDb.collection('users');
            const existingUser = await usersCollection.findOne({ email: 'test@example.com' });

            if (!existingUser) {
                console.log('🔧 Creating test user...');
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password', salt);

                await usersCollection.insertOne({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: hashedPassword,
                    roles: ['admin'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log('✅ Test user created');
            } else {
                console.log('✅ Test user already exists');
            }
        } catch (error) {
            console.error('❌ Task user connection failed:', error.message);
        } finally {
            await taskClient.close();
        }

        await adminClient.close();
        console.log('🎉 Setup completed');
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

setupMongoUser();
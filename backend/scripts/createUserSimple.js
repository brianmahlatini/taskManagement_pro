const { MongoClient } = require('mongodb');

async function createUser() {
    try {
        console.log('Connecting to MongoDB admin...');

        // Connect to admin database with root credentials
        const adminUri = 'mongodb://root:example@localhost:27018/admin';
        const client = new MongoClient(adminUri);
        await client.connect();

        const adminDb = client.db('admin');

        // Create user in the taskmanagement database
        console.log('Creating user in taskmanagement database...');
        await adminDb.command({
            createUser: 'taskuser',
            pwd: 'taskpassword',
            roles: [
                { role: 'readWrite', db: 'taskmanagement' },
                { role: 'dbAdmin', db: 'taskmanagement' }
            ]
        });

        console.log('✅ User created successfully');

        // Test the connection with the new user
        console.log('Testing connection with new user...');
        const taskUri = 'mongodb://taskuser:taskpassword@localhost:27018/taskmanagement';
        const taskClient = new MongoClient(taskUri);
        await taskClient.connect();

        const taskDb = taskClient.db('taskmanagement');
        const collections = await taskDb.listCollections().toArray();
        console.log('✅ Connection works! Collections:', collections.map(c => c.name));

        // Create a test user
        const usersCollection = taskDb.collection('users');
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
        await taskClient.close();
        await client.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

createUser();
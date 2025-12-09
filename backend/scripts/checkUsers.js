const { MongoClient } = require('mongodb');

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB admin...');

        // Connect to admin database with root credentials
        const adminUri = 'mongodb://root:example@localhost:27018/admin';
        const client = new MongoClient(adminUri);
        await client.connect();

        const adminDb = client.db('admin');

        // Check all users
        console.log('Checking all users...');
        const users = await adminDb.command({ usersInfo: 1 });
        console.log('All users:', JSON.stringify(users.users, null, 2));

        // Try to authenticate with taskuser
        console.log('Testing taskuser authentication...');
        const taskUri = 'mongodb://taskuser:taskpassword@localhost:27018/taskmanagement?authSource=taskmanagement';
        const taskClient = new MongoClient(taskUri);
        await taskClient.connect();

        const taskDb = taskClient.db('taskmanagement');
        const collections = await taskDb.listCollections().toArray();
        console.log('✅ Taskuser authentication works! Collections:', collections.map(c => c.name));

        await taskClient.close();
        await client.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

checkUsers();
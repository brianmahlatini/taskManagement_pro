import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Determine the appropriate MongoDB URI based on environment
        let mongoUri = process.env.MONGO_URI;

        // If no MONGO_URI is set in environment variables, use appropriate defaults
        if (!mongoUri) {
            // Check if we're running in Docker (mongo service available)
            // or locally (localhost)
            const isDocker = process.env.DOCKER_ENV === 'true' ||
                           process.env.NODE_ENV === 'docker';

            if (isDocker) {
                // Docker environment - use service name
                mongoUri = 'mongodb://taskuser:taskpassword@mongo:27017/taskmanagement?authSource=taskmanagement';
                console.log('Running in Docker environment - using mongo service');
            } else {
                // Local development - use localhost
                mongoUri = 'mongodb://localhost:27017/taskmanagement';
                console.log('Running in local environment - using localhost MongoDB');
            }
        }

        console.log('Connecting to MongoDB with URI:', mongoUri);
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('MongoDB Connection State:', conn.connection.readyState);
    } catch (error: any) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Full error:', error);

        // Provide helpful guidance for common connection issues
        if (error.message.includes('EAI_AGAIN') || error.message.includes('getaddrinfo')) {
            console.error('\n🚨 Connection Issue Detected:');
            console.error('This typically means MongoDB is not running or the connection string is incorrect.');

            if (error.message.includes('mongo')) {
                console.error('📝 Solution: You are trying to connect to "mongo" host (Docker service)');
                console.error('   but MongoDB is not running in Docker mode.');
                console.error('   Either:');
                console.error('   1. Start Docker containers with: docker-compose up');
                console.error('   2. Or create a .env file with: MONGO_URI=mongodb://localhost:27017/taskmanagement');
            } else {
                console.error('📝 Solution: Make sure MongoDB is running locally.');
                console.error('   You can start it with:');
                console.error('   1. mongod (if MongoDB is installed locally)');
                console.error('   2. Or use Docker: docker-compose up mongo');
            }
        }

        process.exit(1);
    }
};

export default connectDB;

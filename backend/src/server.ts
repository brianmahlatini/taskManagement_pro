import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';
import listRoutes from './routes/lists';
import cardRoutes from './routes/cards';
import commentRoutes from './routes/comments';
import activityRoutes from './routes/activities';
import searchRoutes from './routes/search';
import uploadRoutes from './routes/upload';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import messageRoutes from './routes/messages';
import documentRoutes from './routes/documents';
import archiveRoutes from './routes/archive';
import teamRoutes from './routes/teams';
import teamPerformanceRoutes from './routes/teamPerformance';
import invitationRoutes from './routes/invitations';
import rateLimit from 'express-rate-limit';
import path from 'path';

dotenv.config();

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');
console.log('CLIENT_URL:', process.env.CLIENT_URL);

connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy headers from nginx
app.set('trust proxy', true);

import { socketHandler } from './socket/socketHandler';

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Configure Redis adapter for Socket.IO scaling
// Temporarily disabled Redis to get backend running
// if (process.env.REDIS_URL) {
//     try {
//         const { createAdapter } = require('socket.io-redis');
//         const redisAdapter = createAdapter(process.env.REDIS_URL);
//         io.adapter(redisAdapter);
//         console.log('Using Redis adapter for Socket.IO scaling');
//     } catch (error: unknown) {
//         console.error('Failed to connect to Redis, falling back to in-memory adapter:', (error as Error).message);
//         console.log('Redis not available, using in-memory adapter');
//     }
// } else {
    console.log('Redis not configured, using in-memory adapter');
// }

socketHandler(io);

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-performance', teamPerformanceRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/users', userRoutes);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

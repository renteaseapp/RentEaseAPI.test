import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import serverConfig from './config/server.config.js';
import './db/supabaseClient.js'; 

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import NotificationService from './services/notification.service.js';

dotenv.config(); // Load .env variables

const app = express();

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies if your frontend needs to send them
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Log request body for debugging
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to RentEase API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            api: '/api',
            health: '/api/health',
            documentation: 'Coming soon...'
        },
        timestamp: new Date().toISOString()
    });
});

// API route
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'RentEase API',
        version: '1.0.0',
        status: 'running',
        availableEndpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            categories: '/api/categories',
            rentals: '/api/rentals',
            owners: '/api/owners',
            renters: '/api/renters',
            claims: '/api/claims',
            chat: '/api/chat',
            notifications: '/api/notifications',
            admin: '/api/admin',
            complaints: '/api/complaints',
            health: '/api/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Main API Router
app.use('/api', routes);

// Centralized Error Handler
app.use(errorHandler);

// --- Socket.IO setup ---
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
    });

    socket.on('send_message', (message) => {
        io.to(`conversation_${message.conversation_id}`).emit('new_message', message);
    });

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// เพิ่มฟังก์ชัน helper สำหรับ emit notification realtime
export function emitNotificationToUser(userId, notification) {
    io.to(`user_${userId}`).emit('new_notification', notification);
}

// Start server
server.listen(serverConfig.PORT, () => {
    console.log(`🚀 Server is running on port ${serverConfig.PORT} in ${serverConfig.NODE_ENV} mode.`);
    console.log(`🔗 Access at http://localhost:${serverConfig.PORT}`);
});

export { app, io };
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import serverConfig from './config/server.config.js';
import './db/supabaseClient.js'; 

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import jwtConfig from './config/jwt.config.js';

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

// Set Cross-Origin-Opener-Policy header to allow popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

// Trust proxy to get real client IP
app.set('trust proxy', true);

// Middlewares
// Only parse JSON and URL-encoded bodies for non-multipart requests
app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
        // Skip body parsing for multipart requests - let multer handle it
        next();
    } else {
        // Parse JSON and URL-encoded bodies for other requests
        express.json()(req, res, next);
    }
});

app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
        // Skip body parsing for multipart requests - let multer handle it
        next();
    } else {
        // Parse URL-encoded bodies for other requests
        express.urlencoded({ extended: true })(req, res, next);
    }
});

// Log request body for debugging
app.use((req, res, next) => {
    console.log('🔍 Incoming request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
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

// --- Enhanced Socket.IO setup ---
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { 
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Socket authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        
        // Map the actual token payload to expected fields
        socket.userId = decoded.id; // Token has 'id', not 'userId'
        socket.userRole = decoded.role || 'user'; // Default to 'user' if role not present
        socket.isAdmin = decoded.is_admin || false; // Token has 'is_admin', not 'isAdmin'
        
        console.log('Socket auth successful:', {
            userId: socket.userId,
            userRole: socket.userRole,
            isAdmin: socket.isAdmin
        });
        
        next();
    } catch (error) {
        console.error('Socket authentication failed:', error.message);
        next(new Error('Invalid authentication token'));
    }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    const isAdmin = socket.isAdmin;

    console.log(`User connected: ${socket.id} (User ID: ${userId}, Role: ${userRole})`);

    // Store user connection
    connectedUsers.set(userId, {
        socketId: socket.id,
        role: userRole,
        isAdmin: isAdmin,
        connectedAt: new Date()
    });

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Join role-specific rooms
    if (isAdmin) {
        socket.join('admin_room');
        console.log(`Admin ${userId} joined admin room`);
    }
    if (userRole === 'owner') {
        socket.join('owner_room');
        console.log(`Owner ${userId} joined owner room`);
    }
    if (userRole === 'renter') {
        socket.join('renter_room');
        console.log(`Renter ${userId} joined renter room`);
    }

    // Join general room
    socket.join('general_room');

    // Chat functionality
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
    });

    socket.on('send_message', (message) => {
        io.to(`conversation_${message.conversation_id}`).emit('new_message', message);
    });

    // Product events
    socket.on('join_product', (productId) => {
        socket.join(`product_${productId}`);
        console.log(`User ${userId} joined product ${productId}`);
    });

    socket.on('leave_product', (productId) => {
        socket.leave(`product_${productId}`);
        console.log(`User ${userId} left product ${productId}`);
    });

    // Rental events
    socket.on('join_rental', (rentalId) => {
        socket.join(`rental_${rentalId}`);
        console.log(`User ${userId} joined rental ${rentalId}`);
    });

    socket.on('leave_rental', (rentalId) => {
        socket.leave(`rental_${rentalId}`);
        console.log(`User ${userId} left rental ${rentalId}`);
    });

    // User presence
    socket.on('user_online', () => {
        io.to('general_room').emit('user_status_changed', {
            userId: userId,
            status: 'online',
            timestamp: new Date().toISOString()
        });
    });

    // Typing indicators for chat
    socket.on('typing_start', (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
            userId: userId,
            conversationId: conversationId,
            isTyping: true
        });
    });

    socket.on('typing_stop', (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
            userId: userId,
            conversationId: conversationId,
            isTyping: false
        });
    });

    // Read receipts for chat
    socket.on('message_read', (data) => {
        io.to(`conversation_${data.conversationId}`).emit('message_read_receipt', {
            userId: userId,
            conversationId: data.conversationId,
            messageId: data.messageId,
            readAt: new Date().toISOString()
        });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (User ID: ${userId})`);
        
        // Remove from connected users
        connectedUsers.delete(userId);

        // Notify others about user going offline
        io.to('general_room').emit('user_status_changed', {
            userId: userId,
            status: 'offline',
            timestamp: new Date().toISOString()
        });
    });
});

// Enhanced realtime event emitters
export function emitNotificationToUser(userId, notification) {
    io.to(`user_${userId}`).emit('new_notification', notification);
}

export function emitNotificationToRole(role, notification) {
    io.to(`${role}_room`).emit('new_notification', notification);
}

export function emitNotificationToAdmins(notification) {
    io.to('admin_room').emit('new_notification', notification);
}

export function emitProductUpdate(productId, productData) {
    io.to(`product_${productId}`).emit('product_updated', productData);
    io.to('general_room').emit('product_updated', productData);
}

export function emitProductCreated(productData) {
    io.to('general_room').emit('product_created', productData);
}

export function emitProductDeleted(productId) {
    io.to('general_room').emit('product_deleted', productId);
}

export function emitRentalUpdate(rentalId, rentalData) {
    io.to(`rental_${rentalId}`).emit('rental_updated', rentalData);
    io.to('general_room').emit('rental_updated', rentalData);
}

export function emitRentalCreated(rentalData) {
    io.to('general_room').emit('rental_created', rentalData);
}

export function emitReviewUpdate(reviewId, reviewData) {
    io.to('general_room').emit('review_updated', reviewData);
}

export function emitReviewCreated(reviewData) {
    io.to('general_room').emit('review_created', reviewData);
}

export function emitReviewDeleted(reviewId) {
    io.to('general_room').emit('review_deleted', reviewId);
}



export function emitUserUpdate(userId, userData) {
    io.to(`user_${userId}`).emit('user_updated', userData);
    io.to('general_room').emit('user_updated', userData);
}

export function emitQuantityUpdate(productId, quantityData) {
    io.to(`product_${productId}`).emit('quantity_updated', quantityData);
    io.to('general_room').emit('quantity_updated', quantityData);
}

export function emitSystemAlert(message, type = 'info') {
    io.to('general_room').emit('system_alert', {
        message,
        type,
        timestamp: new Date().toISOString()
    });
}

// Helper function to get connected users
export function getConnectedUsers() {
    return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
        userId,
        ...data
    }));
}

// Helper function to check if user is online
export function isUserOnline(userId) {
    return connectedUsers.has(userId);
}

// Start server
server.listen(serverConfig.PORT, () => {
    console.log(`🚀 Server is running on port ${serverConfig.PORT} in ${serverConfig.NODE_ENV} mode.`);
    console.log(`🔗 Access at http://localhost:${serverConfig.PORT}`);
    console.log(`🔌 Socket.IO server is ready for realtime connections`);
});

export { app, io };

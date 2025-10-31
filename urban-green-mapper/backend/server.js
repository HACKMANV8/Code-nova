// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Database Connection
import connectDB from './config/db.js';

// --- MOCK Route Imports (Replace with actual files later) ---
// NOTE: These files must exist in your routes/ folder, even if empty, for server.js to run without errors.
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';
import greenzonesRoutes from './routes/greenzones.js';
import aiDetectionRoutes from './routes/aiDetection.js';
import dashboardRoutes from './routes/dashboard.js';
// -----------------------------------------------------------

// Load environment variables from .env file
dotenv.config();

// 1. Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// --- 2. Socket.io Initialization and Export ---
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL, // Allow access from frontend
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Example real-time event listeners
io.on('connection', (socket) => {
    console.log(`WebSocket connected: ${socket.id}`);

    // Example handler for a new report submitted
    socket.on('submit-report', (data) => {
        console.log('New report received:', data);
        // Logic to save to DB, then broadcast:
        // io.emit('new-greenzone', data);
    });

    socket.on('disconnect', () => {
        console.log(`WebSocket disconnected: ${socket.id}`);
    });
});

// Export the io instance so routes/controllers can use it to emit events
export { io };
// -----------------------------------------------------------


// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: true })); // Body parser for form data

// Serve uploads folder statically (for AI results, verified images, etc.)
app.use('/uploads', express.static('uploads'));

// --- 3. Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/greenzones', greenzonesRoutes);
app.use('/api/ai', aiDetectionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// General catch-all route for unhandled API endpoints
app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// Server Start
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import verificationRoutes from "./routes/verificationRoutes.js";

// Import Routes
import authRoutes from './routes/authRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import greenZoneRoutes from './routes/greenZoneRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Required for ES module path handling (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
// This function will exit the process if connection fails, as defined in config/db.js
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend access (allows frontend on 3000/5173 to talk to backend on 5000)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Frontend Serving (For production deployment) ---

// Serve static frontend files (assuming your frontend build will be placed in a directory like 'frontend/build' or 'dist')
// IMPORTANT: This currently serves files from the backend directory (__dirname). Adjust the path in production!
// Example adjustment for serving from a 'public' folder: app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Serve index.html file for root access
app.get('/', (req, res) => {
  // Assuming 'index.html' is in the root of the backend directory for this demo
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    message: '🌿 Urban Green Mapper API is running',
    version: '1.0.0',
    status: 'active'
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/greenzones', greenZoneRoutes);
app.use('/api', aiRoutes); // Note: AI routes often sit at the root /api or /api/ai
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/verification", verificationRoutes); // ✅ Add here


// Example test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!' });
});

// --- Error Handling ---

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.originalUrl}` 
  });
});

// Global Error Handler (handles errors passed to next(), e.g., from express-async-handler)
app.use((err, req, res, next) => {
  // Determine the status code, default to 500 if undefined
  const statusCode = err.status || res.statusCode === 200 ? 500 : res.statusCode; 
  
  console.error('Global Error:', err.message, err.stack);
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show stack trace in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});

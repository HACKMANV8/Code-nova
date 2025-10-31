// backend/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Ensure dotenv is configured for MONGO_URI access

/**
 * Connects to the MongoDB database using Mongoose.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;
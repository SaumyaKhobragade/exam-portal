// Initialize homepage stats with default data
import mongoose from 'mongoose';
import HomepageStats from './src/models/homepageStats.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeHomepageStats() {
    try {
        // Connect to MongoDB using environment variables
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Check if homepage stats already exist
        const existingStats = await HomepageStats.findOne();
        if (existingStats) {
            console.log('Homepage stats already exist:', existingStats);
            return;
        }

        // Create initial homepage stats
        const initialStats = new HomepageStats({
            studentsAssessed: 25000,
            institutions: 150,
            uptime: 99.9,
            heroTitle: "Empower Your Institution with Smart Online Examinations",
            heroDescription: "Experience the future of education with our comprehensive online examination platform. Conduct secure, efficient, and scalable assessments that adapt to your institution's unique needs."
        });

        await initialStats.save();
        console.log('Initial homepage stats created successfully:', initialStats);

    } catch (error) {
        console.error('Error initializing homepage stats:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

initializeHomepageStats();

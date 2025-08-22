// Quick test to check database counts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from './src/utils/constants.js';
import User from './src/models/user.model.js';
import Admin from './src/models/admin.model.js';
import Exam from './src/models/exam.model.js';
import HomepageStats from './src/models/homepageStats.model.js';

dotenv.config();

async function checkDatabaseCounts() {
    try {
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB\n');

        const userCount = await User.countDocuments();
        const adminCount = await Admin.countDocuments();
        
        console.log('📊 Current Database Statistics:');
        console.log(`👥 Total Users (Students Assessed): ${userCount}`);
        console.log(`🏢 Total Admins (Institutions): ${adminCount}\n`);
        
        console.log('🔄 Testing real-time stats method...');
        const realTimeStats = await HomepageStats.getRealTimeStats();
        console.log('Real-time stats:', {
            studentsAssessed: realTimeStats.studentsAssessed,
            institutions: realTimeStats.institutions,
            uptime: realTimeStats.uptime,
            heroTitle: realTimeStats.heroTitle?.substring(0, 50) + '...'
        });

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

checkDatabaseCounts();

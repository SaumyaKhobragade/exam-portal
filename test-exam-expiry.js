import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import { getExamStatus } from './src/utils/examUtils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testExamExpiry() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import models
        const Exam = (await import('./src/models/exam.model.js')).default;
        
        // Get all exams
        const exams = await Exam.find({});
        
        console.log('=== EXAM EXPIRY TEST ===');
        console.log('Current time:', new Date().toISOString());
        console.log('');
        
        if (exams.length > 0) {
            exams.forEach((exam, index) => {
                console.log(`--- Exam ${index + 1}: ${exam.title} ---`);
                console.log('Start Time:', exam.startDateTime);
                console.log('Duration:', exam.duration, 'minutes');
                console.log('Status:', exam.status);
                
                const status = getExamStatus(exam);
                console.log('End Time:', status.endTime);
                console.log('Is Active:', status.isActive);
                console.log('Is Past (Expired):', status.isPast);
                console.log('Is Future:', status.isFuture);
                console.log('Is Draft:', status.isDraft);
                
                if (status.timeRemaining > 0) {
                    const minutes = Math.floor(status.timeRemaining / (1000 * 60));
                    const hours = Math.floor(minutes / 60);
                    console.log(`Time Remaining: ${hours}h ${minutes % 60}m`);
                } else {
                    console.log('Time Remaining: 0 (Expired)');
                }
                
                console.log('Will be shown to users:', !status.isPast && (status.isActive || status.isFuture || status.isDraft));
                console.log('');
            });
        } else {
            console.log('No exams found');
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testExamExpiry();

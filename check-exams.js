import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkExams() {
    try {
        // Connect to MongoDB using environment variables
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import all models to register them
        const Exam = (await import('./src/models/exam.model.js')).default;
        const Admin = (await import('./src/models/admin.model.js')).default;
        const User = (await import('./src/models/user.model.js')).default;
        const Owner = (await import('./src/models/owner.model.js')).default;
        
        // Find all exams without populate first to avoid schema issues
        const exams = await Exam.find({}).sort({ createdAt: -1 });
        
        console.log('=== EXAMS DATABASE CHECK ===');
        console.log('Total exams found:', exams.length);
        console.log('');
        
        if (exams.length > 0) {
            for (let i = 0; i < exams.length; i++) {
                const exam = exams[i];
                console.log(`--- Exam ${i + 1} ---`);
                console.log('ID:', exam._id.toString());
                console.log('Title:', exam.title);
                console.log('Description:', exam.description);
                console.log('Start Date/Time:', exam.startDateTime);
                console.log('Duration:', exam.duration, 'minutes');
                console.log('Status:', exam.status);
                console.log('Questions Count:', exam.questions ? exam.questions.length : 0);
                console.log('Total Marks:', exam.totalMarks);
                console.log('Admin ID:', exam.adminId);
                console.log('Owner ID:', exam.ownerId);
                
                // Try to get admin info
                if (exam.adminId) {
                    try {
                        const admin = await Admin.findById(exam.adminId);
                        if (admin) {
                            console.log('Created by Admin:', admin.fullname || admin.username);
                            console.log('Admin Domain:', admin.domain);
                        }
                    } catch (err) {
                        console.log('Could not fetch admin info');
                    }
                }
                
                console.log('Created At:', exam.createdAt);
                console.log('Updated At:', exam.updatedAt);
                console.log('');
            }
        } else {
            console.log('❌ No exams found in the database.');
            console.log('');
            console.log('Suggestions:');
            console.log('1. Create exams through the admin dashboard');
            console.log('2. Check if admins are properly set up');
            console.log('3. Verify database connection');
        }
        
        // Also check related collections
        const adminCount = await Admin.countDocuments();
        const userCount = await User.countDocuments();
        
        console.log('=== RELATED COLLECTIONS ===');
        console.log('Total Admins:', adminCount);
        console.log('Total Users:', userCount);
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error checking exams:', error);
        process.exit(1);
    }
}

checkExams();

import mongoose from 'mongoose';
import Exam from './src/models/exam.model.js';
import Admin from './src/models/admin.model.js';
import User from './src/models/user.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment
const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Check users
        const users = await User.find().select('username email domain');
        console.log('\n=== USERS ===');
        users.forEach(user => {
            console.log(`${user.username} (${user.email}) - Domain: ${user.domain}`);
        });

        // Check admins
        const admins = await Admin.find().select('username email domain organization');
        console.log('\n=== ADMINS ===');
        admins.forEach(admin => {
            console.log(`${admin.username} (${admin.email}) - Domain: ${admin.domain}, Org: ${admin.organization}`);
        });

        // Check exams
        const exams = await Exam.find().select('title status startDateTime duration adminId');
        console.log('\n=== EXAMS ===');
        
        if (exams.length === 0) {
            console.log('No exams found in database!');
        } else {
            for (const exam of exams) {
                const now = new Date();
                const startTime = new Date(exam.startDateTime);
                const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
                
                console.log(`\nExam: ${exam.title}`);
                console.log(`  Status: ${exam.status}`);
                console.log(`  Start: ${startTime.toISOString()}`);
                console.log(`  End: ${endTime.toISOString()}`);
                console.log(`  Now: ${now.toISOString()}`);
                console.log(`  Admin ID: ${exam.adminId}`);
                console.log(`  Time State: ${now < startTime ? 'FUTURE' : now > endTime ? 'PAST' : 'CURRENT'}`);
                console.log(`  Can Start: ${now >= startTime && now <= endTime && exam.status === 'active'}`);
            }
        }

        // Test the exam fetching function
        console.log('\n=== TESTING EXAM FETCH FOR example.com ===');
        
        // Find admins for example.com domain
        const domainAdmins = await Admin.find({ domain: 'example.com' }).select('_id username');
        console.log(`Found ${domainAdmins.length} admins for example.com domain:`);
        domainAdmins.forEach(admin => console.log(`  - ${admin.username} (${admin._id})`));
        
        const adminIds = domainAdmins.map(admin => admin._id);
        
        // Find exams created by these admins
        const domainExams = await Exam.find({
            adminId: { $in: adminIds },
            status: { $in: ['active', 'completed'] }
        }).select('title status startDateTime duration');
        
        console.log(`Found ${domainExams.length} exams for example.com domain (active/completed):`);
        domainExams.forEach(exam => {
            console.log(`  - ${exam.title} (${exam.status})`);
        });

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkDatabase();

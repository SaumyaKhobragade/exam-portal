// Script to create sample exam results for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamResult from './src/models/examResult.model.js';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://saptanshuwanjari63:Saptanshu%4012@cluster0.zwapfm8.mongodb.net/testing');
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

async function createSampleResults() {
    try {
        console.log('Creating sample exam results...');
        
        // You'll need to replace these with actual user and exam IDs from your database
        const sampleUserId = new mongoose.Types.ObjectId(); // Replace with actual user ID
        const sampleExamId1 = new mongoose.Types.ObjectId(); // Replace with actual exam ID
        const sampleExamId2 = new mongoose.Types.ObjectId(); // Replace with actual exam ID
        const sampleExamId3 = new mongoose.Types.ObjectId(); // Replace with actual exam ID
        
        const sampleResults = [
            {
                userId: sampleUserId,
                examId: sampleExamId1,
                examTitle: "JavaScript Fundamentals",
                startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
                duration: 60,
                timeTaken: 45,
                status: 'completed',
                totalScore: 92,
                maxScore: 100,
                questionsAttempted: 12,
                totalQuestions: 12,
                questionResults: [
                    {
                        questionId: new mongoose.Types.ObjectId(),
                        questionTitle: "Array Methods",
                        userCode: "function solution(arr) { return arr.map(x => x * 2); }",
                        testResults: [
                            { testCaseIndex: 0, passed: true, expectedOutput: "[2,4,6]", actualOutput: "[2,4,6]" },
                            { testCaseIndex: 1, passed: true, expectedOutput: "[10,20]", actualOutput: "[10,20]" }
                        ],
                        score: 10,
                        maxScore: 10,
                        isCompleted: true
                    }
                ]
            },
            {
                userId: sampleUserId,
                examId: sampleExamId2,
                examTitle: "Data Structures & Algorithms",
                startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000), // 75 minutes later
                duration: 90,
                timeTaken: 75,
                status: 'completed',
                totalScore: 78,
                maxScore: 100,
                questionsAttempted: 8,
                totalQuestions: 10,
                questionResults: []
            },
            {
                userId: sampleUserId,
                examId: sampleExamId3,
                examTitle: "SQL Database Queries",
                startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
                endTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 38 * 60 * 1000), // 38 minutes later
                duration: 45,
                timeTaken: 38,
                status: 'completed',
                totalScore: 95,
                maxScore: 100,
                questionsAttempted: 15,
                totalQuestions: 15,
                questionResults: []
            }
        ];
        
        // Insert sample results
        const insertedResults = await ExamResult.insertMany(sampleResults);
        console.log(`Created ${insertedResults.length} sample exam results`);
        
        // Display the created results
        insertedResults.forEach((result, index) => {
            console.log(`Sample Result ${index + 1}:`);
            console.log(`  Exam: ${result.examTitle}`);
            console.log(`  Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)`);
            console.log(`  Time: ${result.timeTaken} minutes`);
            console.log(`  Questions: ${result.questionsAttempted}/${result.totalQuestions}`);
            console.log(`  User ID: ${result.userId}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error creating sample results:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Instructions for manual setup
console.log('=== SAMPLE DATA CREATION SCRIPT ===');
console.log('');
console.log('To test the user results dashboard:');
console.log('1. First, get a real user ID from your database');
console.log('2. Get some real exam IDs from your database');
console.log('3. Update the sampleUserId and exam IDs in this script');
console.log('4. Run: node create-sample-results.js');
console.log('');
console.log('Alternatively, complete some actual exams through the interface');
console.log('to generate real results data.');
console.log('');

// Uncomment the following lines and update the IDs to actually create sample data
// connectDB().then(() => {
//     createSampleResults();
// });

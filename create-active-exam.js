import mongoose from 'mongoose';
import Exam from './src/models/exam.model.js';
import Admin from './src/models/admin.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment
const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;

async function createActiveExam() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find the test admin
        const testAdmin = await Admin.findOne({ email: 'testadmin@example.com' });
        if (!testAdmin) {
            console.log('Test admin not found. Run create-test-data.js first.');
            return;
        }

        // Create an active exam that's currently running
        const activeExamData = {
            title: 'Data Structures & Algorithms Challenge',
            description: 'Test your knowledge of data structures and algorithms',
            instructions: 'Solve all coding problems within the time limit. Use efficient algorithms.',
            startDateTime: new Date(Date.now() - 1000 * 60 * 10), // Started 10 minutes ago
            duration: 90, // 90 minutes
            status: 'active',
            adminId: testAdmin._id,
            ownerId: testAdmin._id,
            programmingLanguage: 'javascript',
            createdBy: {
                userId: testAdmin._id,
                userType: 'admin',
                name: testAdmin.fullname
            },
            questions: [
                {
                    title: 'Binary Search Implementation',
                    statement: 'Implement binary search algorithm to find target element in sorted array.',
                    inputFormat: 'First line: sorted array of integers. Second line: target integer.',
                    outputFormat: 'Index of target element, or -1 if not found.',
                    constraints: '1 ≤ array length ≤ 10^6, -10^9 ≤ elements ≤ 10^9',
                    weight: 25,
                    testCases: [
                        {
                            input: '[1, 3, 5, 7, 9, 11]\n7',
                            expectedOutput: '3'
                        },
                        {
                            input: '[2, 4, 6, 8, 10]\n5',
                            expectedOutput: '-1'
                        }
                    ]
                },
                {
                    title: 'Palindrome Check',
                    statement: 'Check if a given string is a palindrome (reads same forwards and backwards).',
                    inputFormat: 'A string of characters',
                    outputFormat: 'true if palindrome, false otherwise',
                    constraints: '1 ≤ string length ≤ 1000, case-insensitive',
                    weight: 15,
                    testCases: [
                        {
                            input: 'racecar',
                            expectedOutput: 'true'
                        },
                        {
                            input: 'hello',
                            expectedOutput: 'false'
                        }
                    ]
                }
            ]
        };

        // Check if active exam already exists
        let activeExam = await Exam.findOne({ title: activeExamData.title });
        if (!activeExam) {
            activeExam = new Exam(activeExamData);
            await activeExam.save();
            console.log('Created active exam:', activeExam.title);
        } else {
            // Update existing exam to be active and current
            activeExam.startDateTime = new Date(Date.now() - 1000 * 60 * 10);
            activeExam.status = 'active';
            await activeExam.save();
            console.log('Updated exam to be active:', activeExam.title);
        }

        // Also create a future exam
        const futureExamData = {
            title: 'Advanced JavaScript Concepts',
            description: 'Test advanced JavaScript features and concepts',
            instructions: 'Demonstrate mastery of advanced JS topics including closures, promises, and async/await.',
            startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // Starts in 2 hours
            duration: 75,
            status: 'active',
            adminId: testAdmin._id,
            ownerId: testAdmin._id,
            programmingLanguage: 'javascript',
            createdBy: {
                userId: testAdmin._id,
                userType: 'admin',
                name: testAdmin.fullname
            },
            questions: [
                {
                    title: 'Promise Chain',
                    statement: 'Create a promise chain that fetches user data and processes it.',
                    inputFormat: 'User ID as number',
                    outputFormat: 'Processed user object',
                    constraints: 'Use promises, no async/await',
                    weight: 20,
                    testCases: [
                        {
                            input: '123',
                            expectedOutput: '{"id": 123, "processed": true}'
                        }
                    ]
                }
            ]
        };

        let futureExam = await Exam.findOne({ title: futureExamData.title });
        if (!futureExam) {
            futureExam = new Exam(futureExamData);
            await futureExam.save();
            console.log('Created future exam:', futureExam.title);
        } else {
            console.log('Future exam already exists:', futureExam.title);
        }

        console.log('\n=== Exam Status Summary ===');
        console.log('Active exam (can start now):', activeExam.title);
        console.log('Future exam (starts in 2 hours):', futureExam.title);
        
    } catch (error) {
        console.error('Error creating active exam:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createActiveExam();

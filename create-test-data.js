import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/user.model.js';
import Admin from './src/models/admin.model.js';
import Exam from './src/models/exam.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment
const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;

async function createTestData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // 1. Create a test user
        const testUserData = {
            username: 'testuser',
            email: 'testuser@example.com',
            fullname: 'Test User',
            avatar: 'https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png',
            password: 'TestUser123!',
            domain: 'example.com'
        };

        // Check if user already exists
        let testUser = await User.findOne({ email: testUserData.email });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash(testUserData.password, 10);
            testUser = new User({
                ...testUserData,
                password: hashedPassword
            });
            await testUser.save();
            console.log('Created test user:', testUser.username);
        } else {
            console.log('Test user already exists:', testUser.username);
        }

        // 2. Create a test admin for the same domain
        const testAdminData = {
            username: 'testadmin',
            email: 'testadmin@example.com',
            fullname: 'Test Admin',
            password: 'TestAdmin123!',
            role: 'admin',
            organization: 'Example Organization',
            domain: 'example.com'
        };

        let testAdmin = await Admin.findOne({ email: testAdminData.email });
        if (!testAdmin) {
            const hashedPassword = await bcrypt.hash(testAdminData.password, 10);
            testAdmin = new Admin({
                ...testAdminData,
                password: hashedPassword
            });
            await testAdmin.save();
            console.log('Created test admin:', testAdmin.username);
        } else {
            console.log('Test admin already exists:', testAdmin.username);
        }

        // 3. Create a test exam
        const testExamData = {
            title: 'JavaScript Fundamentals Test',
            description: 'A basic test to evaluate JavaScript programming skills',
            instructions: 'Complete all questions within the time limit. Good luck!',
            startDateTime: new Date(Date.now() - 1000 * 60 * 60), // Started 1 hour ago
            duration: 60, // 60 minutes
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
                    title: 'Array Sum',
                    statement: 'Write a function that takes an array of numbers and returns their sum.',
                    inputFormat: 'An array of integers',
                    outputFormat: 'A single integer representing the sum',
                    constraints: '1 ≤ array length ≤ 1000, -1000 ≤ array[i] ≤ 1000',
                    weight: 10,
                    testCases: [
                        {
                            input: '[1, 2, 3, 4, 5]',
                            expectedOutput: '15'
                        },
                        {
                            input: '[-1, 0, 1]',
                            expectedOutput: '0'
                        }
                    ]
                },
                {
                    title: 'String Reversal',
                    statement: 'Write a function that reverses a given string.',
                    inputFormat: 'A string of characters',
                    outputFormat: 'The reversed string',
                    constraints: '1 ≤ string length ≤ 1000',
                    weight: 10,
                    testCases: [
                        {
                            input: 'hello',
                            expectedOutput: 'olleh'
                        },
                        {
                            input: 'world',
                            expectedOutput: 'dlrow'
                        }
                    ]
                }
            ]
        };

        let testExam = await Exam.findOne({ title: testExamData.title });
        if (!testExam) {
            testExam = new Exam(testExamData);
            await testExam.save();
            console.log('Created test exam:', testExam.title);
        } else {
            console.log('Test exam already exists:', testExam.title);
        }

        // 4. Create another exam that's completed
        const completedExamData = {
            title: 'Python Basics Challenge',
            description: 'Test your Python programming fundamentals',
            instructions: 'Solve the coding problems using Python',
            startDateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // Started 1 week ago
            duration: 45,
            status: 'completed',
            adminId: testAdmin._id,
            ownerId: testAdmin._id,
            programmingLanguage: 'python',
            createdBy: {
                userId: testAdmin._id,
                userType: 'admin',
                name: testAdmin.fullname
            },
            questions: [
                {
                    title: 'List Comprehension',
                    statement: 'Create a list of squares of even numbers from 1 to 10.',
                    inputFormat: 'No input required',
                    outputFormat: 'A list of squared even numbers',
                    constraints: 'Use list comprehension',
                    weight: 15,
                    testCases: [
                        {
                            input: 'No input required',
                            expectedOutput: '[4, 16, 36, 64, 100]'
                        }
                    ]
                }
            ],
            // Add the test user as a participant with a score
            participants: [
                {
                    userId: testUser._id,
                    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
                    score: 12,
                    answers: [
                        {
                            questionId: new mongoose.Types.ObjectId(),
                            code: 'squares = [i**2 for i in range(1, 11) if i % 2 == 0]',
                            testCaseResults: [
                                {
                                    passed: true,
                                    input: '',
                                    expectedOutput: '[4, 16, 36, 64, 100]',
                                    actualOutput: '[4, 16, 36, 64, 100]',
                                    executionTime: 0.05
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let completedExam = await Exam.findOne({ title: completedExamData.title });
        if (!completedExam) {
            completedExam = new Exam(completedExamData);
            await completedExam.save();
            console.log('Created completed exam with user results:', completedExam.title);
        } else {
            console.log('Completed exam already exists:', completedExam.title);
        }

        console.log('\n=== Test Data Summary ===');
        console.log('Test User Login:');
        console.log('  Email: testuser@example.com');
        console.log('  Password: TestUser123!');
        console.log('\nTest Admin Login:');
        console.log('  Email: testadmin@example.com');
        console.log('  Password: TestAdmin123!');
        console.log('\nCreated Exams:', testExam.title, 'and', completedExam.title);
        
    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createTestData();

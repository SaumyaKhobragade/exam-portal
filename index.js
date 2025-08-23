
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import ownerRouter from "./src/routes/owner.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import examRequestRouter from "./src/routes/examRequest.routes.js";
import runCode from './src/utils/judge0.js';
import OpenAICodeGrader from './src/services/openaiGrader.js';

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { verifyOwner, verifyAdminOrOwner, verifyJWT } from './src/middlewares/auth.middleware.js';
import { handleLogout } from './src/middlewares/logout.middleware.js';
import { verifyOwnerSession, verifyJWTSession, noCacheMiddleware } from './src/middlewares/sessionValidation.middleware.js';
import { errorHandler } from './src/middlewares/errorHandler.middleware.js';
import HomepageStats from './src/models/homepageStats.model.js';
import { getNonExpiredExamsForOrganization, scheduleExamCleanup } from './src/utils/examUtils.js';



dotenv.config({
    path: '.env'
});

app.get('/', async (req, res) => {
    try {
        // Get real-time homepage stats from database
        const stats = await HomepageStats.getRealTimeStats();
        
        res.render('landingpage', { 
            stats: {
                studentsAssessed: stats.studentsAssessed,
                institutions: stats.institutions,
                totalExams: stats.totalExams,
                activeUsers: stats.activeUsers,
                heroTitle: stats.heroTitle,
                heroDescription: stats.heroDescription
            }
        });
    } catch (error) {
        console.error('Error loading homepage stats:', error);
        // Fallback to default values if database fails
        res.render('landingpage', {
            stats: {
                studentsAssessed: 0,
                institutions: 0,
                uptime: 99.9,
                totalExams: 0,
                activeUsers: 0,
                heroTitle: "Secure & Fair Online Coding Examinations",
                heroDescription: "The most advanced platform for conducting secure coding assessments with real-time monitoring, AI-powered proctoring, and comprehensive analytics."
            }
        });
    }
})
app.get('/about', async (req, res) => {
    try {
        // Get real-time statistics for the about page
        const stats = await HomepageStats.getRealTimeStats();
        
        res.render('about', {
            stats: {
                studentsAssessed: stats.studentsAssessed,
                institutions: stats.institutions,
                codeSubmissions: stats.codeSubmissions
            }
        });
    } catch (error) {
        console.error('Error loading about page stats:', error);
        // Fallback to default values if database fails
        res.render('about', {
            stats: {
                studentsAssessed: 0,
                institutions: 0,
                codeSubmissions: 0
            }
        });
    }
})
app.get('/contact', (req,res)=>{
    res.render('contact');
})
app.get('/ide', async (req,res)=>{
    try {
        // Import models
        const mongoose = await import('mongoose');
        const Exam = mongoose.default.model('Exam');
        
        console.log('IDE route: Fetching exam from database...');
        
        // Find any exam to display (not just active ones for demo purposes)
        const exam = await Exam.findOne({ 
            questions: { $exists: true, $not: { $size: 0 } } // Find exams that have questions
        })
        .populate('adminId', 'username fullname domain')
        .select('title description startDateTime duration status questions totalMarks adminId')
        .sort({ createdAt: -1 }) // Get the most recent exam
        .limit(1);
        
        console.log('IDE route: Found exam:', exam ? { 
            id: exam._id, 
            title: exam.title, 
            questionsCount: exam.questions?.length,
            status: exam.status 
        } : 'No exam found');
        
        if (exam && exam.questions && exam.questions.length > 0) {
            console.log('IDE route: Using real exam data');
            console.log('First question title:', exam.questions[0].title);
            console.log('First question description:', exam.questions[0].description || 'NO DESCRIPTION');
            console.log('First question statement:', exam.questions[0].statement || 'NO STATEMENT');
            console.log('First question constraints:', exam.questions[0].constraints || 'NO CONSTRAINTS');
            console.log('Constraints type:', typeof exam.questions[0].constraints);
            console.log('Constraints value:', JSON.stringify(exam.questions[0].constraints));
            console.log('First question examples:', exam.questions[0].examples || 'NO EXAMPLES');
            console.log('Full question object keys:', Object.keys(exam.questions[0]));
            console.log('Full question object:', JSON.stringify(exam.questions[0], null, 2));
            
            // Calculate remaining time (for demo purposes, show full duration)
            const now = new Date();
            const startTime = new Date(exam.startDateTime);
            const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
            const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
            
            // Render IDE with real exam data
            res.render('ide', { 
                exam: exam,
                timeRemaining: timeRemaining > 0 ? timeRemaining : exam.duration * 60, // Show full duration if expired
                examStarted: false,
                user: null
            });
        } else {
            console.log('IDE route: No exams found with questions, using fallback sample data');
            // Fallback to sample data if no exams with questions found
            const sampleExam = {
                title: "Sample Coding Challenge",
                description: "This is a sample exam for testing the IDE",
                duration: 60,
                totalMarks: 100,
                questions: [{
                    title: "Two Sum Problem",
                    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.
                    <br><br>
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                    <br><br>
                    You can return the answer in any order.
                    <br><br>
                    <strong>Follow-up:</strong> Can you come up with an algorithm that is less than O(n²) time complexity?`,
                    points: 50,
                    inputFormat: `<strong>Input Format:</strong>
                    <ul>
                        <li>The first parameter is an array of integers <code>nums</code></li>
                        <li>The second parameter is an integer <code>target</code></li>
                    </ul>`,
                    outputFormat: `<strong>Output Format:</strong>
                    <ul>
                        <li>Return an array of two integers representing the indices of the two numbers that add up to the target</li>
                        <li>The indices should be in ascending order</li>
                    </ul>`,
                    examples: [
                        {
                            input: "nums = [2,7,11,15], target = 9",
                            output: "[0,1]",
                            explanation: "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
                        },
                        {
                            input: "nums = [3,2,4], target = 6", 
                            output: "[1,2]",
                            explanation: "Because nums[1] + nums[2] = 2 + 4 = 6, we return [1, 2]."
                        },
                        {
                            input: "nums = [3,3], target = 6",
                            output: "[0,1]", 
                            explanation: "Because nums[0] + nums[1] = 3 + 3 = 6, we return [0, 1]."
                        }
                    ],
                    constraints: [
                        "2 ≤ nums.length ≤ 10⁴",
                        "-10⁹ ≤ nums[i] ≤ 10⁹", 
                        "-10⁹ ≤ target ≤ 10⁹",
                        "Only one valid answer exists."
                    ],
                    testCases: [
                        {
                            input: "nums = [2,7,11,15], target = 9",
                            expectedOutput: "[0,1]"
                        },
                        {
                            input: "nums = [3,2,4], target = 6",
                            expectedOutput: "[1,2]"
                        },
                        {
                            input: "nums = [3,3], target = 6",
                            expectedOutput: "[0,1]"
                        }
                    ]
                }]
            };
            
            res.render('ide', { 
                exam: sampleExam,
                timeRemaining: 3600, // 1 hour for testing
                examStarted: false,
                user: null
            });
        }
    } catch (error) {
        console.error('Error fetching exam for IDE:', error);
        // Fallback to sample data on error
        const sampleExam = {
            title: "Sample Coding Challenge - Error Fallback",
            description: "Could not load exam from database. Showing sample data.",
            duration: 60,
            totalMarks: 100,
            questions: [{
                title: "Sample Problem",
                description: "This is a fallback sample problem due to database error.",
                points: 50,
                examples: [],
                constraints: ["Standard problem constraints apply"],
                testCases: [
                    {
                        input: "sample input",
                        expectedOutput: "expected output"
                    }
                ]
            }]
        };
        
        res.render('ide', { 
            exam: sampleExam,
            timeRemaining: 3600,
            examStarted: false,
            user: null
        });
    }
})

// Test route for Judge0 integration
app.get('/test-judge0', (req, res) => {
    res.sendFile(__dirname + '/test-judge0.html');
});

// Debug route to show exam data being passed to IDE
app.get('/debug-exam-data', async (req, res) => {
    try {
        const Exam = (await import('./src/models/exam.model.js')).default;
        const exam = await Exam.findOne({ status: 'active' }).populate('questions');
        
        if (exam) {
            const examData = {
                exam: {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description || "",
                    duration: exam.duration,
                    totalMarks: exam.totalMarks || 0,
                    questions: exam.questions || []
                },
                currentQuestionIndex: 0,
                isExamMode: true,
                initialTimeRemaining: exam.duration * 60
            };
            
            res.json(examData);
        } else {
            res.json({ error: 'No active exam found' });
        }
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Debug route to see available exams
app.get('/debug/exams', async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const Exam = mongoose.default.model('Exam');
        
        const exams = await Exam.find({})
            .populate('adminId', 'username fullname domain')
            .select('title description status questions createdAt adminId')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            total: exams.length,
            exams: exams.map(exam => ({
                id: exam._id,
                title: exam.title,
                description: exam.description,
                status: exam.status,
                questionsCount: exam.questions ? exam.questions.length : 0,
                firstQuestionTitle: exam.questions && exam.questions.length > 0 ? exam.questions[0].title : 'No questions',
                createdAt: exam.createdAt,
                admin: exam.adminId ? exam.adminId.username : 'No admin'
            }))
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Start exam route - redirects user to IDE with exam data
app.get('/exams/start/:examId', noCacheMiddleware, verifyJWTSession, async (req, res) => {
    try {
        const examId = req.params.examId;
        const userDomain = req.user.domain;
        
        // Import models
        const mongoose = await import('mongoose');
        const Exam = mongoose.default.model('Exam');
        const Admin = mongoose.default.model('Admin');
        
        // Find the exam and verify user has access
        const exam = await Exam.findById(examId)
            .populate('adminId', 'username fullname domain')
            .select('title description startDateTime duration status questions totalMarks adminId');
        
        if (!exam) {
            return res.status(404).render('error', { 
                message: 'Exam not found',
                user: req.user 
            });
        }
        
        // Check if user's domain matches exam's admin domain
        if (exam.adminId.domain !== userDomain) {
            return res.status(403).render('error', { 
                message: 'You do not have access to this exam',
                user: req.user 
            });
        }
        
        // Check exam timing and status
        const now = new Date();
        const startTime = new Date(exam.startDateTime);
        const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
        
        if (exam.status !== 'active') {
            return res.status(403).render('error', { 
                message: 'This exam is not currently active',
                user: req.user 
            });
        }
        
        if (now < startTime) {
            return res.status(403).render('error', { 
                message: 'This exam has not started yet',
                user: req.user 
            });
        }
        
        if (now > endTime) {
            return res.status(403).render('error', { 
                message: 'This exam has already ended',
                user: req.user 
            });
        }
        
        // Calculate remaining time
        const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        // Render IDE with exam data
        res.render('ide', { 
            user: req.user,
            exam: exam,
            timeRemaining: timeRemaining,
            examStarted: true
        });
        
    } catch (error) {
        console.error('Error starting exam:', error);
        res.status(500).render('error', { 
            message: 'Internal server error while starting exam',
            user: req.user 
        });
    }
})

// Exam submission route
app.post('/exams/submit', noCacheMiddleware, verifyJWTSession, async (req, res) => {
    try {
        const { examId, answers, submittedAt, timeTaken } = req.body;
        const userId = req.user._id;
        const userDomain = req.user.domain;
        
        // Import models
        const mongoose = await import('mongoose');
        const Exam = mongoose.default.model('Exam');
        
        // Validate exam and user access
        const exam = await Exam.findById(examId)
            .populate('adminId', 'domain')
            .select('title adminId duration startDateTime status questions');
        
        if (!exam) {
            return res.status(404).json({ 
                success: false, 
                message: 'Exam not found' 
            });
        }

        // Check if user's domain matches exam's admin domain
        if (exam.adminId.domain !== userDomain) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized for this exam' 
            });
        }

        // Check if exam is still active
        const now = new Date();
        const startTime = new Date(exam.startDateTime);
        const endTime = new Date(startTime.getTime() + (exam.duration * 60000));
        
        if (exam.status !== 'active' || now > endTime) {
            return res.status(403).json({ 
                success: false, 
                message: 'Exam submission period has ended' 
            });
        }

        // Create submission record
        const submission = {
            examId: examId,
            userId: userId,
            userEmail: req.user.email,
            userName: req.user.username || req.user.fullname,
            domain: userDomain,
            answers: answers,
            submittedAt: submittedAt || new Date().toISOString(),
            timeTaken: timeTaken || 0,
            status: 'submitted'
        };

        // Log submission (in production, save to database)
        console.log('Exam submission received:', {
            examId,
            userId,
            userEmail: req.user.email,
            submittedAt: submission.submittedAt,
            answersCount: answers ? answers.length : 0
        });
        
        // Here you could:
        // 1. Save to a Submissions collection
        // 2. Evaluate answers against test cases using Judge0
        // 3. Calculate scores
        // 4. Send confirmation emails
        
        res.json({ 
            success: true, 
            message: 'Exam submitted successfully',
            submissionId: `${examId}_${userId}_${Date.now()}`
        });

    } catch (error) {
        console.error('Error submitting exam:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit exam' 
        });
    }
})

app.get('/login', (req,res)=>{
    res.render('loginregister');
})

// Request exam hosting page
app.get('/request-hosting', (req,res)=>{
    res.render('requestExam');
});

// Alternative route for backward compatibility
app.get('/request-exam', (req,res)=>{
    res.render('requestExam');
});

// Logout route using middleware - handles both browser and API requests
app.get('/logout', handleLogout);
app.post('/logout', handleLogout);

// Clear all cookies route for testing
app.get('/clear-cookies', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send(`
        <h2>Cookies Cleared!</h2>
        <p>Authentication cookies have been cleared. Now test the protected routes:</p>
        <ul>
            <li><a href="/owner-dashboard">Owner Dashboard</a> (should redirect to login)</li>
            <li><a href="/admin-dashboard">Admin Dashboard</a> (should redirect to login)</li>
            <li><a href="/user-dashboard">User Dashboard</a> (should redirect to login)</li>
            <li><a href="/login">Login Page</a></li>
        </ul>
    `);
});

// Protected dashboard routes - require authentication and session validation
app.get('/owner-dashboard', noCacheMiddleware, verifyOwnerSession, (req,res)=>{
    res.render('ownerDashboard', { user: req.user });
});

app.get('/user-dashboard', noCacheMiddleware, verifyJWTSession, async (req,res)=>{
    try {
        // Import ExamResult model
        const ExamResult = (await import('./src/models/examResult.model.js')).default;
        
        // Debug user object
        console.log('User object:', {
            id: req.user._id,
            email: req.user.email,
            domain: req.user.domain,
            username: req.user.username
        });
        
        // Get user's domain
        let userDomain = req.user.domain;
        
        // If domain is not set, extract it from email
        if (!userDomain && req.user.email) {
            userDomain = req.user.email.split('@')[1];
            console.log(`Domain extracted from email: ${userDomain}`);
        }
        
        console.log(`User dashboard requested for domain: ${userDomain}`);
        
        if (!userDomain) {
            console.log('No domain found for user, showing empty exams list');
            return res.render('userDashboard', { 
                user: req.user,
                exams: [],
                userStats: {
                    totalExams: 0,
                    averageScore: 0,
                    totalTimeTaken: 0
                },
                recentResults: []
            });
        }
        
        // Get exams for the user's organization
        const organizationExams = await getNonExpiredExamsForOrganization(userDomain);
        console.log(`Found ${organizationExams.length} exams for user dashboard`);
        
        // Get user's exam statistics and recent results
        const userStats = await ExamResult.getUserStats(req.user._id);
        const recentResults = await ExamResult.getRecentResults(req.user._id, 5);
        
        res.render('userDashboard', { 
            user: req.user,
            exams: organizationExams,
            userStats: userStats,
            recentResults: recentResults
        });
    } catch (error) {
        console.error('Error fetching organization exams:', error);
        res.render('userDashboard', { 
            user: req.user,
            exams: [],
            userStats: {
                totalExams: 0,
                averageScore: 0,
                totalTimeTaken: 0
            },
            recentResults: []
        });
    }
});

app.get('/dashboard', noCacheMiddleware, verifyJWTSession, async (req,res)=>{
    try {
        // Debug user object
        console.log('Dashboard - User object:', {
            id: req.user._id,
            email: req.user.email,
            domain: req.user.domain,
            username: req.user.username
        });
        
        // Import ExamResult model
        const ExamResult = (await import('./src/models/examResult.model.js')).default;
        
        // Get user's domain
        let userDomain = req.user.domain;
        
        // If domain is not set, extract it from email
        if (!userDomain && req.user.email) {
            userDomain = req.user.email.split('@')[1];
            console.log(`Dashboard - Domain extracted from email: ${userDomain}`);
        }
        
        console.log(`Dashboard requested for domain: ${userDomain}`);
        
        if (!userDomain) {
            console.log('Dashboard - No domain found for user, showing empty exams list');
            return res.render('userDashboard', { 
                user: req.user,
                exams: [],
                userStats: {
                    totalExams: 0,
                    averageScore: 0,
                    totalTimeTaken: 0
                },
                recentResults: []
            });
        }
        
        // Get exams for the user's organization
        const organizationExams = await getNonExpiredExamsForOrganization(userDomain);
        console.log(`Found ${organizationExams.length} exams for dashboard`);
        
        // Get user's exam statistics and recent results
        const userStats = await ExamResult.getUserStats(req.user._id);
        const recentResults = await ExamResult.getRecentResults(req.user._id, 5);
        
        console.log('User stats:', userStats);
        console.log('Recent results count:', recentResults.length);
        
        res.render('userDashboard', { 
            user: req.user,
            exams: organizationExams,
            userStats: userStats,
            recentResults: recentResults
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('userDashboard', { 
            user: req.user,
            exams: [],
            userStats: {
                totalExams: 0,
                averageScore: 0,
                totalTimeTaken: 0
            },
            recentResults: []
        });
    }
});

// Function to preprocess Java code to ensure proper Main class structure
function preprocessJavaCode(sourceCode, languageId) {
    // Only preprocess for Java (language_id 62)
    if (languageId === 62 || languageId === '62') {
        // Check if the code already has a proper Main class structure
        if (sourceCode.includes('class Main') && sourceCode.includes('public static void main')) {
            return sourceCode;
        }
        
        // If the code looks like it's just the logic without class wrapper, wrap it
        const trimmedCode = sourceCode.trim();
        
        // Check if it's just a method or logic without class
        if (!trimmedCode.includes('class ') && !trimmedCode.includes('public class ')) {
            return `
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        ${trimmedCode}
        
        scanner.close();
    }
}`.trim();
        }
        
        // If it has a class but not Main, try to rename it to Main
        if (trimmedCode.includes('public class ') && !trimmedCode.includes('public class Main')) {
            return trimmedCode.replace(/public class \w+/g, 'public class Main');
        }
    }
    
    return sourceCode;
}

// Judge0 code execution route with enhanced functionality
app.post('/api/v1/execute', async (req, res) => {
    try {
        let { source_code, language_id, stdin, expected_output, test_cases } = req.body;
        
        if (!source_code) {
            return res.status(400).json({
                success: false,
                error: 'Source code is required'
            });
        }
        
        // Preprocess Java code to ensure proper structure
        source_code = preprocessJavaCode(source_code, language_id);
        
        // If test_cases are provided, run multiple test cases
        if (test_cases && Array.isArray(test_cases)) {
            const results = [];
            
            for (const testCase of test_cases) {
                try {
                    const result = await runCode(source_code, language_id, testCase.stdin || '');
                    
                    // Compare output with expected result
                    const actualOutput = (result.stdout || '').trim();
                    const expectedOutput = (testCase.expected_output || '').trim();
                    const passed = actualOutput === expectedOutput;
                    
                    results.push({
                        input: testCase.input || testCase.stdin,
                        expected_output: expectedOutput,
                        actual_output: actualOutput,
                        passed: passed,
                        execution_time: result.time,
                        memory_used: result.memory,
                        stderr: result.stderr,
                        compile_output: result.compile_output
                    });
                } catch (testError) {
                    results.push({
                        input: testCase.input || testCase.stdin,
                        expected_output: testCase.expected_output,
                        actual_output: '',
                        passed: false,
                        error: testError.message,
                        stderr: testError.message
                    });
                }
            }
            
            const totalTests = results.length;
            const passedTests = results.filter(r => r.passed).length;
            
            return res.json({
                success: true,
                test_results: results,
                summary: {
                    total_tests: totalTests,
                    passed_tests: passedTests,
                    failed_tests: totalTests - passedTests,
                    pass_rate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0
                }
            });
        }
        
        // Single execution
        const result = await runCode(source_code, language_id, stdin);
        
        // If expected_output is provided, compare results
        if (expected_output) {
            const actualOutput = (result.stdout || '').trim();
            const expectedOutput = expected_output.trim();
            const passed = actualOutput === expectedOutput;
            
            result.test_result = {
                passed: passed,
                expected_output: expectedOutput,
                actual_output: actualOutput
            };
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Judge0 API error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// OpenAI Code Grading API
const openaiGrader = new OpenAICodeGrader();

// AI Code Grading endpoint
app.post('/api/v1/grade-code', async (req, res) => {
    try {
        const {
            source_code,
            language,
            problem_title,
            problem_statement,
            constraints,
            test_results,
            expected_output,
            actual_output
        } = req.body;

        if (!source_code || !language) {
            return res.status(400).json({
                success: false,
                error: 'Source code and language are required'
            });
        }

        console.log('AI Grading request received for language:', language);

        const gradingResult = await openaiGrader.gradeCode({
            sourceCode: source_code,
            language: language,
            problemTitle: problem_title || 'Coding Problem',
            problemStatement: problem_statement || 'No description provided',
            constraints: constraints || 'No constraints specified',
            testResults: test_results || [],
            expectedOutput: expected_output,
            actualOutput: actual_output
        });

        console.log('AI Grading completed:', gradingResult.success ? 'Success' : 'Failed');

        if (gradingResult.success) {
            res.json({
                success: true,
                aiGrading: gradingResult.data || gradingResult
            });
        } else {
            res.json(gradingResult);
        }

    } catch (error) {
        console.error('AI Grading error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during code grading'
        });
    }
});

// Test page for AI grading systems
app.get('/test-ai-grading', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-ai-grading.html'));
});

// Test Google Gemini Grading endpoint
app.post('/api/v1/test-gemini-grading', async (req, res) => {
    try {
        console.log('Testing Google Gemini grading system...');
        
        const testData = {
            sourceCode: `def sum_array(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

result = sum_array([1, 2, 3, 4, 5])
print(f"Sum: {result}")`,
            language: 'python',
            problemTitle: 'Sum Array Elements',
            problemStatement: 'Write a function that calculates the sum of all elements in an array',
            constraints: 'Array will contain positive integers',
            testResults: [
                { status: 'Accepted', time: '0.1s', memory: '256KB' },
                { status: 'Accepted', time: '0.1s', memory: '256KB' }
            ]
        };

        // Test Gemini directly
        const GeminiGrader = (await import('./src/services/geminiGrader.js')).default;
        const geminiGrader = new GeminiGrader();
        const gradingResult = await geminiGrader.gradeCode(testData);
        
        console.log('Gemini test result:', JSON.stringify(gradingResult, null, 2));

        res.json({
            success: true,
            message: 'Google Gemini grading test completed',
            result: gradingResult
        });

    } catch (error) {
        console.error('Test Gemini Grading error:', error);
        res.status(500).json({
            success: false,
            error: 'Test failed: ' + error.message
        });
    }
});

// Test Hugging Face Grading endpoint
app.post('/api/v1/test-hf-grading', async (req, res) => {
    try {
        console.log('Testing Hugging Face grading system...');
        
        const testData = {
            sourceCode: `def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)
print(result)`,
            language: 'python',
            problemTitle: 'Add Two Numbers',
            problemStatement: 'Write a function that adds two numbers',
            constraints: 'Numbers should be integers',
            testResults: [
                { status: 'Accepted', time: '0.1s', memory: '256KB' }
            ]
        };

        // Test Hugging Face directly
        const hfGrader = new (await import('./src/services/huggingfaceGrader.js')).default();
        const gradingResult = await hfGrader.gradeCode(testData);
        
        console.log('Hugging Face test result:', JSON.stringify(gradingResult, null, 2));

        res.json({
            success: true,
            message: 'Hugging Face grading test completed',
            result: gradingResult
        });

    } catch (error) {
        console.error('Test Hugging Face Grading error:', error);
        res.status(500).json({
            success: false,
            error: 'Test failed: ' + error.message
        });
    }
});

// Test AI Grading endpoint
app.post('/api/v1/test-ai-grading', async (req, res) => {
    try {
        console.log('Testing AI grading system...');
        
        const testData = {
            sourceCode: `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
            language: 'python',
            problemTitle: 'Fibonacci Sequence',
            problemStatement: 'Write a function to calculate the nth Fibonacci number',
            constraints: 'n should be a positive integer',
            testResults: [
                { status: 'Accepted', time: '0.1s', memory: '256KB' },
                { status: 'Accepted', time: '0.2s', memory: '256KB' }
            ]
        };

        const gradingResult = await openaiGrader.gradeCode(testData);
        console.log('Test grading result:', JSON.stringify(gradingResult, null, 2));

        if (gradingResult.success) {
            res.json({
                success: true,
                message: 'AI grading test successful',
                aiGrading: gradingResult.data || gradingResult
            });
        } else {
            res.json({
                success: false,
                message: 'AI grading test failed',
                error: gradingResult.error
            });
        }

    } catch (error) {
        console.error('Test AI Grading error:', error);
        res.status(500).json({
            success: false,
            error: 'Test failed: ' + error.message
        });
    }
});

// Quick Code Review endpoint
app.post('/api/v1/review-code', async (req, res) => {
    try {
        const { source_code, language } = req.body;

        if (!source_code || !language) {
            return res.status(400).json({
                success: false,
                error: 'Source code and language are required'
            });
        }

        const reviewResult = await openaiGrader.quickCodeReview(source_code, language);
        res.json(reviewResult);

    } catch (error) {
        console.error('Code review error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during code review'
        });
    }
});

// Enhanced Judge0 execution with AI grading
app.post('/api/v1/execute-and-grade', async (req, res) => {
    try {
        let {
            source_code,
            language_id,
            test_cases,
            problem_title,
            problem_statement,
            constraints
        } = req.body;

        if (!source_code) {
            return res.status(400).json({
                success: false,
                error: 'Source code is required'
            });
        }

        // Preprocess Java code to ensure proper structure
        source_code = preprocessJavaCode(source_code, language_id);

        // First, execute the code with Judge0
        let executionResult;
        
        if (test_cases && Array.isArray(test_cases)) {
            const results = [];
            
            for (const testCase of test_cases) {
                try {
                    const result = await runCode(source_code, language_id, testCase.stdin || '');
                    
                    const actualOutput = (result.stdout || '').trim();
                    const expectedOutput = (testCase.expected_output || '').trim();
                    const passed = actualOutput === expectedOutput;
                    
                    results.push({
                        input: testCase.input || testCase.stdin,
                        expected_output: expectedOutput,
                        actual_output: actualOutput,
                        passed: passed,
                        execution_time: result.time,
                        memory_used: result.memory,
                        stderr: result.stderr,
                        compile_output: result.compile_output
                    });
                } catch (testError) {
                    results.push({
                        input: testCase.input || testCase.stdin,
                        expected_output: testCase.expected_output,
                        actual_output: '',
                        passed: false,
                        error: testError.message,
                        stderr: testError.message
                    });
                }
            }
            
            executionResult = {
                success: true,
                test_results: results,
                summary: {
                    total_tests: results.length,
                    passed_tests: results.filter(r => r.passed).length,
                    failed_tests: results.filter(r => !r.passed).length
                }
            };
        } else {
            // Single execution
            const result = await runCode(source_code, language_id, '');
            executionResult = {
                success: true,
                data: result
            };
        }

        // Then, get AI grading
        const languageMap = {
            63: 'javascript',
            71: 'python',
            62: 'java',
            54: 'cpp',
            51: 'csharp'
        };

        const gradingResult = await openaiGrader.gradeCode({
            sourceCode: source_code,
            language: languageMap[language_id] || 'javascript',
            problemTitle: problem_title || 'Coding Problem',
            problemStatement: problem_statement || 'No description provided',
            constraints: constraints || 'No constraints specified',
            testResults: executionResult.test_results || [],
            expectedOutput: test_cases?.[0]?.expected_output,
            actualOutput: executionResult.test_results?.[0]?.actual_output || executionResult.data?.stdout
        });

        // Combine execution and grading results
        res.json({
            success: true,
            execution: executionResult,
            grading: gradingResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Execute and grade error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute and grade code'
        });
    }
});


// Register routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/owner', ownerRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/exam-requests', examRequestRouter);

// Debug route to check exam data
app.get('/debug/exams', async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const Exam = mongoose.default.model('Exam');
        const Admin = mongoose.default.model('Admin');
        
        // Get all admins
        const allAdmins = await Admin.find({}).select('username domain fullname');
        
        // Get all exams
        const allExams = await Exam.find({}).select('title status startDateTime duration adminId createdAt')
            .populate('adminId', 'username domain');
        
        // Get exams for rbunagpur.in specifically
        const domainAdmins = await Admin.find({ domain: 'rbunagpur.in' }).select('_id username');
        const adminIds = domainAdmins.map(admin => admin._id);
        const domainExams = await Exam.find({ adminId: { $in: adminIds } })
            .select('title status startDateTime duration createdAt')
            .populate('adminId', 'username domain');
        
        res.json({
            debug: 'Exam Database Debug',
            allAdmins: allAdmins,
            allExams: allExams,
            domainAdmins: domainAdmins,
            domainExams: domainExams,
            timestamp: new Date()
        });
    } catch (error) {
        res.json({ error: error.message, stack: error.stack });
    }
});

// Rankings API endpoint for admin dashboard
app.get('/api/v1/admin/rankings', verifyJWT, async (req, res) => {
    try {
        const { examId } = req.query;
        
        // Import required models
        const User = (await import('./src/models/user.model.js')).default;
        const Exam = (await import('./src/models/exam.model.js')).default;
        
        // Get all users in the admin's organization/domain
        const adminDomain = req.user.domain;
        
        // Find all students in the same domain
        const students = await User.find({ 
            domain: adminDomain,
            // Exclude admins/owners from rankings
            $and: [
                { username: { $not: /^admin/ } },
                { username: { $not: /^owner/ } }
            ]
        }).select('username fullname email createdAt updatedAt');
        
        // Generate sample rankings data for demonstration
        // In a real implementation, this would come from actual exam submissions and AI grading results
        const rankings = students.map((student, index) => {
            // Generate realistic scores based on position and some randomness
            const baseScore = Math.max(3, 10 - (index * 0.5) - (Math.random() * 2));
            
            const generateScore = (base) => Math.min(10, Math.max(1, base + (Math.random() - 0.5) * 2));
            
            const correctness = generateScore(baseScore);
            const codeQuality = generateScore(baseScore * 0.9);
            const efficiency = generateScore(baseScore * 0.85);
            const bestPractices = generateScore(baseScore * 0.8);
            const timeScore = generateScore(baseScore * 0.9);
            
            const overallScore = (correctness + codeQuality + efficiency + bestPractices + timeScore) / 5;
            
            return {
                _id: student._id,
                username: student.username,
                fullname: student.fullname,
                email: student.email,
                overallScore: Math.round(overallScore * 10) / 10,
                correctness: Math.round(correctness * 10) / 10,
                codeQuality: Math.round(codeQuality * 10) / 10,
                efficiency: Math.round(efficiency * 10) / 10,
                bestPractices: Math.round(bestPractices * 10) / 10,
                timeScore: Math.round(timeScore * 10) / 10,
                examCount: Math.floor(Math.random() * 5) + 1,
                lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
            };
        });
        
        // Sort by overall score (descending)
        rankings.sort((a, b) => b.overallScore - a.overallScore);
        
        // Calculate statistics
        const totalStudents = rankings.length;
        const averageOverallScore = totalStudents > 0 
            ? rankings.reduce((sum, student) => sum + student.overallScore, 0) / totalStudents 
            : 0;
        
        const topPerformer = rankings.length > 0 ? rankings[0].fullname || rankings[0].username : 'N/A';
        const mostImproved = rankings.length > 1 ? rankings[Math.floor(rankings.length / 3)].fullname || rankings[Math.floor(rankings.length / 3)].username : 'N/A';
        const activeStudents = rankings.filter(student => {
            const daysSinceActivity = (Date.now() - new Date(student.lastActivity)) / (1000 * 60 * 60 * 24);
            return daysSinceActivity <= 7; // Active within last week
        }).length;
        
        const stats = {
            averageOverallScore,
            topPerformer,
            mostImproved,
            activeStudents,
            totalStudents
        };
        
        res.json({
            success: true,
            data: {
                rankings,
                stats
            },
            message: `Found ${totalStudents} students in ${adminDomain} domain`
        });
        
    } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rankings',
            error: error.message
        });
    }
});

// Global error handling middleware (must be after all routes)
app.use(errorHandler);

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT} \nhttp://localhost:${process.env.PORT}`);
            
            // Start automatic exam cleanup service
            // This will check every 30 minutes for expired exams and update their status
            scheduleExamCleanup(30);
            console.log('Automatic exam cleanup service started - checking every 30 minutes');
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });

import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import ownerRouter from "./src/routes/owner.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import examRequestRouter from "./src/routes/examRequest.routes.js";
import runCode from './src/utils/judge0.js';
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
app.get('/ide', (req,res)=>{
    // Provide sample exam data for testing purposes
    const sampleExam = {
        title: "Sample Coding Challenge",
        description: "This is a sample exam for testing the IDE",
        duration: 60,
        totalMarks: 100,
        questions: [{
            title: "Two Sum Problem",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            points: 50,
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
                }
            ],
            constraints: [
                "2 ≤ nums.length ≤ 10⁴",
                "-10⁹ ≤ nums[i] ≤ 10⁹", 
                "-10⁹ ≤ target ≤ 10⁹",
                "Only one valid answer exists."
            ]
        }]
    };
    
    res.render('ide', { 
        exam: sampleExam,
        timeRemaining: 3600, // 1 hour for testing
        examStarted: false,
        user: null
    });
})

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
        // Get user's domain
        const userDomain = req.user.domain;
        console.log(`User dashboard requested for domain: ${userDomain}`);
        
        // Get exams for the user's organization
        const organizationExams = await getNonExpiredExamsForOrganization(userDomain);
        console.log(`Found ${organizationExams.length} exams for user dashboard`);
        
        res.render('userDashboard', { 
            user: req.user,
            exams: organizationExams 
        });
    } catch (error) {
        console.error('Error fetching organization exams:', error);
        res.render('userDashboard', { 
            user: req.user,
            exams: [] 
        });
    }
});

app.get('/dashboard', noCacheMiddleware, verifyJWTSession, async (req,res)=>{
    try {
        // Get user's domain
        const userDomain = req.user.domain;
        console.log(`Dashboard requested for domain: ${userDomain}`);
        
        // Get exams for the user's organization
        const organizationExams = await getNonExpiredExamsForOrganization(userDomain);
        console.log(`Found ${organizationExams.length} exams for dashboard`);
        
        res.render('userDashboard', { 
            user: req.user,
            exams: organizationExams 
        });
    } catch (error) {
        console.error('Error fetching organization exams:', error);
        res.render('userDashboard', { 
            user: req.user,
            exams: [] 
        });
    }
});

// Judge0 code execution route with enhanced functionality
app.post('/api/v1/execute', async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_output, test_cases } = req.body;
        
        if (!source_code) {
            return res.status(400).json({
                success: false,
                error: 'Source code is required'
            });
        }
        
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
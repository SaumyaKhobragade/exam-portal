import express from 'express';
import Exam from '../models/exam.model.js';
import HomepageStats from '../models/homepageStats.model.js';
import { verifyAdminOrOwnerSession, noCacheMiddleware } from '../middlewares/sessionValidation.middleware.js';
import { validateExamQuestions, validateTestCases, LANGUAGE_IDS } from '../services/judge0Service.js';

const router = express.Router();

// Apply no-cache middleware to all admin routes
router.use(noCacheMiddleware);

// Test route to check form parsing (no auth required)
router.post('/test-form', (req, res) => {
    console.log('Test form - Request body received:', JSON.stringify(req.body, null, 2));
    console.log('Test form - Content-Type:', req.get('Content-Type'));
    res.json({ 
        success: true, 
        message: 'Form data received successfully',
        data: req.body 
    });
});

// Logout success page (no auth required)
router.get('/logout-success', (req, res) => {
    // Add no-cache headers to prevent caching
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.render('logoutSuccess');
});

// Admin dashboard route - requires authentication and session validation
router.get('/admin-dashboard', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        // Get actual user ID and type from authenticated user
        const userId = req.user._id;
        const userType = req.userModel; // 'admin' or 'owner'
        
        let examQuery = {};
        
        // Filter exams based on user type
        if (userType === 'owner') {
            // Owners see all exams they own
            examQuery.ownerId = userId;
        } else if (userType === 'admin') {
            // Admins see exams they created or are assigned to
            examQuery = {
                $or: [
                    { adminId: userId },
                    { 'createdBy.userId': userId }
                ]
            };
        }
        
        // Fetch recent exams for this user
        const recentExams = await Exam.find(examQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title startDateTime status participants totalMarks createdAt createdBy adminId ownerId')
            .populate('ownerId', 'username fullname')
            .populate('adminId', 'username fullname');
        
        // Get exam statistics
        const totalExams = await Exam.countDocuments(examQuery);
        const activeExams = await Exam.countDocuments({...examQuery, status: 'active'});
        const completedExams = await Exam.countDocuments({...examQuery, status: 'completed'});
        
        // Pass exam data and statistics to the view
        res.render('adminDashboard', { 
            exams: recentExams,
            stats: {
                total: totalExams,
                active: activeExams,
                completed: completedExams
            },
            success: req.query.success,
            user: req.user,
            userType: userType
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('adminDashboard', { 
            exams: [],
            stats: { total: 0, active: 0, completed: 0 },
            error: 'Failed to load dashboard data',
            user: req.user,
            userType: req.userModel
        });
    }
});

// Route to update homepage stats (admin only)
router.post('/update-homepage-stats', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        const { studentsAssessed, institutions, uptime, heroTitle, heroDescription } = req.body;
        
        let stats = await HomepageStats.findOne();
        if (!stats) {
            stats = new HomepageStats({
                studentsAssessed,
                institutions,
                uptime,
                heroTitle,
                heroDescription
            });
        } else {
            stats.studentsAssessed = studentsAssessed || stats.studentsAssessed;
            stats.institutions = institutions || stats.institutions;
            stats.uptime = uptime || stats.uptime;
            stats.heroTitle = heroTitle || stats.heroTitle;
            stats.heroDescription = heroDescription || stats.heroDescription;
            stats.updatedAt = new Date();
        }
        
        await stats.save();
        res.json({ success: true, message: 'Homepage stats updated successfully' });
    } catch (error) {
        console.error('Error updating homepage stats:', error);
        res.status(500).json({ success: false, message: 'Error updating homepage stats' });
    }
});

// Route to render homepage stats management page
router.get('/manage-homepage', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        const stats = await HomepageStats.getRealTimeStats();
        res.render('manageHomepage', { user: req.user, stats });
    } catch (error) {
        console.error('Error loading homepage management:', error);
        res.status(500).send('Error loading homepage management');
    }
});

// Create exam page route - requires authentication and session validation
router.get('/admin/exams/create', verifyAdminOrOwnerSession, (req, res) => {
    res.render('createExam', { user: req.user });
});

// Get all exams for owner - requires authentication and session validation
router.get('/admin/exams', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        // Get actual user ID and type from authenticated user
        const userId = req.user._id;
        const userType = req.userModel; // 'admin' or 'owner'
        
        let examQuery = {};
        
        // Filter exams based on user type
        if (userType === 'owner') {
            examQuery.ownerId = userId;
        } else if (userType === 'admin') {
            examQuery = {
                $or: [
                    { adminId: userId },
                    { 'createdBy.userId': userId }
                ]
            };
        }
        
        const exams = await Exam.find(examQuery)
            .sort({ createdAt: -1 })
            .select('title description startDateTime status participants totalMarks createdAt duration createdBy')
            .populate('ownerId', 'username fullname')
            .populate('adminId', 'username fullname');
        
        res.json({
            success: true,
            exams: exams,
            userType: userType
        });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exams'
        });
    }
});

// Get specific exam details - requires authentication and session validation
router.get('/admin/exams/:id', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        const examId = req.params.id;
        // Get actual user ID and type from authenticated user
        const userId = req.user._id;
        const userType = req.userModel;
        
        let examQuery = { _id: examId };
        
        // Filter based on user type and permissions
        if (userType === 'owner') {
            examQuery.ownerId = userId;
        } else if (userType === 'admin') {
            examQuery = {
                _id: examId,
                $or: [
                    { adminId: userId },
                    { 'createdBy.userId': userId },
                    { ownerId: userId } // In case admin is also owner
                ]
            };
        }
        
        const exam = await Exam.findOne(examQuery)
            .populate('ownerId', 'username fullname')
            .populate('adminId', 'username fullname');
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you do not have permission to access it'
            });
        }
        
        res.json({
            success: true,
            exam: exam,
            userType: userType
        });
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exam details'
        });
    }
});

// Handle exam creation - requires authentication and session validation
router.post('/admin/exams', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        // Check if basic form fields are present
        if (!req.body || !req.body.examTitle) {
            console.error('examTitle is missing from request body. Body:', req.body);
            return res.status(400).json({
                success: false,
                message: 'Exam title is required'
            });
        }
        
        // Get actual user ID and type from authenticated user
        const userId = req.user._id;
        const userType = req.userModel; // 'admin' or 'owner'
        
        // Determine ownerId and adminId based on user type
        let ownerId, adminId;
        
        if (userType === 'owner') {
            ownerId = userId;
            adminId = null; // Owner creates exam directly
        } else if (userType === 'admin') {
            // For admins, we need to find their associated owner
            // Assuming admins are linked to an owner through a field like 'ownerId' in admin model
            adminId = userId;
            ownerId = req.user.ownerId || userId; // Fallback to admin ID if no owner association
        } else {
            throw new Error('Invalid user type for exam creation');
        }
        
        const examData = {
            title: req.body.examTitle,
            description: req.body.examDescription,
            instructions: req.body.instructions,
            startDateTime: new Date(req.body.startDateTime),
            duration: parseInt(req.body.duration),
            programmingLanguage: req.body.programmingLanguage || 'python',
            ownerId: ownerId,
            adminId: adminId,
            createdBy: {
                userId: userId,
                userType: userType,
                name: req.user.fullname || req.user.username
            },
            questions: []
        };

        const questionCount = parseInt(req.body.questionCount) || 0;

        // Process questions
        for (let i = 1; i <= questionCount; i++) {
            const question = {
                title: req.body[`question${i}_title`],
                statement: req.body[`question${i}_statement`],
                inputFormat: req.body[`question${i}_inputFormat`] || '',
                outputFormat: req.body[`question${i}_outputFormat`] || '',
                constraints: req.body[`question${i}_constraints`] || '',
                weight: parseInt(req.body[`question${i}_weight`]) || 10,
                testCases: []
            };

            // Process test cases for this question
            let tcIndex = 1;
            while (req.body[`question${i}_tc${tcIndex}_input`]) {
                question.testCases.push({
                    input: req.body[`question${i}_tc${tcIndex}_input`],
                    expectedOutput: req.body[`question${i}_tc${tcIndex}_output`]
                });
                tcIndex++;
            }

            examData.questions.push(question);
        }

        // Optional: Validate test cases using Judge0 API
        const shouldValidate = req.body.validateTestCases === 'true'; // Default to false unless explicitly enabled
        
        if (shouldValidate) {
            console.log('Starting test case validation with Judge0...');
            let validationResults = null;
            
            try {
                // Get programming language from form
                const programmingLanguage = examData.programmingLanguage;
                
                // Use structure validation only (safer approach)
                const skipActualExecution = true;
                
                // Validate questions and test cases
                validationResults = await validateExamQuestions(
                    examData.questions, 
                    programmingLanguage, 
                    skipActualExecution
                );
                
                console.log('Test case validation completed:', {
                    questionsValidated: validationResults.questionsValidated,
                    questionsWithErrors: validationResults.questionsWithErrors,
                    overallValid: validationResults.valid
                });

                // Store validation results with exam data
                examData.validationResults = validationResults;
                examData.lastValidated = new Date();
                examData.validationStatus = validationResults.valid ? 'passed' : 'failed';
                
                // Since we're doing structure validation only, most should pass
                if (!validationResults.valid) {
                    console.warn('Structure validation failed for some questions:', 
                        validationResults.questionResults.filter(q => !q.valid));
                    examData.hasValidationWarnings = true;
                }

            } catch (validationError) {
                console.error('Validation error (continuing with exam creation):', validationError.message);
                
                // Store validation error info but don't fail exam creation
                examData.validationError = validationError.message;
                examData.validationStatus = 'error';
                examData.lastValidated = new Date();
            }
        } else {
            console.log('Test case validation skipped by user choice');
            examData.validationStatus = 'skipped';
        }

        // Save exam to database
        const newExam = new Exam(examData);
        const savedExam = await newExam.save();
        
        console.log(`Exam created successfully by ${userType} (${req.user.username}):`, savedExam._id);
        console.log(`Owner ID: ${ownerId}, Admin ID: ${adminId}`);
        
        // Include validation status in success message
        let successMessage = 'exam-created';
        if (savedExam.validationStatus === 'failed') {
            successMessage = 'exam-created-with-warnings';
        } else if (savedExam.validationStatus === 'error') {
            successMessage = 'exam-created-validation-error';
        }
        
        // Redirect back to dashboard with success message
        res.redirect(`/admin-dashboard?success=${successMessage}`);
        
    } catch (error) {
        console.error('Error creating exam:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: errors 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error creating exam. Please try again.' 
        });
    }
});

// Get exam validation results
router.get('/admin/exams/:examId/validation', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        const examId = req.params.examId;
        const userId = req.user._id;
        const userType = req.userModel;
        
        // Build query based on user type
        let examQuery = { _id: examId };
        if (userType === 'owner') {
            examQuery.ownerId = userId;
        } else if (userType === 'admin') {
            examQuery.$or = [
                { adminId: userId },
                { ownerId: userId }
            ];
        }
        
        const exam = await Exam.findOne(examQuery);
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you do not have permission to access it'
            });
        }
        
        res.json({
            success: true,
            examId: exam._id,
            title: exam.title,
            programmingLanguage: exam.programmingLanguage,
            validationStatus: exam.validationStatus,
            validationResults: exam.validationResults,
            lastValidated: exam.lastValidated,
            validationError: exam.validationError,
            hasValidationWarnings: exam.hasValidationWarnings
        });
        
    } catch (error) {
        console.error('Error fetching validation results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch validation results'
        });
    }
});

export default router;

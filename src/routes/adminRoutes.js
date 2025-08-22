import express from 'express';
import Exam from '../models/exam.model.js';
import { verifyAdminOrOwnerSession, noCacheMiddleware } from '../middlewares/sessionValidation.middleware.js';

const router = express.Router();

// Apply no-cache middleware to all admin routes
router.use(noCacheMiddleware);

// Admin dashboard route - requires authentication and session validation
router.get('/admin-dashboard', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        // Get actual owner ID from authenticated user
        const ownerId = req.user._id;
        
        // Fetch recent exams for this owner
        const recentExams = await Exam.find({ ownerId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title startDateTime status participants totalMarks createdAt');
        
        // Pass exam data to the view
        res.render('adminDashboard', { 
            exams: recentExams,
            success: req.query.success,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('adminDashboard', { 
            exams: [],
            error: 'Failed to load dashboard data',
            user: req.user
        });
    }
});

// Create exam page route - requires authentication and session validation
router.get('/admin/exams/create', verifyAdminOrOwnerSession, (req, res) => {
    res.render('createExam', { user: req.user });
});

// Get all exams for owner - requires authentication and session validation
router.get('/admin/exams', verifyAdminOrOwnerSession, async (req, res) => {
    try {
        // Get actual owner ID from authenticated user
        const ownerId = req.user._id;
        
        const exams = await Exam.find({ ownerId })
            .sort({ createdAt: -1 })
            .select('title description startDateTime status participants totalMarks createdAt duration');
        
        res.json({
            success: true,
            exams: exams
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
        // Get actual owner ID from authenticated user
        const ownerId = req.user._id;
        
        const exam = await Exam.findOne({ _id: examId, ownerId });
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }
        
        res.json({
            success: true,
            exam: exam
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
        // Get actual owner ID from authenticated user
        const ownerId = req.user._id;
        
        const examData = {
            title: req.body.examTitle,
            description: req.body.examDescription,
            instructions: req.body.instructions,
            startDateTime: new Date(req.body.startDateTime),
            duration: parseInt(req.body.duration),
            ownerId: ownerId,
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

        // Save exam to database
        const newExam = new Exam(examData);
        const savedExam = await newExam.save();
        
        console.log('Exam created successfully:', savedExam._id);
        
        // Redirect back to dashboard with success message
        res.redirect('/admin-dashboard?success=exam-created');
        
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

export default router;

import express from 'express';
const router = express.Router();

// Admin dashboard route
router.get('/admin-dashboard', (req, res) => {
    res.render('adminDashboard');
});

// Create exam page route
router.get('/admin/exams/create', (req, res) => {
    res.render('createExam');
});

// Handle exam creation
router.post('/admin/exams', (req, res) => {
    try {
        const examData = {
            title: req.body.examTitle,
            description: req.body.examDescription,
            instructions: req.body.instructions,
            startDateTime: req.body.startDateTime,
            duration: parseInt(req.body.duration),
            questions: []
        };

        const questionCount = parseInt(req.body.questionCount) || 0;

        // Process questions
        for (let i = 1; i <= questionCount; i++) {
            const question = {
                title: req.body[`question${i}_title`],
                statement: req.body[`question${i}_statement`],
                inputFormat: req.body[`question${i}_inputFormat`],
                outputFormat: req.body[`question${i}_outputFormat`],
                constraints: req.body[`question${i}_constraints`],
                weight: parseInt(req.body[`question${i}_weight`]),
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

        // Here you would typically save to database
        console.log('Exam created:', examData);
        
        // For now, just redirect back to dashboard
        res.redirect('/admin-dashboard');
        
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).send('Error creating exam');
    }
});

export default router;

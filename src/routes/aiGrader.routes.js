import express from 'express';
import OpenAICodeGrader from '../services/openaiGrader.js';

const router = express.Router();

// AI code grading endpoint
router.post('/api/v1/grade-code', async (req, res) => {
  try {
    const {
      source_code,
      language,
      problem_title,
      problem_statement,
      constraints,
      test_results
    } = req.body;

    // Normalize test results to use 'status' field for pass/fail
    const normalizedTestResults = (test_results || []).map(tr => ({
      ...tr,
      status: tr.passed ? 'Accepted' : 'Failed'
    }));

    const grader = new OpenAICodeGrader();
    const gradingResult = await grader.gradeCode({
      sourceCode: source_code,
      language,
      problemTitle: problem_title,
      problemStatement: problem_statement,
      constraints,
      testResults: normalizedTestResults
    });

    res.json({ success: true, aiGrading: gradingResult });
  } catch (error) {
    console.error('AI grading error:', error);
    res.status(500).json({ success: false, error: error.message || 'AI grading failed' });
  }
});

export default router;

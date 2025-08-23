import ExamResult from '../models/examResult.model.js';

/**
 * Save exam result to database
 * @param {Object} resultData - Exam result data
 * @returns {Promise<ExamResult>} - Saved exam result
 */
export async function saveExamResult(resultData) {
    try {
        const {
            userId,
            examId,
            examTitle,
            startTime,
            endTime,
            duration,
            totalScore,
            maxScore,
            questionsAttempted,
            totalQuestions,
            questionResults,
            submissionData
        } = resultData;

        // Calculate time taken
        const timeTaken = endTime && startTime ? 
            Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60)) : 
            0;

        // Create new exam result
        const examResult = new ExamResult({
            userId,
            examId,
            examTitle,
            startTime,
            endTime,
            duration,
            timeTaken,
            status: 'completed',
            totalScore: totalScore || 0,
            maxScore: maxScore || 0,
            questionsAttempted: questionsAttempted || 0,
            totalQuestions: totalQuestions || 0,
            questionResults: questionResults || [],
            submissionData: submissionData || {}
        });

        const savedResult = await examResult.save();
        console.log(`Exam result saved for user ${userId}, exam ${examId}`);
        
        return savedResult;
    } catch (error) {
        console.error('Error saving exam result:', error);
        throw error;
    }
}

/**
 * Update existing exam result
 * @param {String} userId - User ID
 * @param {String} examId - Exam ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<ExamResult>} - Updated exam result
 */
export async function updateExamResult(userId, examId, updateData) {
    try {
        const result = await ExamResult.findOneAndUpdate(
            { userId, examId },
            updateData,
            { new: true, upsert: false }
        );

        if (!result) {
            throw new Error('Exam result not found');
        }

        console.log(`Exam result updated for user ${userId}, exam ${examId}`);
        return result;
    } catch (error) {
        console.error('Error updating exam result:', error);
        throw error;
    }
}

/**
 * Get exam result for a user and exam
 * @param {String} userId - User ID
 * @param {String} examId - Exam ID
 * @returns {Promise<ExamResult>} - Exam result
 */
export async function getExamResult(userId, examId) {
    try {
        const result = await ExamResult.findOne({ userId, examId });
        return result;
    } catch (error) {
        console.error('Error fetching exam result:', error);
        throw error;
    }
}

/**
 * Start a new exam session
 * @param {Object} sessionData - Exam session data
 * @returns {Promise<ExamResult>} - Created exam result
 */
export async function startExamSession(sessionData) {
    try {
        const {
            userId,
            examId,
            examTitle,
            duration,
            totalQuestions,
            maxScore,
            submissionData
        } = sessionData;

        // Check if user already has a result for this exam
        const existingResult = await ExamResult.findOne({ userId, examId });
        
        if (existingResult && existingResult.status === 'completed') {
            throw new Error('Exam already completed');
        }

        // Create or update exam session
        const examResult = await ExamResult.findOneAndUpdate(
            { userId, examId },
            {
                userId,
                examId,
                examTitle,
                startTime: new Date(),
                duration,
                status: 'in_progress',
                totalQuestions,
                maxScore,
                submissionData: submissionData || {}
            },
            { new: true, upsert: true }
        );

        console.log(`Exam session started for user ${userId}, exam ${examId}`);
        return examResult;
    } catch (error) {
        console.error('Error starting exam session:', error);
        throw error;
    }
}

/**
 * Complete exam session
 * @param {String} userId - User ID
 * @param {String} examId - Exam ID
 * @param {Object} completionData - Completion data
 * @returns {Promise<ExamResult>} - Completed exam result
 */
export async function completeExamSession(userId, examId, completionData) {
    try {
        const {
            totalScore,
            questionsAttempted,
            questionResults,
            submissionData
        } = completionData;

        const result = await ExamResult.findOneAndUpdate(
            { userId, examId, status: 'in_progress' },
            {
                endTime: new Date(),
                status: 'completed',
                totalScore: totalScore || 0,
                questionsAttempted: questionsAttempted || 0,
                questionResults: questionResults || [],
                submissionData: {
                    ...submissionData,
                    completedAt: new Date()
                }
            },
            { new: true }
        );

        if (!result) {
            throw new Error('Active exam session not found');
        }

        console.log(`Exam session completed for user ${userId}, exam ${examId}`);
        return result;
    } catch (error) {
        console.error('Error completing exam session:', error);
        throw error;
    }
}

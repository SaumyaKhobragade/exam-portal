import OpenAI from 'openai';
import GeminiCodeGrader from './geminiGrader.js';
import HuggingFaceCodeGrader from './huggingfaceGrader.js';
import FallbackCodeGrader from './fallbackGrader.js';

class OpenAICodeGrader {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.geminiGrader = new GeminiCodeGrader();
        this.huggingfaceGrader = new HuggingFaceCodeGrader();
        this.fallbackGrader = new FallbackCodeGrader();
        this.gradingRubric = {
            correctness: 10,
            codeQuality: 10,
            efficiency: 10,
            bestPractices: 10
        };
    }

    async gradeCode(codeSubmission) {
        const {
            sourceCode,
            language,
            problemTitle,
            problemStatement,
            constraints,
            testResults,
            expectedOutput,
            actualOutput
        } = codeSubmission;

        try {
            const prompt = this.buildGradingPrompt({
                sourceCode,
                language,
                problemTitle,
                problemStatement,
                constraints,
                testResults,
                expectedOutput,
                actualOutput
            });

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert programming instructor and code reviewer. Provide comprehensive, constructive feedback on student code submissions for coding challenges."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });

            const feedback = response.choices[0].message.content;
            return this.parseGradingResponse(feedback, testResults);

        } catch (error) {
            console.error('OpenAI API Error:', error);
            console.log('Trying Google Gemini as fallback...');
            
            // Try Google Gemini as first fallback
            try {
                const geminiResult = await this.geminiGrader.gradeCode({
                    sourceCode,
                    language,
                    problemTitle,
                    problemStatement,
                    constraints,
                    testResults,
                    expectedOutput,
                    actualOutput
                });
                
                if (geminiResult.success) {
                    console.log('Google Gemini grading successful');
                    return geminiResult;
                } else {
                    console.log('Google Gemini grading failed:', geminiResult.error);
                }
            } catch (geminiError) {
                console.error('Gemini grading error:', geminiError);
            }

            console.log('Trying Hugging Face as fallback...');
            
            // Try Hugging Face as second fallback
            try {
                const huggingfaceResult = await this.huggingfaceGrader.gradeCode({
                    sourceCode,
                    language,
                    problemTitle,
                    problemStatement,
                    constraints,
                    testResults,
                    expectedOutput,
                    actualOutput
                });
                
                if (huggingfaceResult.success) {
                    console.log('Hugging Face grading successful');
                    return huggingfaceResult;
                } else {
                    console.log('Hugging Face grading failed:', huggingfaceResult.error);
                }
            } catch (hfError) {
                console.error('Hugging Face grading error:', hfError);
            }
            
            console.log('Falling back to rule-based grading...');
            
            // Use rule-based grader as final fallback
            return await this.fallbackGrader.gradeCode(
                sourceCode,
                language,
                testResults,
                problemStatement,
                constraints
            );
        }
    }

    buildGradingPrompt({
        sourceCode,
        language,
        problemTitle,
        problemStatement,
        constraints,
        testResults,
        expectedOutput,
        actualOutput
    }) {
        const passedTests = testResults ? testResults.filter(t => t.passed).length : 0;
        const totalTests = testResults ? testResults.length : 0;
        
        return `
Please evaluate this ${language} code submission for the following coding problem:

**Problem:** ${problemTitle}
**Description:** ${problemStatement}
**Constraints:** ${constraints}

**Student's Code:**
\`\`\`${language}
${sourceCode}
\`\`\`

**Test Results:** ${passedTests}/${totalTests} tests passed
${testResults ? testResults.map((test, i) => 
    `Test ${i + 1}: ${test.passed ? 'PASSED' : 'FAILED'}\n    Input: ${test.input || 'N/A'}\n    Expected: ${test.expected_output || 'N/A'}\n    Actual: ${test.actual_output || 'N/A'}`
).join('\n') : 'No test results available'}

Please provide a comprehensive evaluation in the following JSON format:
{
    "score": <number between 0-10>,
    "grade": "<letter grade A-F>",
    "correctness": {
        "score": <0-10>,
        "feedback": "<feedback on correctness>"
    },
    "codeQuality": {
        "score": <0-10>,
        "feedback": "<feedback on code quality, style, readability>"
    },
    "efficiency": {
        "score": <0-10>,
        "feedback": "<feedback on efficiency, algorithm, performance>"
    },
    "bestPractices": {
        "score": <0-10>,
        "feedback": "<feedback on best practices, conventions>"
    },
    "strengths": ["<list>"],
    "improvements": ["<list>"],
    "hints": ["<list>"]
}

Also provide a brief summary of the code's strengths and areas for improvement.
`;
    }

    parseGradingResponse(feedback, testResults) {
        try {
            // Try to parse JSON response
            const gradingData = JSON.parse(feedback);
            // Normalize all scores to 10 scale
            function normalizeTo10(score) {
                if (!score) return 0;
                if (score > 10 && score <= 25) return Math.round((score / 2.5) * 10) / 10;
                if (score > 10 && score <= 30) return Math.round((score / 3) * 10) / 10;
                if (score > 10 && score <= 40) return Math.round((score / 4) * 10) / 10;
                if (score > 40 && score <= 100) return Math.round((score / 10) * 10) / 10;
                return Math.round(score * 10) / 10;
            }
            gradingData.score = normalizeTo10(gradingData.score);
            if (gradingData.correctness && gradingData.correctness.score !== undefined) gradingData.correctness.score = normalizeTo10(gradingData.correctness.score);
            if (gradingData.codeQuality && gradingData.codeQuality.score !== undefined) gradingData.codeQuality.score = normalizeTo10(gradingData.codeQuality.score);
            if (gradingData.efficiency && gradingData.efficiency.score !== undefined) gradingData.efficiency.score = normalizeTo10(gradingData.efficiency.score);
            if (gradingData.bestPractices && gradingData.bestPractices.score !== undefined) gradingData.bestPractices.score = normalizeTo10(gradingData.bestPractices.score);
            return {
                success: true,
                aiGrading: gradingData,
                testResults: testResults,
                timestamp: new Date().toISOString()
            };
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Fallback to extracting key information
            return {
                success: true,
                aiGrading: {
                    score: this.extractScore(feedback) || this.calculateFallbackGrade(testResults),
                    grade: this.calculateLetterGrade(this.extractScore(feedback) || this.calculateFallbackGrade(testResults)),
                    overallFeedback: feedback,
                    correctness: { score: 0, feedback: "Unable to parse detailed feedback" },
                    codeQuality: { score: 0, feedback: "Unable to parse detailed feedback" },
                    efficiency: { score: 0, feedback: "Unable to parse detailed feedback" },
                    bestPractices: { score: 0, feedback: "Unable to parse detailed feedback" },
                    strengths: [],
                    improvements: [],
                    hints: []
                },
                testResults: testResults,
                timestamp: new Date().toISOString(),
                warning: 'AI response was not in expected format'
            };
        }
    }

    extractScore(text) {
        const scoreMatch = text.match(/score["\s]*:["\s]*(\d+)/i);
        if (scoreMatch) {
            const score = parseInt(scoreMatch[1]);
            if (score > 10 && score <= 25) return Math.round((score / 2.5) * 10) / 10;
            if (score > 10 && score <= 30) return Math.round((score / 3) * 10) / 10;
            if (score > 10 && score <= 40) return Math.round((score / 4) * 10) / 10;
            if (score > 40 && score <= 100) return Math.round((score / 10) * 10) / 10;
            return score;
        }
        return null;
    }

    calculateFallbackGrade(testResults) {
    if (!testResults || testResults.length === 0) return 0;
    const passedTests = testResults.filter(t => t.passed).length;
    const passRate = (passedTests / testResults.length);
    // Basic grading out of 10 based on test passage
    return Math.round(passRate * 10 * 10) / 10;
    }

    calculateLetterGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    async quickCodeReview(sourceCode, language) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a code reviewer. Provide brief, actionable feedback on code quality and potential improvements."
                    },
                    {
                        role: "user",
                        content: `Review this ${language} code and provide 3-5 key suggestions:\n\`\`\`${language}\n${sourceCode}\n\`\`\``
                    }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            return {
                success: true,
                feedback: response.choices[0].message.content
            };
        } catch (error) {
            console.error('OpenAI quick review error:', error);
            console.log('Trying Hugging Face for quick review...');
            
            // Try Hugging Face for quick review
            try {
                const hfReview = await this.huggingfaceGrader.quickCodeReview(sourceCode, language);
                if (hfReview.success) {
                    console.log('Hugging Face quick review successful');
                    return hfReview;
                }
            } catch (hfError) {
                console.error('Hugging Face quick review error:', hfError);
            }
            
            console.log('Using fallback quick review...');
            
            // Use fallback grader for quick review
            return await this.fallbackGrader.quickCodeReview(sourceCode, language);
        }
    }
}

export default OpenAICodeGrader;

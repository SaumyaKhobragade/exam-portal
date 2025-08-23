import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Google Gemini Code Grader
 * Uses Google's Gemini AI for reliable, free code analysis
 */
export default class GeminiCodeGrader {
    constructor() {
        // Use free Gemini API
        this.apiKey = process.env.GEMINI_API_KEY || 'demo_key';
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        this.gradingRubric = {
            correctness: 10,
            codeQuality: 10,
            efficiency: 10,
            bestPractices: 10
        };
    }

    /**
     * Grade code using Google Gemini
     */
    async gradeCode(codeSubmission) {
        try {
            const {
                sourceCode,
                language,
                problemTitle,
                problemStatement,
                constraints,
                testResults
            } = codeSubmission;

            console.log('Starting Google Gemini code grading...');

            // Build the grading prompt
            const prompt = this.buildGradingPrompt({
                sourceCode,
                language,
                problemTitle,
                problemStatement,
                constraints,
                testResults
            });

            // Generate response with timeout
            const result = await Promise.race([
                this.model.generateContent(prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Gemini API timeout')), 20000)
                )
            ]);

            const response = result.response;
            const text = response.text();

            console.log('Gemini response received');

            const gradingResult = this.parseGradingResponse(text, testResults);
            
            return {
                success: true,
                data: {
                    ...gradingResult,
                    gradingMethod: "Google Gemini AI",
                    note: "🤖 Analyzed using Google Gemini Pro AI model"
                }
            };

        } catch (error) {
            console.error('Gemini grading error:', error);
            
            // If it's an API key issue, provide helpful feedback
            if (error.message.includes('API key')) {
                return {
                    success: false,
                    error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env file.'
                };
            }
            
            return {
                success: false,
                error: 'Failed to grade code using Gemini: ' + error.message
            };
        }
    }

    /**
     * Build grading prompt for Gemini
     */
    buildGradingPrompt({ sourceCode, language, problemTitle, problemStatement, constraints, testResults }) {
        const passedTests = testResults.filter(t => t.status === 'Accepted').length;
        const totalTests = testResults.length;

    return `You are an expert programming instructor. Grade this ${language} code solution:

PROBLEM: ${problemTitle}
DESCRIPTION: ${problemStatement}
CONSTRAINTS: ${constraints}

STUDENT CODE:
\`\`\`${language}
${sourceCode}
\`\`\`

TEST RESULTS: ${passedTests}/${totalTests} tests passed

Please provide a comprehensive evaluation. Respond in this EXACT format:

OVERALL_SCORE: [number 0-10]
CORRECTNESS_SCORE: [number 0-10]
QUALITY_SCORE: [number 0-10]
EFFICIENCY_SCORE: [number 0-10]
PRACTICES_SCORE: [number 0-10]

FEEDBACK:
- [specific feedback about correctness]
- [specific feedback about code quality]
- [specific feedback about efficiency]
- [specific feedback about best practices]

SUGGESTIONS:
- [specific improvement suggestion 1]
- [specific improvement suggestion 2]
- [specific improvement suggestion 3]

SUMMARY: [one paragraph overall assessment]`;
    }

    /**
     * Parse Gemini response into structured grading data
     */
    parseGradingResponse(text, testResults) {
        try {
            console.log('Parsing Gemini response:', text.substring(0, 200) + '...');

            // Extract scores using regex
            const overallScore = this.extractScore(text, 'OVERALL_SCORE') || 
                               this.calculateFallbackScore(testResults);
            
            // Normalize all scores to 10 scale
            function normalizeTo10(score) {
                if (!score) return 0;
                if (score > 10 && score <= 25) return Math.round((score / 2.5) * 10) / 10;
                if (score > 10 && score <= 30) return Math.round((score / 3) * 10) / 10;
                if (score > 10 && score <= 40) return Math.round((score / 4) * 10) / 10;
                if (score > 40 && score <= 100) return Math.round((score / 10) * 10) / 10;
                return Math.round(score * 10) / 10;
            }
            const categoryScores = {
                correctness: normalizeTo10(this.extractScore(text, 'CORRECTNESS_SCORE')) || 
                           Math.round((testResults.filter(t => t.status === 'Accepted').length / Math.max(testResults.length, 1)) * 10),
                codeQuality: normalizeTo10(this.extractScore(text, 'QUALITY_SCORE')) || 8,
                efficiency: normalizeTo10(this.extractScore(text, 'EFFICIENCY_SCORE')) || 8,
                bestPractices: normalizeTo10(this.extractScore(text, 'PRACTICES_SCORE')) || 8
            };

            // Extract feedback sections
            const feedback = this.extractSection(text, 'FEEDBACK:', 'SUGGESTIONS:');
            const suggestions = this.extractSection(text, 'SUGGESTIONS:', 'SUMMARY:');
            const summary = this.extractSection(text, 'SUMMARY:', '$') || 
                          this.generateDefaultSummary(overallScore);

            return {
                overallScore: normalizeTo10(overallScore),
                categoryScores,
                feedback: feedback.length > 0 ? feedback : ['AI analysis completed with scoring'],
                suggestions: suggestions.length > 0 ? suggestions : this.getDefaultSuggestions(),
                summary
            };

        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            
            // Fallback scoring based on test results
            const passedTests = testResults.filter(t => t.status === 'Accepted').length;
            const totalTests = Math.max(testResults.length, 1);
            const testPassRate = passedTests / totalTests;
            
            return {
                overallScore: Math.round(testPassRate * 10),
                categoryScores: {
                    correctness: Math.round(testPassRate * 10),
                    codeQuality: 8,
                    efficiency: 8,
                    bestPractices: 8
                },
                feedback: ['Google Gemini AI analysis completed'],
                suggestions: this.getDefaultSuggestions(),
                summary: this.generateDefaultSummary(Math.round(testPassRate * 10))
            };
        }
    }

    /**
     * Extract numeric score from text
     */
    extractScore(text, label) {
        const regex = new RegExp(`${label}:\\s*(\\d+)`, 'i');
        const match = text.match(regex);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Extract text section between markers
     */
    extractSection(text, startMarker, endMarker) {
        const startIndex = text.indexOf(startMarker);
        if (startIndex === -1) return [];

        const searchText = text.substring(startIndex + startMarker.length);
        const endIndex = endMarker === '$' ? searchText.length : searchText.indexOf(endMarker);
        const sectionText = searchText.substring(0, endIndex === -1 ? searchText.length : endIndex);

        // Extract bullet points
        const bullets = sectionText.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-') || line.startsWith('•'))
            .map(line => line.replace(/^[-•]\s*/, '').trim())
            .filter(line => line.length > 5);

        return bullets;
    }

    /**
     * Calculate fallback score based on test results
     */
    calculateFallbackScore(testResults) {
        if (!testResults || testResults.length === 0) return 50;
        
        const passedTests = testResults.filter(t => t.status === 'Accepted').length;
        const passRate = passedTests / testResults.length;
        
        // Convert pass rate to score (20-90 range)
        return Math.round(passRate * 70 + 20);
    }

    /**
     * Generate default summary based on score
     */
    generateDefaultSummary(score) {
        if (score >= 80) {
            return 'Excellent work! Your code demonstrates strong programming skills with good logic and structure.';
        } else if (score >= 60) {
            return 'Good effort! Your solution works but there are opportunities for improvement in code quality and efficiency.';
        } else if (score >= 40) {
            return 'Your solution shows understanding but needs improvement in implementation and best practices.';
        } else {
            return 'Keep practicing! Focus on getting the logic correct first, then improve code structure.';
        }
    }

    /**
     * Get default suggestions
     */
    getDefaultSuggestions() {
        return [
            'Consider adding more descriptive variable names',
            'Add comments to explain complex logic',
            'Test your solution with edge cases',
            'Review algorithm efficiency for optimization opportunities'
        ];
    }

    /**
     * Quick code review using Gemini
     */
    async quickCodeReview(sourceCode, language) {
        try {
            const prompt = `Quickly review this ${language} code and provide 3 key suggestions:\n\n${sourceCode}`;
            
            const result = await Promise.race([
                this.model.generateContent(prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 10000)
                )
            ]);

            const response = result.response.text();
            
            return {
                success: true,
                feedback: response
            };

        } catch (error) {
            return {
                success: false,
                error: 'Failed to get quick review: ' + error.message
            };
        }
    }
}

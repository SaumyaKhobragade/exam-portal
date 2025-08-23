import { HfInference } from '@huggingface/inference';

/**
 * Hugging Face Code Grader
 * Uses Hugging Face models for intelligent code analysis and grading
 */
export default class HuggingFaceCodeGrader {
    constructor() {
        // Initialize with API key if available
        if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'hf_your_token_here') {
            this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
            this.hasApiKey = true;
        } else {
            console.log('Hugging Face API key not configured, will use free models');
            this.hf = new HfInference(); // Use free tier
            this.hasApiKey = false;
        }
        
        // Fallback models to try in order (free and paid)
        this.models = this.hasApiKey ? [
            'gpt2',
            'distilgpt2',
            'microsoft/DialoGPT-small',
            'facebook/blenderbot-400M-distill'
        ] : [
            'gpt2',
            'distilgpt2'
        ];
        
        this.gradingRubric = {
            correctness: 10,
            codeQuality: 10,
            efficiency: 10,
            bestPractices: 10
        };
    }

    /**
     * Grade code using Hugging Face models
     */
    async gradeCode(codeSubmission) {
        try {
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

            console.log('Starting Hugging Face code grading...');

            // Build the grading prompt
            const prompt = this.buildGradingPrompt({
                sourceCode,
                language,
                problemTitle,
                problemStatement,
                constraints,
                testResults
            });

            // Try different models until one works
            let response;
            for (const model of this.models) {
                try {
                    console.log(`Trying Hugging Face model: ${model}`);
                    response = await this.tryModel(model, prompt);
                    if (response) {
                        console.log(`Successfully used model: ${model}`);
                        break;
                    }
                } catch (error) {
                    console.log(`Model ${model} failed:`, error.message);
                    continue;
                }
            }

            if (!response) {
                throw new Error('All Hugging Face models failed');
            }

            const gradingResult = this.parseGradingResponse(response, testResults);
            
            return {
                success: true,
                data: {
                    ...gradingResult,
                    gradingMethod: "Hugging Face AI Analysis",
                    note: "🤗 Analyzed using Hugging Face transformer models"
                }
            };

        } catch (error) {
            console.error('Hugging Face grading error:', error);
            return {
                success: false,
                error: 'Failed to grade code using Hugging Face: ' + error.message
            };
        }
    }

    /**
     * Try a specific Hugging Face model with timeout
     */
    async tryModel(modelName, prompt) {
        try {
            console.log(`Attempting model ${modelName}...`);
            
            // Set a timeout for the request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
            });

            const requestPromise = this.makeModelRequest(modelName, prompt);
            
            const result = await Promise.race([requestPromise, timeoutPromise]);
            
            if (result && (typeof result === 'string' || result.generated_text)) {
                return result;
            }
            
            throw new Error('Invalid response format');
            
        } catch (error) {
            console.log(`Model ${modelName} failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Make actual request to Hugging Face model
     */
    async makeModelRequest(modelName, prompt) {
        try {
            // Use text generation for all models
            const result = await this.hf.textGeneration({
                model: modelName,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false
                }
            });
            
            return result.generated_text || result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Build grading prompt for Hugging Face models
     */
    buildGradingPrompt({ sourceCode, language, problemTitle, problemStatement, constraints, testResults }) {
    const passedTests = testResults.filter(t => t.status === 'Accepted').length;
    const totalTests = testResults.length;

        return `Grade this ${language} code solution for the problem: "${problemTitle}"

    Code:
    ${sourceCode}

    Tests passed: ${passedTests}/${totalTests}

    Please provide a comprehensive code review with scores strictly out of 10 and specific feedback. Rate the code in these categories:
    1. Correctness (out of 10): Based on test results and logic
    2. Code Quality (out of 10): Readability, structure, naming
    3. Efficiency (out of 10): Algorithm complexity and optimization
    4. Best Practices (out of 10): Following language conventions

    Additionally, include:
    - A paragraph describing the weaknesses of the code
    - The time and space complexity of the main solution (in Big O notation)

    Format your response as a structured analysis with:
    - Overall score out of 10
    - Category scores (each out of 10)
    - Specific feedback and suggestions
    - Summary of strengths and improvements needed
    - Weaknesses: <paragraph>
    - Time Complexity: <Big O>
    - Space Complexity: <Big O>

    Focus on being educational and constructive.`;

    }

    /**
     * Parse the Hugging Face response into structured grading data
     */
    parseGradingResponse(response, testResults) {
        try {
            // Extract text from response
            const text = typeof response === 'string' ? response : 
                        response.generated_text || 
                        response.text || 
                        JSON.stringify(response);

            console.log('Hugging Face response:', text);

            // Calculate base scores from test results
            const passedTests = testResults.filter(t => t.status === 'Accepted').length;
            const totalTests = testResults.length;
            const testPassRate = totalTests > 0 ? passedTests / totalTests : 0;


            // Helper to normalize a score to 10
            function normalizeTo10(score) {
                if (!score) return 0;
                if (score > 10 && score <= 25) return Math.round(score / 2.5 * 10) / 10; // out of 25
                if (score > 10 && score <= 40) return Math.round(score / 4 * 10) / 10; // out of 40
                if (score > 40 && score <= 100) return Math.round(score / 10 * 10) / 10; // out of 100
                return Math.round(score * 10) / 10;
            }

            // Extract and normalize scores
            let overallScoreRaw = this.extractScore(text, 'overall|total|score');
            let overallScore = overallScoreRaw ? normalizeTo10(overallScoreRaw) : Math.round(testPassRate * 10 * 10) / 10;

            const categoryScores = {
                correctness: normalizeTo10(this.extractScore(text, 'correctness')) || Math.round(testPassRate * this.gradingRubric.correctness * 10) / 10,
                codeQuality: normalizeTo10(this.extractScore(text, 'quality|readability')) || Math.round(this.gradingRubric.codeQuality * 0.8 * 10) / 10,
                efficiency: normalizeTo10(this.extractScore(text, 'efficiency|performance')) || Math.round(this.gradingRubric.efficiency * 0.75 * 10) / 10,
                bestPractices: normalizeTo10(this.extractScore(text, 'practices|conventions')) || Math.round(this.gradingRubric.bestPractices * 0.8 * 10) / 10
            };

            // Extract feedback sections
            const feedback = this.extractFeedback(text);
            const suggestions = this.extractSuggestions(text);
            const summary = this.extractSummary(text, overallScore);
            const weaknesses = this.extractSection(text, 'weakness(es)?');
            const timeComplexity = this.extractSection(text, 'time complexity');
            const spaceComplexity = this.extractSection(text, 'space complexity');

            return {
                overallScore: Math.min(100, overallScore),
                categoryScores,
                feedback,
                suggestions,
                summary,
                weaknesses,
                timeComplexity,
                spaceComplexity
            };
        } catch (error) {
            console.error('Error parsing Hugging Face response:', error);
            // Fallback scoring based on test results
            const passedTests = testResults.filter(t => t.status === 'Accepted').length;
            const totalTests = testResults.length;
            const testPassRate = totalTests > 0 ? passedTests / totalTests : 0;
            return {
                overallScore: Math.round(testPassRate * 70 + 20),
                categoryScores: {
                    correctness: Math.round(testPassRate * this.gradingRubric.correctness),
                    codeQuality: Math.round(this.gradingRubric.codeQuality * 0.8),
                    efficiency: Math.round(this.gradingRubric.efficiency * 0.75),
                    bestPractices: Math.round(this.gradingRubric.bestPractices * 0.8)
                },
                feedback: ['Hugging Face analysis completed with basic scoring'],
                suggestions: ['Review your code structure and test more edge cases'],
                summary: 'Code analysis completed using Hugging Face AI models',
                weaknesses: '',
                timeComplexity: '',
                spaceComplexity: ''
            };
        }
    }

    /**
     * Extract a specific section (e.g., weaknesses, time/space complexity) from the AI response
     */
    extractSection(text, sectionName) {
        const regex = new RegExp(`${sectionName}[:\s]+([^\n]+)`, 'i');
        const match = text.match(regex);
        return match && match[1] ? match[1].trim() : '';
    }

    /**
     * Extract numeric scores from text
     */
    extractScore(text, pattern) {
        const regex = new RegExp(`(?:${pattern}).*?(?::|is|=)\\s*(\\d+)(?:/100|%|\\.\\d+)?`, 'i');
        const match = text.match(regex);
        if (match) {
            const score = parseInt(match[1]);
                // Normalize any score above 10 to 10-scale
                if (score > 10 && score <= 25) return Math.round((score / 2.5) * 10) / 10;
                if (score > 10 && score <= 30) return Math.round((score / 3) * 10) / 10;
                if (score > 10 && score <= 40) return Math.round((score / 4) * 10) / 10;
                if (score > 40 && score <= 100) return Math.round((score / 10) * 10) / 10;
                return score;
        }
        return null;
    }

    /**
     * Extract feedback from AI response
     */
    extractFeedback(text) {
        const feedback = [];
        
        // Look for common feedback patterns
        const patterns = [
            /feedback[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /analysis[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /review[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /comments?[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi
        ];

        patterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim().length > 10) {
                    feedback.push(match[1].trim());
                }
            }
        });

        // If no specific feedback found, extract sentences with key words
        if (feedback.length === 0) {
            const sentences = text.split(/[.!?]+/);
            sentences.forEach(sentence => {
                if (sentence.match(/\b(good|bad|improve|better|consider|should|could|excellent|poor)\b/i) &&
                    sentence.length > 20) {
                    feedback.push(sentence.trim() + '.');
                }
            });
        }

        return feedback.length > 0 ? feedback : ['AI analysis provided general code review'];
    }

    /**
     * Extract suggestions from AI response
     */
    extractSuggestions(text) {
        const suggestions = [];
        
        // Look for suggestion patterns
        const patterns = [
            /suggestions?[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /improvements?[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /recommendations?[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /consider[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi
        ];

        patterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim().length > 5) {
                    suggestions.push(match[1].trim());
                }
            }
        });

        // Default suggestions if none found
        if (suggestions.length === 0) {
            suggestions.push(
                'Consider adding more comments to explain your logic',
                'Test your solution with edge cases',
                'Review algorithm efficiency for large inputs',
                'Follow language-specific naming conventions'
            );
        }

        return suggestions;
    }

    /**
     * Extract or generate summary
     */
    extractSummary(text, score) {
        // Look for summary patterns
        const summaryPatterns = [
            /summary[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /overall[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi,
            /conclusion[:\s]+(.*?)(?:\n\n|\n[A-Z])/gi
        ];

        for (const pattern of summaryPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[1].trim().length > 20) {
                return match[1].trim();
            }
        }

        // Generate summary based on score
        if (score >= 80) {
            return 'Excellent work! Your code demonstrates strong programming skills with good structure and logic.';
        } else if (score >= 60) {
            return 'Good effort! Your solution works but there are opportunities for improvement in code quality and efficiency.';
        } else if (score >= 40) {
            return 'Your solution shows understanding but needs improvement in implementation and best practices.';
        } else {
            return 'Keep practicing! Focus on getting the logic correct first, then improve code structure.';
        }
    }

    /**
     * Quick code review using Hugging Face
     */
    async quickCodeReview(sourceCode, language) {
        try {
            const prompt = `Review this ${language} code briefly and provide 3-5 key suggestions:\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
            
            for (const model of this.models) {
                try {
                    const response = await this.tryModel(model, prompt);
                    if (response) {
                        return {
                            success: true,
                            feedback: typeof response === 'string' ? response : JSON.stringify(response)
                        };
                    }
                } catch (error) {
                    continue;
                }
            }

            return {
                success: false,
                error: 'All Hugging Face models failed for quick review'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Failed to get quick review: ' + error.message
            };
        }
    }
}

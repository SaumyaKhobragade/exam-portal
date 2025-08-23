/**
 * Fallback AI-like Code Grader
 * Provides intelligent code analysis without external API dependency
 */

export default class FallbackCodeGrader {
    constructor() {
        this.gradingRubric = {
            correctness: 30,
            codeQuality: 25,
            efficiency: 25,
            bestPractices: 20
        };
    }

    /**
     * Grade code using rule-based analysis
     */
    async gradeCode(code, language, testResults, problemDescription, constraints) {
        try {
            const analysis = this.analyzeCode(code, language, testResults, problemDescription, constraints);
            const scores = this.calculateScores(analysis, testResults);
            const feedback = this.generateFeedback(analysis, scores, testResults);

            return {
                success: true,
                data: {
                    overallScore: scores.overall,
                    categoryScores: {
                        correctness: scores.correctness,
                        codeQuality: scores.codeQuality,
                        efficiency: scores.efficiency,
                        bestPractices: scores.bestPractices
                    },
                    feedback: feedback,
                    summary: this.generateSummary(scores, analysis),
                    suggestions: this.generateSuggestions(analysis, language),
                    gradingMethod: "Intelligent Rule-Based Analysis",
                    note: "📊 Analyzed using advanced pattern recognition and coding best practices"
                }
            };
        } catch (error) {
            console.error('Fallback grading error:', error);
            return {
                success: false,
                error: 'Failed to analyze code'
            };
        }
    }

    /**
     * Analyze code using pattern matching and heuristics
     */
    analyzeCode(code, language, testResults, problemDescription, constraints) {
        const analysis = {
            language: language,
            lineCount: code.split('\n').length,
            hasComments: /\/\*[\s\S]*?\*\/|\/\/.*$/gm.test(code) || /#.*$/gm.test(code),
            hasProperIndentation: this.checkIndentation(code, language),
            hasVariableNaming: this.checkVariableNaming(code),
            hasFunctionStructure: this.checkFunctionStructure(code, language),
            complexityIssues: this.checkComplexity(code),
            bestPracticeViolations: this.checkBestPractices(code, language),
            algorithmicApproach: this.analyzeAlgorithmicApproach(code, language),
            errorHandling: this.checkErrorHandling(code, language),
            codeReusability: this.checkReusability(code)
        };

        return analysis;
    }

    /**
     * Check code indentation consistency
     */
    checkIndentation(code, language) {
        const lines = code.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) return true;

        // Check for consistent indentation
        const indentPattern = language === 'python' ? /^(\s*)/ : /^(\s*)/;
        let consistentIndentation = true;
        let hasProperNesting = false;

        lines.forEach(line => {
            const match = line.match(indentPattern);
            if (match && match[1].length > 0) {
                hasProperNesting = true;
                // Check if indentation is consistent (multiples of 2 or 4)
                if (match[1].length % 2 !== 0 && match[1].length % 4 !== 0) {
                    consistentIndentation = false;
                }
            }
        });

        return consistentIndentation && hasProperNesting;
    }

    /**
     * Check variable naming conventions
     */
    checkVariableNaming(code) {
        // Check for meaningful variable names (not single letters except for loops)
        const variablePattern = /(?:let|var|const|def|\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const variables = [];
        let match;

        while ((match = variablePattern.exec(code)) !== null) {
            variables.push(match[1]);
        }

        const meaningfulNames = variables.filter(name => 
            name.length > 1 && 
            !/^[ijkxyn]$/.test(name) && // Allow common loop/math variables
            !/^temp$|^tmp$|^test$/.test(name.toLowerCase())
        );

        return variables.length === 0 ? true : meaningfulNames.length / variables.length > 0.7;
    }

    /**
     * Check function structure
     */
    checkFunctionStructure(code, language) {
        const patterns = {
            python: /def\s+\w+\s*\([^)]*\):/g,
            javascript: /function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
            java: /(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\([^)]*\)\s*{/g,
            cpp: /\w+\s+\w+\s*\([^)]*\)\s*{/g
        };

        const pattern = patterns[language] || patterns.javascript;
        const functions = code.match(pattern) || [];
        
        return {
            hasFunctions: functions.length > 0,
            functionCount: functions.length,
            hasMainLogic: code.includes('main') || code.includes('if __name__')
        };
    }

    /**
     * Check code complexity
     */
    checkComplexity(code) {
        const issues = [];
        
        // Check for deeply nested structures
        const maxIndentation = Math.max(...code.split('\n').map(line => {
            const match = line.match(/^(\s*)/);
            return match ? match[1].length : 0;
        }));
        
        if (maxIndentation > 16) {
            issues.push('Deeply nested code structure');
        }

        // Check for long functions
        const functionBlocks = code.split(/(?:def |function |public |private )/);
        functionBlocks.forEach(block => {
            if (block.split('\n').length > 20) {
                issues.push('Function too long');
            }
        });

        // Check for repeated code patterns
        const lines = code.split('\n');
        const duplicateLines = lines.filter((line, index) => 
            line.trim().length > 5 && 
            lines.indexOf(line) !== index
        );
        
        if (duplicateLines.length > 2) {
            issues.push('Code duplication detected');
        }

        return issues;
    }

    /**
     * Check best practices
     */
    checkBestPractices(code, language) {
        const violations = [];

        // Check for magic numbers
        const magicNumbers = code.match(/\b(?!0|1)\d{2,}\b/g);
        if (magicNumbers && magicNumbers.length > 2) {
            violations.push('Magic numbers detected - consider using constants');
        }

        // Check for proper error handling
        if (language === 'python' && !code.includes('try') && !code.includes('except')) {
            if (code.includes('open(') || code.includes('int(') || code.includes('float(')) {
                violations.push('Missing error handling for potentially failing operations');
            }
        }

        // Check for global variables (basic check)
        if (language === 'python' && code.includes('global ')) {
            violations.push('Use of global variables');
        }

        return violations;
    }

    /**
     * Analyze algorithmic approach
     */
    analyzeAlgorithmicApproach(code, language) {
        const approaches = {
            loops: /for\s|while\s/.test(code),
            recursion: /def\s+\w+.*:\s*.*\w+\s*\(/s.test(code) && code.includes('return'),
            sorting: /sort|sorted/.test(code),
            searching: /find|search|index/.test(code),
            dataStructures: /list|dict|set|array|map/.test(code),
            algorithms: /binary|linear|bubble|merge|quick/.test(code.toLowerCase())
        };

        return approaches;
    }

    /**
     * Check error handling
     */
    checkErrorHandling(code, language) {
        if (language === 'python') {
            return code.includes('try') || code.includes('except');
        } else if (language === 'javascript') {
            return code.includes('try') || code.includes('catch');
        } else if (language === 'java') {
            return code.includes('try') || code.includes('catch') || code.includes('throws');
        }
        return false;
    }

    /**
     * Check code reusability
     */
    checkReusability(code) {
        const hasFunctions = /def\s|function\s|public\s.*\(/.test(code);
        const hasParameters = /\([^)]+\)/.test(code);
        const hasReturn = /return\s/.test(code);
        
        return hasFunctions && hasParameters && hasReturn;
    }

    /**
     * Calculate scores based on analysis
     */
    calculateScores(analysis, testResults) {
        // Correctness score based on test results
        const totalTests = testResults.length;
        const passedTests = testResults.filter(result => result.status === 'Accepted').length;
        const correctnessScore = totalTests > 0 ? (passedTests / totalTests) * this.gradingRubric.correctness : 0;

        // Code quality score
        let qualityScore = this.gradingRubric.codeQuality;
        if (!analysis.hasProperIndentation) qualityScore -= 5;
        if (!analysis.hasVariableNaming) qualityScore -= 5;
        if (!analysis.hasComments && analysis.lineCount > 10) qualityScore -= 3;
        if (analysis.complexityIssues.length > 0) qualityScore -= analysis.complexityIssues.length * 2;

        // Efficiency score
        let efficiencyScore = this.gradingRubric.efficiency;
        if (analysis.complexityIssues.includes('Deeply nested code structure')) efficiencyScore -= 8;
        if (analysis.complexityIssues.includes('Function too long')) efficiencyScore -= 5;
        if (!analysis.algorithmicApproach.loops && !analysis.algorithmicApproach.recursion && analysis.lineCount > 5) {
            efficiencyScore -= 5;
        }

        // Best practices score
        let practicesScore = this.gradingRubric.bestPractices;
        practicesScore -= analysis.bestPracticeViolations.length * 3;
        if (!analysis.hasFunctionStructure.hasFunctions && analysis.lineCount > 10) practicesScore -= 5;
        if (!analysis.errorHandling && analysis.lineCount > 15) practicesScore -= 3;

        // Ensure scores don't go below 0
        qualityScore = Math.max(0, qualityScore);
        efficiencyScore = Math.max(0, efficiencyScore);
        practicesScore = Math.max(0, practicesScore);

        const overall = correctnessScore + qualityScore + efficiencyScore + practicesScore;

        return {
            correctness: Math.round(correctnessScore),
            codeQuality: Math.round(qualityScore),
            efficiency: Math.round(efficiencyScore),
            bestPractices: Math.round(practicesScore),
            overall: Math.round(overall)
        };
    }

    /**
     * Generate detailed feedback
     */
    generateFeedback(analysis, scores, testResults) {
        const feedback = [];

        // Correctness feedback
        const passedTests = testResults.filter(r => r.status === 'Accepted').length;
        const totalTests = testResults.length;
        
        if (passedTests === totalTests) {
            feedback.push("✅ Excellent! Your solution passes all test cases.");
        } else if (passedTests > totalTests * 0.7) {
            feedback.push(`✅ Good work! Your solution passes ${passedTests}/${totalTests} test cases.`);
        } else {
            feedback.push(`⚠️ Your solution passes ${passedTests}/${totalTests} test cases. Review your logic.`);
        }

        // Code quality feedback
        if (!analysis.hasProperIndentation) {
            feedback.push("📝 Consider improving code indentation for better readability.");
        }
        if (!analysis.hasVariableNaming) {
            feedback.push("📝 Use more descriptive variable names to improve code clarity.");
        }
        if (!analysis.hasComments && analysis.lineCount > 10) {
            feedback.push("📝 Adding comments would help explain your logic.");
        }

        // Efficiency feedback
        if (analysis.complexityIssues.length > 0) {
            feedback.push(`⚡ Code complexity issues: ${analysis.complexityIssues.join(', ')}`);
        }

        // Best practices feedback
        if (analysis.bestPracticeViolations.length > 0) {
            feedback.push(`🎯 Best practice suggestions: ${analysis.bestPracticeViolations.join(', ')}`);
        }

        return feedback;
    }

    /**
     * Generate summary
     */
    generateSummary(scores, analysis) {
        if (scores.overall >= 80) {
            return "Excellent work! Your code demonstrates strong programming skills with good logic and structure.";
        } else if (scores.overall >= 60) {
            return "Good effort! Your solution works but there's room for improvement in code quality and efficiency.";
        } else if (scores.overall >= 40) {
            return "Your solution shows understanding of the problem but needs improvement in implementation and best practices.";
        } else {
            return "Keep practicing! Focus on getting the logic correct first, then improve code structure and efficiency.";
        }
    }

    /**
     * Generate improvement suggestions
     */
    generateSuggestions(analysis, language) {
        const suggestions = [];

        if (!analysis.hasProperIndentation) {
            suggestions.push("Use consistent indentation (2 or 4 spaces) to improve readability");
        }

        if (!analysis.hasVariableNaming) {
            suggestions.push("Choose descriptive variable names that explain their purpose");
        }

        if (analysis.complexityIssues.includes('Deeply nested code structure')) {
            suggestions.push("Try to reduce nesting by using early returns or breaking complex logic into functions");
        }

        if (!analysis.hasFunctionStructure.hasFunctions && analysis.lineCount > 10) {
            suggestions.push("Consider breaking your code into smaller functions for better organization");
        }

        if (!analysis.errorHandling && language === 'python') {
            suggestions.push("Add error handling with try-except blocks for more robust code");
        }

        if (suggestions.length === 0) {
            suggestions.push("Great job! Your code follows good practices. Keep up the excellent work!");
        }

        return suggestions;
    }

    /**
     * Quick code review
     */
    async quickCodeReview(code, language) {
        const analysis = this.analyzeCode(code, language, [], '', '');
        const quickFeedback = [];

        if (analysis.hasProperIndentation) quickFeedback.push("✅ Good indentation");
        else quickFeedback.push("⚠️ Check indentation");

        if (analysis.hasVariableNaming) quickFeedback.push("✅ Good variable names");
        else quickFeedback.push("⚠️ Improve variable names");

        if (analysis.complexityIssues.length === 0) quickFeedback.push("✅ Clean code structure");
        else quickFeedback.push("⚠️ Simplify code structure");

        return {
            success: true,
            feedback: quickFeedback.join(' | ')
        };
    }
}

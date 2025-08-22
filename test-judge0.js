import { validateExamQuestions, executeCode, LANGUAGE_IDS } from './src/services/judge0Service.js';

async function testJudge0Integration() {
    console.log('🔧 Testing Judge0 Integration...\n');

    // Test basic code execution
    try {
        console.log('1. Testing basic code execution...');
        const simpleCode = 'print("Hello, World!")';
        const result = await executeCode(simpleCode, LANGUAGE_IDS.python, '');
        console.log('✅ Basic execution successful:', result.stdout?.trim());
    } catch (error) {
        console.log('❌ Basic execution failed:', error.message);
    }

    // Test with sample exam questions
    try {
        console.log('\n2. Testing exam validation (structure only)...');
        const sampleQuestions = [
            {
                title: 'Simple Addition',
                statement: 'Add two numbers',
                testCases: [
                    { input: '5 3', expectedOutput: '8' },
                    { input: '10 20', expectedOutput: '30' }
                ]
            },
            {
                title: 'String Echo',
                statement: 'Print the input string',
                testCases: [
                    { input: 'hello', expectedOutput: 'hello' },
                    { input: 'world', expectedOutput: 'world' }
                ]
            }
        ];

        // Test with structure validation only (skipValidation = true)
        const structureResult = await validateExamQuestions(sampleQuestions, 'python', true);
        console.log('✅ Structure validation result:', {
            valid: structureResult.valid,
            questionsValidated: structureResult.questionsValidated,
            questionsWithErrors: structureResult.questionsWithErrors
        });

    } catch (error) {
        console.log('❌ Exam validation failed:', error.message);
    }

    console.log('\n🎉 Judge0 integration test completed!');
}

// Run the test
testJudge0Integration().catch(console.error);

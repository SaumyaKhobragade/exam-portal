// Test script to verify exam and test case integration
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

async function testExamIntegration() {
    console.log('Testing Exam Integration with Judge0...');
    
    // Test IDE route
    try {
        const ideResponse = await fetch(`${baseUrl}/ide`);
        const ideText = await ideResponse.text();
        
        console.log('\n=== IDE Route Test ===');
        console.log('Status:', ideResponse.status);
        
        // Check if exam data script tag exists
        if (ideText.includes('id="exam-data"')) {
            console.log('✅ Exam data script tag found');
            
            // Extract exam data
            const examDataMatch = ideText.match(/<script type="application\/json" id="exam-data">\s*(.*?)\s*<\/script>/s);
            if (examDataMatch) {
                try {
                    const examData = JSON.parse(examDataMatch[1]);
                    console.log('✅ Exam data is valid JSON');
                    console.log('Exam title:', examData.exam?.title || 'No title');
                    console.log('Questions count:', examData.exam?.questions?.length || 0);
                    
                    if (examData.exam?.questions?.length > 0) {
                        const firstQuestion = examData.exam.questions[0];
                        console.log('First question title:', firstQuestion.title);
                        console.log('Test cases count:', firstQuestion.testCases?.length || 0);
                        console.log('Constraints count:', firstQuestion.constraints?.length || 0);
                        
                        if (firstQuestion.testCases?.length > 0) {
                            console.log('✅ Test cases found in exam data');
                            console.log('Sample test case:', JSON.stringify(firstQuestion.testCases[0], null, 2));
                        } else {
                            console.log('❌ No test cases found');
                        }
                    }
                } catch (parseError) {
                    console.log('❌ Failed to parse exam data JSON:', parseError.message);
                }
            } else {
                console.log('❌ Could not extract exam data content');
            }
        } else {
            console.log('❌ Exam data script tag not found');
        }
        
        // Check if test cases container exists
        if (ideText.includes('id="testCasesContainer"')) {
            console.log('✅ Test cases container found in template');
        } else {
            console.log('❌ Test cases container not found');
        }
        
        // Check if constraints container exists
        if (ideText.includes('id="problemConstraints"')) {
            console.log('✅ Constraints container found in template');
        } else {
            console.log('❌ Constraints container not found');
        }
        
    } catch (error) {
        console.log('❌ IDE route error:', error.message);
    }
    
    // Test Judge0 API endpoint
    try {
        console.log('\n=== Judge0 API Test ===');
        
        const testCode = 'console.log("Hello World");';
        const testCases = [
            { input: '', expected_output: 'Hello World', stdin: '' }
        ];
        
        const judgeResponse = await fetch(`${baseUrl}/api/v1/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_code: testCode,
                language_id: 63, // JavaScript
                test_cases: testCases
            })
        });
        
        const judgeResult = await judgeResponse.json();
        console.log('Judge0 API Status:', judgeResponse.status);
        console.log('Judge0 API Response:', judgeResult);
        
        if (judgeResult.success && judgeResult.test_results) {
            console.log('✅ Judge0 API working with test cases');
            console.log('Test results:', judgeResult.test_results);
        } else {
            console.log('❌ Judge0 API failed');
        }
        
    } catch (error) {
        console.log('❌ Judge0 API error:', error.message);
    }
}

// Run the test
testExamIntegration().catch(console.error);

import runCode from './src/utils/judge0.js';

async function testJudge0() {
    try {
        console.log('Testing Judge0 API...');
        const result = await runCode('console.log("Hello World!");', 63);
        console.log('Judge0 API response:', result);
    } catch (error) {
        console.error('Judge0 API error:', error.message);
    }
}

testJudge0();

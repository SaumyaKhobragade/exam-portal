import axios from 'axios';

const JUDGE0_URL = 'https://ce.judge0.com/submissions/?base64_encoded=false&wait=true';

async function runCode(source_code, language_id, stdin = '') {
  const response = await axios.post(
    JUDGE0_URL,
    {
      source_code,
      language_id,
      stdin
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

export default runCode;

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const result = await runCode('print("Hello, World!")', 71);
      console.log('Judge0 API response:', result);
    } catch (error) {
      console.error('Judge0 API error:', error.message);
    }
  })();
}
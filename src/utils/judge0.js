import axios from 'axios';
import https from 'https';

const JUDGE0_URL = 'https://ce.judge0.com/submissions/?base64_encoded=false&wait=true';

// Create an axios instance with SSL verification disabled for Judge0
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

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
      },
      httpsAgent: httpsAgent // Disable SSL verification for Judge0
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
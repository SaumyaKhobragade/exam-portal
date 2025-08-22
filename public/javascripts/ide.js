// Basic IDE integration for Judge0 API

document.addEventListener('DOMContentLoaded', function () {
  const runBtn = document.querySelector('.run-btn');
  const codeInput = document.querySelector('.code-editor');
  const langSelect = document.getElementById('language-select');
  const consoleOutput = document.querySelector('.console-output');

  if (runBtn) {
    runBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      if (consoleOutput) {
        consoleOutput.innerHTML = '<div class="console-line">Running code...</div>';
      }
      const source_code = codeInput.value;
      const language_id = langSelect.value;
      // Optionally, get stdin from a field if you have one
      let stdin = '';
      const stdinInput = document.getElementById('stdin-input');
      if (stdinInput) stdin = stdinInput.value;
      try {
        const res = await fetch('/api/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source_code, language_id, stdin })
        });
        const data = await res.json();
        let result = data.stdout || data.stderr || data.compile_output || 'No output.';
        if (consoleOutput) {
          consoleOutput.innerHTML += `<div class="console-line">${result}</div><div class="console-cursor">&gt;</div>`;
        }
      } catch (err) {
        if (consoleOutput) {
          consoleOutput.innerHTML += `<div class="console-line">Error: ${err.message}</div><div class="console-cursor">&gt;</div>`;
        }
      }
    });
  }
});

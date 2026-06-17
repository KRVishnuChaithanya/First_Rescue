const fs = require('fs');
const raw = fs.readFileSync('C:/Users/HP/.gemini/antigravity-ide/brain/ae0dbf03-ca32-4a7e-97e2-a2a0541f72e9/.system_generated/steps/216/content.md', 'utf8');
const jsonStart = raw.indexOf('{"total_count"');
const jsonStr = raw.slice(jsonStart).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
try {
  const data = JSON.parse(jsonStr);
  const job = data.jobs[0];
  console.log('=== JOB:', job.name, '| Result:', job.conclusion, '===\n');
  job.steps.forEach(s => {
    const icon = s.conclusion === 'success' ? '✅' : s.conclusion === 'failure' ? '❌' : '⏭';
    console.log(icon, 'Step', s.number + ':', s.name, '->', s.conclusion);
  });
} catch(e) {
  // fallback: grep for step names and conclusions
  const pattern = /"name":"([^"]+)","status":"([^"]+)","conclusion":"([^"]+)","number":(\d+)/g;
  let m;
  while ((m = pattern.exec(jsonStr)) !== null) {
    const icon = m[3] === 'success' ? 'OK' : m[3] === 'failure' ? 'FAIL' : 'SKIP';
    console.log('[' + icon + '] Step ' + m[4] + ': ' + m[1]);
  }
}

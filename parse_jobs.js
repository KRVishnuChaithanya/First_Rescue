const fs = require('fs');

try {
  const raw = fs.readFileSync('run_jobs.json', 'utf8');
  const data = JSON.parse(raw);
  data.jobs.forEach((job) => {
    console.log(`Job: ${job.name} | Status: ${job.status} | Conclusion: ${job.conclusion}\n`);
    console.log('Steps:');
    job.steps.forEach((step) => {
      const icon = step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : '⏭';
      console.log(`${icon} Step ${step.number}: ${step.name} (${step.status} / ${step.conclusion})`);
    });
  });
} catch (e) {
  console.error('Error parsing run_jobs.json:', e);
}

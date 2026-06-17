const fs = require('fs');

try {
  const raw = fs.readFileSync('runs.json', 'utf8');
  const data = JSON.parse(raw);
  console.log(`Found ${data.workflow_runs.length} runs:\n`);
  data.workflow_runs.forEach((run, i) => {
    console.log(`[${i + 1}] ID: ${run.id}`);
    console.log(`    Name: ${run.name}`);
    console.log(`    Event: ${run.event}`);
    console.log(`    Status/Conclusion: ${run.status} / ${run.conclusion}`);
    console.log(`    Commit: ${run.head_sha} - ${run.head_commit.message.trim()}`);
    console.log(`    Created: ${run.created_at}`);
    console.log(`    URL: ${run.html_url}`);
    console.log('------------------------------------------------');
  });
} catch (e) {
  console.error('Error parsing runs.json:', e);
}

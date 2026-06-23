const fs = require('fs');
const path = require('path');

function parseResults() {
  const reportPath = path.join(process.cwd(), 'load-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error('No load-report.json found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const aggregate = data.aggregate;

  const totalRequests = aggregate.counters['http.requests'] || 0;
  const okRequests = aggregate.counters['http.codes.200'] || 0;
  const errors = aggregate.counters['errors'] || 0;
  
  const p95 = aggregate.summaries['http.response_time']?.p95 || 0;
  const p99 = aggregate.summaries['http.response_time']?.p99 || 0;
  const median = aggregate.summaries['http.response_time']?.median || 0;
  const rps = aggregate.rates['http.request_rate'] || 0;

  const successRate = totalRequests > 0 ? Math.round((okRequests / totalRequests) * 100) : 0;

  // Print to console in a clean format
  console.log("============================= load session starts ==============================");
  console.log(`Target: ${data.config?.target || 'unknown'}`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Errors: ${errors}`);
  console.log(`Throughput: ${rps.toFixed(2)} req/s`);
  console.log(`Response Time (p95): ${p95} ms`);
  console.log(`Response Time (p99): ${p99} ms`);
  console.log(`Response Time (median): ${median} ms`);
  console.log("============================== load session ends ===============================");

  // Write a markdown report for GitHub Actions Step Summary
  const mdReport = `
### 🚀 Load Testing Results (Artillery)
**Target:** \`${data.config?.target}\`

| Metric | Value |
|--------|-------|
| 🟢 Success Rate | **${successRate}%** (${okRequests}/${totalRequests}) |
| 🔴 Errors | ${errors} |
| ⚡ Throughput | ${rps.toFixed(2)} req/s |
| ⏱️ Response (p95) | ${p95} ms |
| ⏱️ Response (p99) | ${p99} ms |
| ⏱️ Response (median)| ${median} ms |
`;

  fs.writeFileSync(path.join(process.cwd(), 'load-report.md'), mdReport);
}

parseResults();

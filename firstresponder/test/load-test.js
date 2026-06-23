const http = require('http');
const fs = require('fs');

const TARGET_URL = 'http://localhost:5173/';
const DURATION_SEC = 15;
const PRE_WARM_SEC = 15;
const CONCURRENCY = 100;

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

let totalRequests = 0;
let totalErrors = 0;
let activeRequests = 0;
const responseTimes = [];

let startTime = 0;
let lastIntervalReqs = 0;

async function checkServer() {
  console.log('Checking server status...');
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(TARGET_URL, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) resolve();
          else reject();
        });
        req.on('error', reject);
      });
      console.log('[V] Server is reachable!');
      return;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

function sendRequest() {
  const reqStart = Date.now();
  activeRequests++;
  
  const req = http.get(TARGET_URL, { agent }, (res) => {
    res.on('data', () => {}); // Consume data to free memory
    res.on('end', () => {
      activeRequests--;
      totalRequests++;
      responseTimes.push(Date.now() - reqStart);
      if (res.statusCode >= 400) totalErrors++;
      if (Date.now() - startTime < DURATION_SEC * 1000) sendRequest();
    });
  });
  
  req.on('error', () => {
    activeRequests--;
    totalRequests++;
    totalErrors++;
    responseTimes.push(Date.now() - reqStart);
    if (Date.now() - startTime < DURATION_SEC * 1000) sendRequest();
  });
}

async function runLoadTest() {
  console.log(`Waiting ${PRE_WARM_SEC}s for server cache to pre-warm (Firestore boot fetch)...`);
  await new Promise(r => setTimeout(r, PRE_WARM_SEC * 1000));
  
  console.log('[V] Cache should be warm. Starting load test!');
  console.log('Load test started...');
  
  startTime = Date.now();
  
  // Kick off concurrent requests
  for (let i = 0; i < CONCURRENCY; i++) {
    sendRequest();
  }
  
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed++;
    const left = DURATION_SEC - elapsed;
    const reqsThisInterval = totalRequests - lastIntervalReqs;
    const rps = reqsThisInterval.toFixed(1);
    const errRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : "0.0";
    
    console.log(`${elapsed}s elapsed | ${left}s left | ${totalRequests} reqs | ${rps} RPS | ${errRate}% errors`);
    
    lastIntervalReqs = totalRequests;
    
    if (elapsed >= DURATION_SEC) {
      clearInterval(interval);
      finishTest();
    }
  }, 1000);
}

function finishTest() {
  console.log('[V] Load test complete!');
  
  // Generate basic CSV
  fs.writeFileSync('load_report.csv', 'timestamp,response_time_ms\n');
  const csvData = responseTimes.slice(0, 1000).map(t => `${Date.now()},${t}`).join('\n'); // save a sample to not blow up file size
  fs.appendFileSync('load_report.csv', csvData + '\n');
  
  console.log('Saved CSV Report to load_report.csv');
  console.log('--------------------------------------------------');
  console.log('                 FINAL RESULTS');
  console.log('--------------------------------------------------');
  
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const sorted = responseTimes.sort((a, b) => a - b);
  const min = sorted[0] || 0;
  const max = sorted[sorted.length - 1] || 0;
  const med = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  
  const actualDuration = (Date.now() - startTime) / 1000;
  const finalRps = (totalRequests / actualDuration).toFixed(1);
  const finalErr = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : "0.0";
  
  console.log(`Total Requests: ${totalRequests} requests`);
  console.log(`Average Response Time: ${avg.toFixed(1)}ms`);
  console.log(`Min: ${min}ms | Med: ${med}ms | Max: ${max}ms`);
  console.log(`p(90): ${p90}ms | p(95): ${p95}ms`);
  console.log(`Request Rate: ${finalRps} RPS`);
  console.log(`Error Rate: ${finalErr}%`);
  
  // Also create a Markdown summary for GitHub Actions
  const mdReport = `
### 🚀 Load Testing Results
**Target:** \`${TARGET_URL}\`

| Metric | Value |
|--------|-------|
| 🟢 Total Requests | **${totalRequests}** |
| 🔴 Error Rate | ${finalErr}% |
| ⚡ Request Rate | ${finalRps} RPS |
| ⏱️ Avg Response | ${avg.toFixed(1)}ms |
| ⏱️ Response (p95) | ${p95}ms |
| ⏱️ Response (Max)| ${max}ms |
`;
  fs.writeFileSync('load-report.md', mdReport);
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

async function main() {
  await checkServer();
  await runLoadTest();
}

main();

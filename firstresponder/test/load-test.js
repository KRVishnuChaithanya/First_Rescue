const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const DURATION_SEC = 100;
const PRE_WARM_SEC = 15;
const CONCURRENCY = 100;

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

const endpoints = [
  { name: 'Homepage', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Registration', path: '/register' },
  { name: 'Hospital Search', path: '/hospitals' },
  { name: 'SOS Alert', path: '/sos' },
  { name: 'Citizen Profile', path: '/citizen-profile' }
];

const stats = endpoints.map(ep => ({
  ...ep,
  requests: 0,
  errors: 0,
  responseTimes: []
}));

let totalRequests = 0;
let totalErrors = 0;
let activeRequests = 0;
let startTime = 0;
let lastIntervalReqs = 0;

async function checkServer() {
  console.log('Checking server status...');
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(BASE_URL + '/', (res) => {
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
  
  // Randomly select an endpoint to hit
  const epIndex = Math.floor(Math.random() * endpoints.length);
  const ep = stats[epIndex];
  
  const reqUrl = BASE_URL + ep.path;
  const req = http.get(reqUrl, { agent }, (res) => {
    res.on('data', () => {}); // Consume data to free memory
    res.on('end', () => {
      activeRequests--;
      totalRequests++;
      ep.requests++;
      
      const duration = Date.now() - reqStart;
      ep.responseTimes.push(duration);
      
      if (res.statusCode >= 400 && res.statusCode !== 404) {
        totalErrors++;
        ep.errors++;
      }
      
      if (Date.now() - startTime < DURATION_SEC * 1000) sendRequest();
    });
  });
  
  req.on('error', () => {
    activeRequests--;
    totalRequests++;
    totalErrors++;
    ep.requests++;
    ep.errors++;
    
    const duration = Date.now() - reqStart;
    ep.responseTimes.push(duration);
    
    if (Date.now() - startTime < DURATION_SEC * 1000) sendRequest();
  });
}

async function runLoadTest() {
  console.log(`Waiting ${PRE_WARM_SEC}s for server cache to pre-warm (Firestore boot fetch)...`);
  await new Promise(r => setTimeout(r, PRE_WARM_SEC * 1000));
  
  console.log('[V] Cache should be warm. Starting load test!');
  console.log('🚀 Load test started...');
  
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
  console.log('\n[V] Load test complete!\n');
  
  // Calculate global stats
  const allResponseTimes = stats.flatMap(s => s.responseTimes);
  const avg = allResponseTimes.length > 0 ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0;
  const sorted = allResponseTimes.sort((a, b) => a - b);
  const min = sorted[0] || 0;
  const max = sorted[sorted.length - 1] || 0;
  const med = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  
  const actualDuration = (Date.now() - startTime) / 1000;
  const finalRps = (totalRequests / actualDuration).toFixed(1);
  const finalErr = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : "0.0";
  
  console.log('--------------------------------------------------');
  console.log('                 FINAL RESULTS');
  console.log('--------------------------------------------------\n');
  
  console.log(`Test Duration      : ${actualDuration.toFixed(1)}s`);
  console.log(`Virtual Users      : ${CONCURRENCY}`);
  console.log(`Total Requests     : ${totalRequests}`);
  console.log(`Successful Requests: ${totalRequests - totalErrors}`);
  
  console.log(`\nAverage Response Time: ${avg.toFixed(1)}ms`);
  console.log(`Min: ${min}ms | Med: ${med}ms | Max: ${max}ms`);
  console.log(`p(90): ${p90}ms | p(95): ${p95}ms`);
  console.log(`Request Rate: ${finalRps} RPS`);
  console.log(`Error Rate: ${finalErr}%\n`);
  
  // Print Per-Endpoint Breakdown (console)
  console.log('ENDPOINT BREAKDOWN');
  console.log('Endpoint Name'.padEnd(30) + '| Requests | Avg Time   | p95 Time   | Error Rate');
  console.log('--------------------------------------------------------------------------------');
  
  let mdTableRows = '';
  for (const stat of stats) {
    const epReqs = stat.requests;
    const epAvg = epReqs > 0 ? (stat.responseTimes.reduce((a, b) => a + b, 0) / epReqs).toFixed(1) : "0.0";
    const epSorted = stat.responseTimes.sort((a, b) => a - b);
    const epP95 = epReqs > 0 ? epSorted[Math.floor(epSorted.length * 0.95)] : 0;
    const epErr = epReqs > 0 ? ((stat.errors / epReqs) * 100).toFixed(1) + '%' : '0.0%';
    
    const endpointName = `${stat.name} (${stat.path})`;
    
    console.log(
      endpointName.padEnd(30) + '| ' +
      epReqs.toString().padEnd(9) + '| ' +
      `${epAvg} ms`.padEnd(11) + '| ' +
      `${epP95.toFixed(1)} ms`.padEnd(11) + '| ' +
      epErr
    );
    
    mdTableRows += `| ${endpointName} | ${epReqs} | ${epAvg} ms | ${epP95.toFixed(1)} ms | ${epErr} |\n`;
  }
  
  // Generate Markdown summary for GitHub Actions
  const mdReport = `
### 🚀 Load Testing Results
**Target:** \`${BASE_URL}\`

| Metric | Value |
|--------|-------|
| 🟢 Total Requests | **${totalRequests}** |
| 🔴 Error Rate | ${finalErr}% |
| ⚡ Request Rate | ${finalRps} RPS |
| ⏱️ Avg Response | ${avg.toFixed(1)}ms |
| ⏱️ Response (p95) | ${p95}ms |
| ⏱️ Response (Max)| ${max}ms |

#### 📊 Per-Endpoint Breakdown

| Endpoint | Reqs | Avg(ms) | P95(ms) | Err% |
|----------|------|---------|---------|------|
${mdTableRows.trim()}
`;
  fs.writeFileSync('load-report.md', mdReport);
  
  // Save basic CSV report
  fs.writeFileSync('load_report.csv', 'timestamp,response_time_ms\n');
  const csvData = allResponseTimes.slice(0, 1000).map(t => `${Date.now()},${t}`).join('\n');
  fs.appendFileSync('load_report.csv', csvData + '\n');
  
  console.log('\nGenerating CSV report...');
  console.log('CSV report saved to load_report.csv\n');
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

async function main() {
  await checkServer();
  await runLoadTest();
}

main();

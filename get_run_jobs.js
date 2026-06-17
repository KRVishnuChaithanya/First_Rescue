const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'api.github.com',
  path: '/repos/KRVishnuChaithanya/First_Rescue/actions/runs/27668505125/jobs',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('run_jobs.json', data);
    console.log('Done! Status:', res.statusCode);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
